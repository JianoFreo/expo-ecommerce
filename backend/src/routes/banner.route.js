import { Router } from "express";
import { getHomeBanner } from "../controllers/banner.controller.js";

const router = Router();

router.get("/", getHomeBanner);

export default router;