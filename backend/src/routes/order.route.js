import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    createOrder,
    getUserOrders,
    getUserOrderById
} from "../controllers/order.controller.js";

const router = Router();

router.use(protectRoute) // middleware

router.post("/", createOrder);
router.get("/", getUserOrders);
router.get("/:orderId", getUserOrderById);

export default router;