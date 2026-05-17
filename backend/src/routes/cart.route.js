import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
} from "../controllers/cart.controller.js";

const router = Router();

router.use(protectRoute) // middleware

router.get("/", getCart)
router.put("/", addToCart)
router.put("/:productId", updateCartItem)
router.delete("/:productId", removeFromCart)
router.delete("/", clearCart)


export default router; 