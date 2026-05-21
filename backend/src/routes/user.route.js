import { Router } from "express";
import {
  addAddress,
  addToWishlist,
  deleteAddress,
  becomeSeller,
  getCurrentUser,
  getAddresses,
  getWishlist,
  removeFromWishlist,
  updateAddress,
  updateProfile,
  uploadAvatar,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.use(protectRoute);

// address routes
router.get("/me", getCurrentUser);
router.post("/become-seller", becomeSeller);
router.post("/addresses", addAddress);
router.get("/addresses", getAddresses);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

// wishlist routes
router.post("/wishlist", addToWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);
router.get("/wishlist", getWishlist);

// profile update
router.patch("/profile", updateProfile);

// upload avatar (multipart/form-data) - field name: avatar
router.post('/profile/avatar', protectRoute, upload.single('avatar'), uploadAvatar);

export default router;