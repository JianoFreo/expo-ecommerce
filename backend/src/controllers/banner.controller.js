import { Banner } from "../models/banner.model.js";

const BANNER_KEY = "home-banner";

const defaultBanner = {
  key: BANNER_KEY,
  title: "Discount sale",
  subtitle: "Save on top picks",
  badgeText: "Best Deals",
  ctaText: "Shop Now",
  imageUrl: "",
  backgroundColor: "#1DB954",
  textColor: "#FFFFFF",
  buttonColor: "#FFFFFF",
  buttonTextColor: "#121212",
  isActive: true,
};

export async function getHomeBanner(req, res) {
  try {
    const banner = await Banner.findOne({ key: BANNER_KEY, isActive: true }).lean();
    res.status(200).json({ banner: banner || defaultBanner });
  } catch (error) {
    console.error("Error fetching banner:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function upsertHomeBanner(req, res) {
  try {
    const {
      title,
      subtitle,
      badgeText,
      ctaText,
      imageUrl,
      backgroundColor,
      textColor,
      buttonColor,
      buttonTextColor,
      isActive,
    } = req.body;

    if (!title || !subtitle) {
      return res.status(400).json({ message: "Title and subtitle are required" });
    }

    const banner = await Banner.findOneAndUpdate(
      { key: BANNER_KEY },
      {
        key: BANNER_KEY,
        title,
        subtitle,
        badgeText: badgeText || "Best Deals",
        ctaText: ctaText || "Shop Now",
        imageUrl: imageUrl || "",
        backgroundColor: backgroundColor || "#1DB954",
        textColor: textColor || "#FFFFFF",
        buttonColor: buttonColor || "#FFFFFF",
        buttonTextColor: buttonTextColor || "#121212",
        isActive: typeof isActive === "boolean" ? isActive : true,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({ banner });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}