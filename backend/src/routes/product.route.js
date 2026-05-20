import { Router } from "express";
import { getProductById } from "../controllers/product.controller.js";
import { getAllProducts } from "../controllers/admin.controller.js"; // its already in the admin controller

// Product listing and product detail should be public so customers can browse
// products without requiring authentication. Protect other admin-only
// routes elsewhere with `protectRoute` + `adminOnly`.
const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);

export default router;