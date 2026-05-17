import { Review } from "../models/review.model.js";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";

export async function createReview(req, res) {
    try {
        const { productId, orderId, rating } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }
        const user = req.user; // from clerk middleware

        //verify is order exists and is delivered and belongs to the user
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        if (order.clerkId !== user.clerkId) {
            return res.status(403).json({ error: "Not authorized to create review for this order" });
        }
        if (order.status !== "delivered") {
            return res.status(400).json({ error: "Cannot review an order that has not been delivered" });
        }

        // verify if product is in the order
        const productInOrder = order.orderItems.find(
            (item) => item.product.toString() === productId.toString()
            // FOR each item IN order.orderItems
            //     IF item.product == productId
            //         RETURN item
            // STOP
            // RETURN undefined    

            //“Keep everything that is truthy.”
        );// will return a boolean if the product is in the order or not

        if (!productInOrder) {
            return res.status(400).json({ error: "Product not found in the order" });
        }

        // atomic update or create
        const review = await Review.findOneAndUpdate(
            { productId, userId: user._id },
            { rating, orderId, productId, userId: user._id },
            { new: true, upsert: true, runValidators: true }
        );

        // update the product rating with atomic aggregation
        const reviews = await Review.find({ productId });
        const totalRating = reviews.reduce((sum, rev) => sum + rev.rating, 0);
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                averageRating: totalRating / reviews.length,
                totalReviews: reviews.length,
            },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            await Review.findByIdAndDelete(review._id);
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(201).json({ message: "Review submitted successfully", review });
    } catch (error) {
        console.error("Error in createReview controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function deleteReview(req, res) {
    try {
        const { reviewId } = req.params;
        const user = req.user;
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }
        if (review.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ error: "Not authorized to delete this review" });
        }
        const productId = review.productId;
        await Review.findByIdAndDelete(reviewId);

        // update product rating
        const reviews = await Review.find({ productId });
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        await Product.findByIdAndUpdate(productId, {
            averageRating: reviews.length > 0 ? totalRating / reviews.length : 0,
            totalReviews: reviews.length,
        });
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error("Error in deleteReview controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}