import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();
router.use(protectRoute) // middleware

export default router;