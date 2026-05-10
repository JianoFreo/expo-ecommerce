import { Router } from "express";
import { createProduct } from "../controllers/admin.controller.js";

const router = Router();

router.post("/product", createProduct);

export default router;