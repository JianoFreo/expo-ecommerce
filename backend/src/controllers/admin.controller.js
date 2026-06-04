import cloudinary from '../config/cloudinary.js';
import { Product } from '../models/product.model.js';
import { Order } from '../models/order.model.js';
import { User } from '../models/user.model.js';
import { Shop } from '../models/shop.model.js';
import { Activity } from '../models/activity.model.js';
import { ENV } from '../config/env.js';

const SUPER_ADMIN_EMAIL = (ENV.ADMIN_EMAIL || 'magtangob65@gmail.com').toLowerCase();
const MIGRATED_SELLER_EMAIL = 'jianofreomagtangob@gmail.com'.toLowerCase();

async function logActivity(payload) {
    try {
        await Activity.create(payload);
    } catch (error) {
        console.error('Error creating activity log:', error);
    }
}

async function getPlatformStoreShop() {
    let shop = await Shop.findOne({ name: 'Platform Store' }).populate('owner', 'name email');

    if (shop) {
        return shop;
    }

    const adminUser = await User.findOne({ email: 'magtangob65@gmail.com' });
    if (!adminUser) {
      return null;
    }

    shop = await Shop.create({
      name: 'Platform Store',
      description: 'Default marketplace shop for existing products',
      owner: adminUser._id,
    });

    return shop.populate('owner', 'name email');
}

async function getShopOwnerByEmail(email) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return null;

    return Shop.findOne({ owner: user._id }).populate('owner', 'name email imageUrl');
}

async function ensureSellerTargetShop() {
    let targetShop = await getShopOwnerByEmail(MIGRATED_SELLER_EMAIL);

    if (targetShop) {
        return targetShop;
    }

    const targetUser = await User.findOne({ email: MIGRATED_SELLER_EMAIL });
    if (!targetUser) return null;

    targetShop = await Shop.create({
        name: 'Jianofreomagtangob Shop',
        description: 'Migrated shop for seller products',
        owner: targetUser._id,
    });

    return targetShop.populate('owner', 'name email imageUrl');
}

