import { Shop } from "../models/shop.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Activity } from "../models/activity.model.js";

export async function getMyShop(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const shop = await Shop.findOne({ owner: req.user._id }).populate('owner', 'name email');
    if (!shop) {
      return res.status(404).json({ message: 'You do not have a shop yet' });
    }
    res.status(200).json({ shop });
  } catch (error) {
    console.error('Error fetching user shop:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createShop(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { name, description, bannerImage } = req.body;
    if (!name) return res.status(400).json({ message: "Shop name is required" });

    const shop = await Shop.create({
      name,
      description: description || '',
      bannerImage: bannerImage || '',
      owner: req.user._id,
    });

    await Activity.create({
      type: 'shop_created',
      user: req.user._id,
      shop: shop._id,
      description: `${req.user.name} created shop ${shop.name}`,
      metadata: { shopName: shop.name },
    });

    res.status(201).json({ shop });
  } catch (error) {
    console.error('Error creating shop:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function updateShop(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    const shop = await Shop.findById(id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { name, description, bannerImage, isActive } = req.body;
    if (name) shop.name = name;
    if (description !== undefined) shop.description = description;
    if (bannerImage !== undefined) shop.bannerImage = bannerImage;
    if (isActive !== undefined) shop.isActive = Boolean(isActive);

    await shop.save();
    res.status(200).json({ shop });
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getShopById(req, res) {
  try {
    const { id } = req.params;
    const shop = await Shop.findById(id).populate('owner', 'name email imageUrl');
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.status(200).json({ shop });
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getAllShops(_, res) {
  try {
    const shops = await Shop.find({ isActive: true }).populate('owner', 'name email imageUrl').sort({ createdAt: -1 });
    res.status(200).json({ shops });
  } catch (error) {
    console.error('Error listing shops:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getShopProducts(req, res) {
  try {
    const { id } = req.params; // shop id
    const products = await Product.find({ shop: id })
      .populate({ path: 'shop', populate: { path: 'owner', select: 'name email' } })
      .sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching shop products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getMyShopStats(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const shop = await Shop.findOne({ owner: req.user._id }).populate('owner', 'name email imageUrl');
    if (!shop) {
      return res.status(404).json({ message: 'You do not have a shop yet' });
    }

    const products = await Product.find({ shop: shop._id }).select('_id');
    const productIds = products.map((product) => product._id.toString());
    const productIdSet = new Set(productIds);

    const orders = await Order.find({ "orderItems.product": { $in: productIds } })
      .populate({
        path: 'orderItems.product',
        populate: { path: 'shop', select: 'name owner', populate: { path: 'owner', select: 'name email' } },
      })
      .sort({ createdAt: -1 });

    const recentOrders = orders.slice(0, 5).map((order) => {
      const shopItems = order.orderItems.filter((item) => {
        const productId = item.product?._id?.toString?.();
        return productId && productIdSet.has(productId);
      });

      const shopRevenue = shopItems.reduce((total, item) => total + (item.price * item.quantity), 0);

      return {
        _id: order._id,
        createdAt: order.createdAt,
        status: order.status,
        customerName: order.shippingAddress?.fullName,
        itemCount: shopItems.reduce((total, item) => total + item.quantity, 0),
        revenue: shopRevenue,
      };
    });

    const totalRevenue = orders.reduce((grandTotal, order) => {
      const shopItems = order.orderItems.filter((item) => {
        const productId = item.product?._id?.toString?.();
        return productId && productIdSet.has(productId);
      });

      const shopRevenue = shopItems.reduce((total, item) => total + (item.price * item.quantity), 0);
      return grandTotal + shopRevenue;
    }, 0);

    const totalItemsSold = orders.reduce((grandTotal, order) => {
      const shopItems = order.orderItems.filter((item) => {
        const productId = item.product?._id?.toString?.();
        return productId && productIdSet.has(productId);
      });
      return grandTotal + shopItems.reduce((total, item) => total + item.quantity, 0);
    }, 0);

    res.status(200).json({
      shop,
      stats: {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        totalItemsSold,
      },
      recentOrders,
    });
  } catch (error) {
    console.error('Error fetching shop stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
