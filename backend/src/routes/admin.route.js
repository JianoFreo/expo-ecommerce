import { Router } from "express";
import { createProduct } from "../controllers/admin.controller.js";
import { adminOnly, protectRoute } from "../middleware/auth.middleware.js"; 

const router = Router();

router.use(protectRoute, adminOnly); // Apply both middlewares to all routes in this router

router.post("/products" , createProduct);
router.get("/products" , getAllProducts);
router.put("/products/:id" , updateProduct);
router.delete("/products/:id" , deleteProduct);


export default router;