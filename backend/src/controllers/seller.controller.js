import { Product } from '../models/product.model.js';
import { Order } from '../models/order.model.js';
import { Shop } from '../models/shop.model.js';

export async function getSellerProducts(req, res) {
  try {
    const user = req.user;

    // Get seller's shop
    const shop = await Shop.findOne({ owner: user._id });
    if (!shop) {
      return res.status(200).json([]);
    }

    // Get all products for this shop
    const products = await Product.find({ shop: shop._id })
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

    // Get seller's shop
    const shop = await Shop.findOne({ owner: user._id });
    if (!shop) {
      return res.status(200).json([]);
    }

    // Get all orders that contain products from this shop
    const orders = await Order.find({ 'orderItems.product': { $in: await getShopProductIds(shop._id) } })
      .populate('user', 'name email')
      .populate('orderItems.product')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getSellerStats(req, res) {
  try {
    const user = req.user;

    // Get seller's shop
    const shop = await Shop.findOne({ owner: user._id });
    if (!shop) {
      return res.status(200).json({
        totalProducts: 0,
        totalOrders: 0,
        pendingOrders: 0,
      });
    }

    // Get products count
    const totalProducts = await Product.countDocuments({ shop: shop._id });

    // Get shop product IDs for order filtering
    const shopProductIds = await getShopProductIds(shop._id);

    // Get orders containing shop products
    const orders = await Order.find({ 'orderItems.product': { $in: shopProductIds } });

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;

    res.status(200).json({
      totalProducts,
      totalOrders,
      pendingOrders,
    });
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getSellerAnalytics(req, res) {
  try {
    const user = req.user;

    // Get seller's shop
    const shop = await Shop.findOne({ owner: user._id });
    if (!shop) {
      return res.status(200).json({
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        conversionRate: 0,
      });
    }

    // Get shop product IDs for order filtering
    const shopProductIds = await getShopProductIds(shop._id);

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

// Helper function to get all product IDs for a shop
async function getShopProductIds(shopId) {
  const products = await Product.find({ shop: shopId }).select('_id');
  return products.map((p) => p._id);
}
