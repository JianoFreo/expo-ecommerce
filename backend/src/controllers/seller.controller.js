import { Product } from '../models/product.model.js';
import { Order } from '../models/order.model.js';
import { Shop } from '../models/shop.model.js';
import { User } from '../models/user.model.js';

// Fallback emails used for migrated data
const SUPER_ADMIN_EMAIL = 'magtangob65@gmail.com'.toLowerCase();
const MIGRATED_SELLER_EMAIL = 'jianofreomagtangob@gmail.com'.toLowerCase();

function parseNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function getAccessibleShopIdsForSeller(user) {
  const ownShops = await Shop.find({ owner: user._id }).select('_id');
  if (ownShops.length > 0) {
    return ownShops.map((s) => s._id);
  }

  // Temporary fallback for migrated seller account
  if ((user.email || '').toLowerCase() === MIGRATED_SELLER_EMAIL) {
    const adminUser = await User.findOne({ email: SUPER_ADMIN_EMAIL });
    if (!adminUser) return [];
    const adminShops = await Shop.find({ owner: adminUser._id }).select('_id');
    return adminShops.map((s) => s._id);
  }

  return [];
}

function filterOrderToSellerItems(order, shopProductIds) {
  const sellerProductIdSet = new Set(shopProductIds.map((id) => id.toString()));
  const sellerItems = order.orderItems.filter((item) => {
    const itemProductId = item.product?._id?.toString?.() || (typeof item.product === 'string' ? item.product : item.product?.toString?.());
    return itemProductId && sellerProductIdSet.has(itemProductId);
  });

  return {
    ...order.toObject(),
    orderItems: sellerItems,
    totalPrice: Math.round(
      sellerItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0) * 100
    ) / 100,
  };
}

