import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
    createReview,
    deleteReview,
    getReviewsByProduct,
} from "../controllers/review.controller.js";

const router = Router();

// public: fetch reviews for a product
router.get('/product/:productId', getReviewsByProduct);

// protected: create and delete
router.post("/", protectRoute, upload.array('images', 3), createReview);
router.delete("/:reviewId", protectRoute, deleteReview);

// we did implement this delete function in the app
// because you are not supposed to be able to delete a review,
// but just in case you want to delete a review, 
// you can do it here by passing the reviewId as a parameter in the url

export default router;