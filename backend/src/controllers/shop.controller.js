import { Shop } from "../models/shop.model.js";
import { Product } from "../models/product.model.js";

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
    const products = await Product.find({ shop: id }).sort({ createdAt: -1 });
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching shop products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
