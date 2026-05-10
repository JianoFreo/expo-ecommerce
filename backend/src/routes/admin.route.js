import { Router } from "express";
import { createProduct } from "../controllers/admin.controller.js";

const router = Router();

router.post("/product" ,protectRoute, adminOnly, createProduct);

export default router;