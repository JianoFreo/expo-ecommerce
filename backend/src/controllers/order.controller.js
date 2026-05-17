import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";

export async function createOrder(req, res) {
    try {
        const user = req.user;
        const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ error: "No order items" });
        }

        // validate products and stock
        for (const item of orderItems) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.name} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }
        }

        const order = await Order.create({
            user: user._id,
            clerkId: user.clerkId,
            orderItems,
            shippingAddress,
            paymentResult,
            totalPrice,
        });

        // update product stock
        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity }, // decrement stock by quantity ordered -- babawasan ang stock per order item
            });
        }

        res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
        console.error("Error in createOrder controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

export async function getUserOrders(req, res) {
    try {
        // “Find all orders in the database that belong to this logged-in user.”
        // req.user.clerkId = who the user is (from login)
        // so you're filtering only their orders
        const orders = await Order.find({ clerkId: req.user.clerkId })
            .populate("orderItems.product")
            .sort({ createdAt: -1 });

        // check if each order has been reviewed

        const orderIds = orders.map((order) => order._id); //“Take only the IDs of all orders”
        const reviews = await Review.find({ orderId: { $in: orderIds } }); //“Find all reviews where the orderId is in that list of order IDs”
        const reviewedOrderIds = new Set(reviews.map((review) => review.orderId.toString()));

        const ordersWithReviewStatus = await Promise.all(
            orders.map(async (order) => {
                return {
                    ...order.toObject(), 
                    // toObject is used to convert the Mongoose document into a plain JavaScript object,
                    //  which allows us to use the spread operator to add new properties
                    hasReviewed: reviewedOrderIds.has(order._id.toString()), // returns True or false
                };
            })
        );
        // conceptually it’s similar to a for loop, 
        // but it behaves differently and is 
        // used for a different purpose

        res.status(200).json({ orders: ordersWithReviewStatus });
    } catch (error) {
        console.error("Error in getUserOrders controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}