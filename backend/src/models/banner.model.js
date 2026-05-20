import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "home-banner",
    },
    title: {
      type: String,
      required: true,
      default: "Discount sale",
    },
    subtitle: {
      type: String,
      required: true,
      default: "Save on top picks",
    },
    badgeText: {
      type: String,
      default: "Best Deals",
    },
    ctaText: {
      type: String,
      default: "Shop Now",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    backgroundColor: {
      type: String,
      default: "#1DB954",
    },
    textColor: {
      type: String,
      default: "#FFFFFF",
    },
    buttonColor: {
      type: String,
      default: "#FFFFFF",
    },
    buttonTextColor: {
      type: String,
      default: "#121212",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Banner = mongoose.model("Banner", bannerSchema);