import { Router } from "express";
import { createProduct } from "../controllers/admin.controller.js";
import {
    createProduct,
    getAllProducts,
    updateProduct,
    getAllOrders,
    updateOrderStatus
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

router.get("/orders", getAllOrders);
router.patch("/orders/:orderId/status", updateOrderStatus); //pending -> shipped -> delivered

//PUT : update the whole resource, full resource replacement
//PATCH: update a part of the resource,  partial resource update, specific part of the resource

export default router;