import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";


const router = Router();
router.use(protectRoute) // middleware

router.post("/", createReview)
router.delete("/:reviewId", deleteReview) 

// we did implement this delete function in the app
// because you are not supposed to be able to delete a review,
// but just in case you want to delete a review, 
// you can do it here by passing the reviewId as a parameter in the url

export default router;