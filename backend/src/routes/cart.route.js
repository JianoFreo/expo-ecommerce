import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getCart,
    addToCart,
    updateCart,
    removeFromCart,
    clearCart
} from "../controllers/cart.controller.js";

const router = Router();

router.use(protectRoute) // middleware

router.get("/", getCart)
router.put("/", addToCart)
router.put("/:productId", updateCart)
router.delete("/:productId", removeFromCart)
router.delete("/", clearCart)


export default router; 