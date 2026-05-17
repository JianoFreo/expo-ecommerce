import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getProductById } from "../controllers/product.controller.js";
import { getAllProducts } from "../controllers/admin.controller.js"; // its already in the admin controller
// we can rewrite it again inside the product controller but for the sake of less codes we wont

const router = Router();

router.use(protectRoute) // middleware

router.get("/", getAllProducts);
router.get("/:id", getProductById);


export default router;