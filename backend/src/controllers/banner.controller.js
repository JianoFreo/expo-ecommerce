import { Banner } from "../models/banner.model.js";
import { Product } from "../models/product.model.js";

const BANNER_KEY = "home-banner";

const defaultBanner = {
  key: BANNER_KEY,
  product: null,
  badgeText: "Best Deals",
  ctaText: "Shop Now",
  isActive: false,
};

export async function getHomeBanner(req, res) {
  try {
    const banner = await Banner.findOne({ key: BANNER_KEY, isActive: true }).populate("product").lean();
    res.status(200).json({ banner: banner || defaultBanner });
  } catch (error) {
    console.error("Error fetching banner:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function upsertHomeBanner(req, res) {
  try {
    const {
      productId,
      badgeText,
      ctaText,
      isActive,
    } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product is required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const banner = await Banner.findOneAndUpdate(
      { key: BANNER_KEY },
      {
        key: BANNER_KEY,
        product: product._id,
        badgeText: badgeText || "Best Deals",
        ctaText: ctaText || "Shop Now",
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    ).populate("product");

    res.status(200).json({ banner });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}