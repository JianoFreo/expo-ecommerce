import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import { Activity } from "../models/activity.model.js";

function getProductIdFromItem(item) {
    if (!item) return null;
    if (typeof item.product === 'string') return item.product;
    if (item.product && typeof item.product === 'object' && item.product._id) {
        return item.product._id.toString();
    }
    return null;
}

export async function createOrder(req, res) {
    try {
        const user = req.user;
        const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ error: "No order items" });
        }

        if (!shippingAddress) {
            return res.status(400).json({ error: "Shipping address is required" });
        }

        // Validate required shipping address fields
        const requiredFields = ['fullName', 'streetAddress', 'city', 'state', 'zipCode', 'phoneNumber'];
        for (const field of requiredFields) {
            if (!shippingAddress[field]) {
                return res.status(400).json({ error: `Shipping address: ${field} is required` });
            }
        }

        // normalize and validate order items (support item.product as object or string id)
        const normalizedItems = [];
        for (const item of orderItems) {
            const productId = getProductIdFromItem(item);
            const quantity = Number(item?.quantity || 0);
            const price = Number(item?.price || 0);

            if (!productId) {
                return res.status(400).json({ error: "Invalid order item: missing product id" });
            }
            if (!Number.isFinite(quantity) || quantity < 1) {
                return res.status(400).json({ error: "Invalid order item quantity" });
            }
            if (!Number.isFinite(price) || price < 0) {
                return res.status(400).json({ error: "Invalid order item price" });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ error: `Product ${item?.name || productId} not found` });
            }
            if (product.stock < quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }

            normalizedItems.push({
                product: product._id,
                name: item?.name || product.name,
                price,
                quantity,
                image: item?.image || product.images?.[0] || "",
            });
        }

        const order = await Order.create({
            user: user._id,
            clerkId: user.clerkId,
            orderItems: normalizedItems,
            shippingAddress,
            paymentResult: paymentResult || {},
            totalPrice,
        });

        await Activity.create({
            type: 'order_created',
            user: user._id,
            order: order._id,
            description: `${user.name} created order ${order._id.toString()}`,
            metadata: { totalPrice, itemCount: orderItems.length },
        });

        // update product stock by ordered quantities
        for (const item of normalizedItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity },
            });
        }

        res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
        console.error("Error in createOrder controller:", error.message || error);
        const errorMessage = error.message || "Internal server error";
        res.status(500).json({ error: errorMessage });
    }
}

export async function getUserOrders(req, res) {
    try {
        // Fetch by either internal user id or clerk id for legacy compatibility
        const orders = await Order.find({
            $or: [
                { user: req.user._id },
                { clerkId: req.user.clerkId },
            ],
        })
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

export async function getUserOrderById(req, res) {
    try {
        const { orderId } = req.params;
        const order = await Order.findOne({
            _id: orderId,
            $or: [
                { user: req.user._id },
                { clerkId: req.user.clerkId },
            ],
        })
            .populate({
                path: "orderItems.product",
                populate: {
                    path: "shop",
                    populate: {
                        path: "owner",
                        select: "name email imageUrl",
                    },
                },
            });

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        const orderObject = order.toObject();
        return res.status(200).json({ order: orderObject });
    } catch (error) {
        console.error("Error in getUserOrderById controller:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}