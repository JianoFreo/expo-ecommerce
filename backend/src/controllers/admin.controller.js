import cloudinary from '../config/cloudinary.js';
import { Product } from '../models/product.model.js';
import { Order } from '../models/order.model.js';

export async function createProduct(req, res) {
    try {
        const { name, description, price, stock, category } = req.body;

        if (!name || !description || !price || !stock || !category) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one image is required" });
        }
        if (req.files.length > 3) {
            return res.status(400).json({ message: "Maximum 3 images allowed" });
        }
        const uploadPromises = req.files.map((file) => {
            return cloudinary.uploader.upload(file.path, {
                folder: "products",
            });
        });
        const uploadResults = await Promise.all(uploadPromises);
        // secure_url is the url of the uploaded image in cloudinary
        const imageUrls = uploadResults.map((result) => result.secure_url);

        const product = new Product({
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            category,
            images: imageUrls
        });

        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getAllProducts(_, res) {
    try {
        // -1 means sort in descending order: most recent product first
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json({ products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
export async function updateProduct(req, res) {
    try {
        const { id } = req.params; // req.params comes from ap endpopints eg. /api/products/:id
        const { name, description, price, stock, category } = req.body; // req.body comes from the frontend form data or the json data sent in the request

        const product = await Product.findById(id);

        if (!product) { // if product with the given id is not found in the database
            return res.status(404).json({ message: "Product not found" });
        }

        // if the user only wants to update the price, 
        // then only the price will be updated and the rest of the fields will remain the same
        // or undefined so they wont run

        if (name) product.name = name;
        if (description) product.description = description;
        if (price) product.price = parseFloat(price);
        if (stock) product.stock = parseInt(stock);
        if (category) product.category = category;

        //handle image updates if there are any new images uploaded
        if (req.files && req.files.length > 0) {
            if (req.files.length > 3) {
                return res.status(400).json({ message: "Maximum 3 images allowed" });
            }
            const uploadPromises = req.files.map((file) => {
                return cloudinary.uploader.upload(file.path, {
                    folder: "products",
                });
            });
            const uploadResults = await Promise.all(uploadPromises);
            product.images = uploadResults.map((result) => result.secure_url); // replace the old images with the new ones
        }
        await product.save()
        res.status(200).json(product)

    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getAllOrders(req, res) {
    try {
        const orders = await (await Order.find())
            .populate("user", "name email") // is used to populate the user field in the order with the name and email of the user who placed the order.
            //“Take the user ObjectId in the order, go to the User collection, find that document, and only return name and email.”
            //SELECT name, email FROM users WHERE _id = order.user
            .populate("orderItems.product", "name price") // is used to populate the product field in the order with the name and price of the product that was ordered.
            .sort({ createdAt: -1 }); // -1 means sort in descending order: most recent order first
        res.status(200).json({ orders });
    }
    catch (error) {
        console.error("Error in getAllOrders controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

// SELECT 
//     o.*,
//     u.name AS user_name,
//     u.email AS user_email,
//     p.name AS product_name,
//     p.price AS product_price
// FROM orders o
// JOIN users u ON o.user_id = u.id
// JOIN order_items oi ON oi.order_id = o.id
// JOIN products p ON oi.product_id = p.id
// ORDER BY o.created_at DESC;

export async function updateOrderStatus(req, res) {
    try {
        const { orderId } = req.params;
// app.get("/orders/:orderId", (req, res) => {
//   const { orderId } = req.params;

//   res.json({
//     message: "Order fetched",
//     orderId
//   });
// });
        const { status } = req.body;

        if (!["pending", "shipped", "delivered"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        order.status = status;
        if (status === "shipped" && !order.shippedAt) {
            order.shippedAt = new Date();
        }
        if (status === "delivered" && !order.deliveredAt) {
            order.deliveredAt = new Date();
        }
        await order.save();
        res.status(200).json({ message: "Order status updated successfully", order });


    } catch (error) {
        console.error("Error in updateOrderStatus controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}