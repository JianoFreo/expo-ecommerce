import { Router } from "express";
import { createProduct } from "../controllers/admin.controller.js";
import {
    createProduct,
    getAllProducts,
    updateProduct
} from "../controllers/admin.controller.js";
import {
    adminOnly,
    protectRoute
} from "../middleware/auth.middleware.js";

import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.use(protectRoute, adminOnly); // Apply both middlewares to all routes in this router

router.post("/products",upload.array("images", 3), createProduct); // each product should have a maximum of 3 images
// the "images" is what we gonna use if we get into the frontend 
router.get("/products", getAllProducts);
router.put("/products/:id",upload.array("images", 3), updateProduct);


export default router;