export async function createProduct(req, res) {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

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

        const product = await Product.create({
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            category,
            images: imageUrls,
        });

        // Auto-assign product to the creator's shop. If they do not have one yet,
        // fall back to the platform store so every product always has a seller.
        let shop = await Shop.findOne({ owner: req.user._id });
        if (!shop) {
            shop = await getPlatformStoreShop();
        }

        if (shop) {
            product.shop = shop._id;
            await product.save();
        }

        await logActivity({
            type: 'product_added',
            user: req.user._id,
            shop: product.shop || null,
            product: product._id,
            description: `${req.user.name} added product ${product.name}`,
            metadata: { productName: product.name, category: product.category },
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
        const products = await Product.find().populate({ path: 'shop', populate: { path: 'owner', select: 'name email' } }).sort({ createdAt: -1 });
        let defaultShop = null;

        if (products.some((product) => !product.shop)) {
            defaultShop = await getPlatformStoreShop();
        }

        const normalizedProducts = products.map((product) => ({
            ...product.toObject(),
            shop: product.shop || defaultShop || null,
        }));
        res.status(200).json(normalizedProducts);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getAllShopsAdmin(req, res) {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const shops = await Shop.find()
            .populate('owner', 'name email imageUrl role')
            .sort({ createdAt: -1 });

        const shopsWithCounts = await Promise.all(
            shops.map(async (shop) => {
                const productCount = await Product.countDocuments({ shop: shop._id });
                return {
                    ...shop.toObject(),
                    productCount,
                };
            })
        );

        res.status(200).json({ shops: shopsWithCounts });
    } catch (error) {
        console.error('Error fetching all shops:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function updateShopAdmin(req, res) {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { id } = req.params;
        const shop = await Shop.findById(id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        const { name, description, bannerImage, isActive } = req.body;
        if (name !== undefined) shop.name = name;
        if (description !== undefined) shop.description = description;
        if (bannerImage !== undefined) shop.bannerImage = bannerImage;
        if (isActive !== undefined) shop.isActive = isActive === true || isActive === 'true';

        await shop.save();
        await shop.populate('owner', 'name email imageUrl role');

        res.status(200).json({ shop });
    } catch (error) {
        console.error('Error updating shop:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function deleteShopAdmin(req, res) {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const { id } = req.params;
        const shop = await Shop.findById(id);
        if (!shop) return res.status(404).json({ message: 'Shop not found' });

        const platformStore = await getPlatformStoreShop();
        if (platformStore) {
            await Product.updateMany({ shop: shop._id }, { shop: platformStore._id });
        }

        await Shop.findByIdAndDelete(id);
        res.status(200).json({ message: 'Shop deleted successfully' });
    } catch (error) {
        console.error('Error deleting shop:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function migrateMagtangobProductsToJiano(req, res) {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const sourceUser = await User.findOne({ email: SUPER_ADMIN_EMAIL });
        if (!sourceUser) return res.status(404).json({ message: 'Source admin user not found' });

        const targetShop = await ensureSellerTargetShop();
        if (!targetShop) return res.status(404).json({ message: 'Target seller or target shop not found' });

        const sourceShops = await Shop.find({ owner: sourceUser._id });
        if (sourceShops.length === 0) {
            return res.status(200).json({ message: 'No source shops found to migrate', migratedCount: 0, targetShop });
        }

        const sourceShopIds = sourceShops.map((shop) => shop._id);
        const result = await Product.updateMany({ shop: { $in: sourceShopIds } }, { shop: targetShop._id });

        await Shop.deleteMany({ _id: { $in: sourceShopIds } });

        await logActivity({
            type: 'products_migrated',
            user: req.user._id,
            shop: targetShop._id,
            description: `${req.user.name} migrated ${result.modifiedCount} products from ${SUPER_ADMIN_EMAIL} to ${MIGRATED_SELLER_EMAIL}`,
            metadata: { migratedCount: result.modifiedCount, targetShopId: targetShop._id.toString() },
        });

        res.status(200).json({
            message: 'Products migrated successfully',
            migratedCount: result.modifiedCount,
            targetShop,
        });
    } catch (error) {
        console.error('Error migrating magtangob products:', error);
        res.status(500).json({ message: 'Internal server error' });
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
        if (price !== undefined) product.price = parseFloat(price); // if price is 0, it will be treated as falsy value, so we need to check if it is undefined instead of just checking if it is truthy
        if (stock !== undefined) product.stock = parseInt(stock);
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
        const orders = await Order.find()
            .populate("user", "name email imageUrl")
            .populate({
                path: "orderItems.product",
                populate: {
                    path: "shop",
                    populate: {
                        path: "owner",
                        select: "name email imageUrl",
                    },
                },
            })
            .sort({ createdAt: -1 });
        res.status(200).json({ orders });

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
    }
    catch (error) {
        console.error("Error in getAllOrders controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getOrderByIdAdmin(req, res) {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId)
            .populate("user", "name email imageUrl clerkId")
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
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({ order });
    } catch (error) {
        console.error("Error fetching admin order by id:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

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

        if (!["pending", "shipped", "delivered"].includes(status)) { // if status is not one of the allowed values, return an error
            return res.status(400).json({ message: "Invalid status value" });
        }
        const order = await Order.findById(orderId);
        // SELECT *
        // FROM orders
        // WHERE id = 'orderId';
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

export async function getAllCustomers(req, res) {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        const customers = await User.find().sort({ createdAt: -1 }); // exclude password from the response
        res.status(200).json({ customers });
    } catch (error) {
        console.error("Error in getAllCustomers controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getDashboardStats(req, res) {
    try {
        const revenueResult = await Order.aggregate([
            // aggregate is used to perform complex queries on the database, 
            // in this case we are calculating the total revenue by summing up the totalPrice of all orders
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalPrice" },
                }
            },
        ]);
        const totalOrders = await Order.countDocuments(); // count the total number of orders in the database
        const totalCustomers = await User.countDocuments(); // count the total number of customers in the database
        const totalProducts = await Product.countDocuments(); // count the total number of products in the database
        const totalRevenue = revenueResult[0]?.total || 0;
        // if there are no orders, then the total revenue will be 0, 
        // otherwise it will be the total revenue calculated from the aggregate query

        res.status(200).json({
            totalOrders,
            totalRevenue,
            totalCustomers,
            totalProducts
        });

    } catch (error) {
        console.error("Error in getDashboardStats controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
            const deletePromises = product.images.map((imageUrl) => {
                // Extract public_id from URL (assumes format: .../products/publicId.ext)
                const publicId = "products/" + imageUrl.split("/products/")[1]?.split(".")[0];
                if (publicId) return cloudinary.uploader.destroy(publicId);
            });
            await Promise.all(deletePromises.filter(Boolean));
        }

        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Failed to delete product" });
    }
};

export async function migrateProductsToDefaultShop(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // Find or create a "Platform Store" shop for existing products
    let shop = await Shop.findOne({ name: "Platform Store" });
    if (!shop) {
            shop = await getPlatformStoreShop();
            if (!shop) return res.status(404).json({ message: "Admin user not found" });
    }

    // Assign all products without a shop to this default shop
    const result = await Product.updateMany(
      { shop: null },
      { shop: shop._id }
    );

    res.status(200).json({
      message: `Migration successful. Updated ${result.modifiedCount} products.`,
      shop,
    });
  } catch (error) {
    console.error("Error migrating products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAllUsers(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const users = await User.find().select('-clerkId').sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function banUser(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBanned = true;
    user.bannedAt = new Date();
    user.bannedReason = reason || 'Account suspended by admin';
    await user.save();

        await logActivity({
            type: 'user_banned',
            user: req.user._id,
            description: `${req.user.name} banned ${user.name}`,
            metadata: { bannedUserId: user._id.toString(), reason: user.bannedReason },
        });

    res.status(200).json({ message: 'User banned successfully', user });
  } catch (error) {
    console.error('Error banning user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function unbanUser(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isBanned = false;
    user.bannedAt = null;
    user.bannedReason = '';
    await user.save();

        await logActivity({
            type: 'user_unbanned',
            user: req.user._id,
            description: `${req.user.name} unbanned ${user.name}`,
            metadata: { unbannedUserId: user._id.toString() },
        });

    res.status(200).json({ message: 'User unbanned successfully', user });
  } catch (error) {
    console.error('Error unbanning user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateUserRole(req, res) {
    try {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });

        const { userId } = req.params;
        const { role } = req.body;

        if (!userId) return res.status(400).json({ message: 'Missing userId' });
        if (!role) return res.status(400).json({ message: 'Missing role' });

        const allowed = ['customer', 'seller', 'super-admin'];
        if (!allowed.includes(role)) return res.status(400).json({ message: 'Invalid role' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent changing the platform super-admin's role accidentally
        if ((user.email || '').toLowerCase() === SUPER_ADMIN_EMAIL && role !== 'super-admin') {
            return res.status(400).json({ message: 'Cannot change the platform super-admin role' });
        }

        user.role = role;
        await user.save();

        await logActivity({
            type: 'user_role_changed',
            user: req.user._id,
            description: `${req.user.name} changed role for ${user.email} to ${role}`,
            metadata: { targetUserId: user._id.toString(), newRole: role },
        });

        res.status(200).json({ message: 'User role updated', user });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getRecentActivities(req, res) {
    try {
        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

        const activities = await Activity.find()
            .populate('user', 'name email imageUrl')
            .populate('shop', 'name owner')
            .populate('product', 'name images')
            .populate('order', 'totalPrice status createdAt')
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({ activities });
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