export async function getSellerProducts(req, res) {
  try {
    const user = req.user;

    const shopIds = await getAccessibleShopIdsForSeller(user);
    if (shopIds.length === 0) return res.status(200).json([]);

    const products = await Product.find({ shop: { $in: shopIds } })
      .populate({ path: 'shop', populate: { path: 'owner', select: 'name email' } })
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getSellerOrders(req, res) {
  try {
    const user = req.user;

    const shopIds = await getAccessibleShopIdsForSeller(user);
    if (shopIds.length === 0) return res.status(200).json([]);

    const productIds = await getShopProductIdsList(shopIds);
    const orders = await Order.find({ 'orderItems.product': { $in: productIds } })
      .populate('user', 'name email imageUrl')
      .populate({
        path: 'orderItems.product',
        populate: {
          path: 'shop',
          populate: {
            path: 'owner',
            select: 'name email imageUrl',
          },
        },
      })
      .sort({ createdAt: -1 });

    const sellerOrders = orders
      .map((order) => filterOrderToSellerItems(order, productIds))
      .filter((order) => order.orderItems.length > 0);

    res.status(200).json(sellerOrders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getSellerOrderById(req, res) {
  try {
    const user = req.user;
    const { orderId } = req.params;

    const shopIds = await getAccessibleShopIdsForSeller(user);
    if (shopIds.length === 0) return res.status(404).json({ message: 'Order not found' });

    const productIds = await getShopProductIdsList(shopIds);
    const order = await Order.findById(orderId)
      .populate('user', 'name email imageUrl clerkId')
      .populate({
        path: 'orderItems.product',
        populate: {
          path: 'shop',
          populate: {
            path: 'owner',
            select: 'name email imageUrl',
          },
        },
      });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const hasSellerItems = order.orderItems.some((item) =>
      productIds.some((productId) => productId.toString() === item.product?._id?.toString())
    );

    if (!hasSellerItems) return res.status(404).json({ message: 'Order not found' });

    return res.status(200).json({ order: filterOrderToSellerItems(order, productIds) });
  } catch (error) {
    console.error('Error fetching seller order by id:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getSellerStats(req, res) {
  try {
    const user = req.user;

    const shopIds = await getAccessibleShopIdsForSeller(user);
    if (shopIds.length === 0) {
      return res.status(200).json({ totalProducts: 0, totalOrders: 0, pendingOrders: 0, totalRevenue: 0 });
    }

    const totalProducts = await Product.countDocuments({ shop: { $in: shopIds } });
    const shopProductIds = await getShopProductIdsList(shopIds);
    const orders = await Order.find({ 'orderItems.product': { $in: shopProductIds } });

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    const totalRevenue = orders.reduce((sum, order) => {
      const sellerItems = order.orderItems.filter((item) => {
        const itemProductId = item.product?._id?.toString?.() || (typeof item.product === 'string' ? item.product : item.product?.toString?.());
        return itemProductId && shopProductIds.some((id) => id.toString() === itemProductId);
      });
      return sum + sellerItems.reduce((inner, item) => inner + item.price * item.quantity, 0);
    }, 0);

    res.status(200).json({
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    });
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getSellerAnalytics(req, res) {
  try {
    const user = req.user;

    const shopIds = await getAccessibleShopIdsForSeller(user);
    if (shopIds.length === 0) {
      return res.status(200).json({
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        conversionRate: 0,
      });
    }

    // Get shop product IDs for order filtering
    const shopProductIds = await getShopProductIdsList(shopIds);

    // Get completed orders
    const orders = await Order.find({ 'orderItems.product': { $in: shopProductIds } });

    // Calculate metrics
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === 'delivered').length;

    const totalSales = orders.reduce((sum, order) => {
      const shopItems = order.orderItems.filter((item) =>
        shopProductIds.some((id) => id.toString() === item.product.toString())
      );
      const itemsTotal = shopItems.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0);
      return sum + itemsTotal;
    }, 0);

    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const conversionRate = 0; // Placeholder - would need visitor tracking

    res.status(200).json({
      totalSales: Math.round(totalSales * 100) / 100,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      conversionRate,
    });
  } catch (error) {
    console.error('Error fetching seller analytics:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateSellerShop(req, res) {
  try {
    const user = req.user;
    const { name, description, bannerImage } = req.body;

    let shop = await Shop.findOne({ owner: user._id });
    if (!shop) {
      shop = await Shop.create({
        owner: user._id,
        name: name || `${user.name || 'Seller'}'s Shop`,
        description: description || '',
        bannerImage: bannerImage || '',
      });
    } else {
      if (name !== undefined) shop.name = name;
      if (description !== undefined) shop.description = description;
      if (bannerImage !== undefined) shop.bannerImage = bannerImage;
      await shop.save();
    }

    return res.status(200).json(shop);
  } catch (error) {
    console.error('Error updating seller shop:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createSellerProduct(req, res) {
  try {
    const user = req.user;
    const { name, description, category } = req.body;
    const price = parseNumber(req.body.price, NaN);
    const stock = parseNumber(req.body.stock, NaN);

    if (!name || !description || !category || Number.isNaN(price) || Number.isNaN(stock)) {
      return res.status(400).json({ message: 'name, description, category, price, and stock are required' });
    }

    let shop = await Shop.findOne({ owner: user._id });
    if (!shop) {
      shop = await Shop.create({ owner: user._id, name: `${user.name || 'Seller'}'s Shop`, description: '' });
    }

    // images may come as uploaded files (req.files) or as array of URLs in req.body.images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      // handle file uploads (multer saved files to disk)
      const cloudinary = (await import('../config/cloudinary.js')).default;
      const uploadPromises = req.files.map((file) => cloudinary.uploader.upload(file.path, { folder: 'products' }));
      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map((r) => r.secure_url);
    } else if (req.body.images) {
      // accept JSON array of image URLs
      try {
        imageUrls = Array.isArray(req.body.images) ? req.body.images : JSON.parse(req.body.images || '[]');
      } catch (e) {
        imageUrls = [];
      }
    }

    const product = await Product.create({
      name,
      description,
      category,
      price,
      stock,
      images: imageUrls,
      shop: shop._id,
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Error creating seller product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateSellerProduct(req, res) {
  try {
    const user = req.user;
    const { id } = req.params;

    const shopIds = await getAccessibleShopIdsForSeller(user);
    const product = await Product.findOne({ _id: id, shop: { $in: shopIds } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, category } = req.body;
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;

    // handle images: uploaded files (req.files) or array of URLs in req.body.images
    if (req.files && req.files.length > 0) {
      const cloudinary = (await import('../config/cloudinary.js')).default;
      const uploadPromises = req.files.map((file) => cloudinary.uploader.upload(file.path, { folder: 'products' }));
      const uploadResults = await Promise.all(uploadPromises);
      product.images = uploadResults.map((r) => r.secure_url);
    } else if (req.body.images) {
      try {
        product.images = Array.isArray(req.body.images) ? req.body.images : JSON.parse(req.body.images || '[]');
      } catch (e) {
        // ignore parse errors and leave images unchanged
      }
    }

    if (req.body.price !== undefined) {
      const price = parseNumber(req.body.price, NaN);
      if (Number.isNaN(price)) return res.status(400).json({ message: 'Invalid price' });
      product.price = price;
    }

    if (req.body.stock !== undefined) {
      const stock = parseNumber(req.body.stock, NaN);
      if (Number.isNaN(stock)) return res.status(400).json({ message: 'Invalid stock' });
      product.stock = stock;
    }

    await product.save();
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error updating seller product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function deleteSellerProduct(req, res) {
  try {
    const user = req.user;
    const { id } = req.params;

    const shopIds = await getAccessibleShopIdsForSeller(user);
    const product = await Product.findOne({ _id: id, shop: { $in: shopIds } });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.deleteOne({ _id: id });
    return res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting seller product:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const user = req.user;
    const { orderId } = req.params;
    const { status } = req.body;

    // Valid status transitions
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const shopIds = await getAccessibleShopIdsForSeller(user);
    if (shopIds.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const productIds = await getShopProductIdsList(shopIds);
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify this seller has items in this order
    const hasSellerItems = order.orderItems.some((item) => {
      const itemProductId = item.product?._id?.toString?.() || (typeof item.product === 'string' ? item.product : item.product?.toString?.());
      return itemProductId && productIds.some((id) => id.toString() === itemProductId);
    });

    if (!hasSellerItems) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Update order status
    order.status = status;
    if (status === 'shipped' && !order.shippedAt) {
      order.shippedAt = new Date();
    }
    if (status === 'delivered' && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    await order.save();
    
    return res.status(200).json({ 
      message: 'Order status updated successfully',
      order: {
        _id: order._id,
        status: order.status,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
      }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Helper to get product IDs for multiple shops
async function getShopProductIdsList(shopIds) {
  const products = await Product.find({ shop: { $in: shopIds } }).select('_id');
  return products.map((p) => p._id);
}
