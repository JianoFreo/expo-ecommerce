import { Router } from 'express';
import { protectRoute, sellerOnly } from '../middleware/auth.middleware.js';
import {
  getSellerProducts,
  getSellerOrders,
  getSellerStats,
  getSellerAnalytics,
} from '../controllers/seller.controller.js';

const router = Router();

router.use(protectRoute, sellerOnly);

router.get('/products', getSellerProducts);
router.get('/orders', getSellerOrders);
router.get('/stats', getSellerStats);
router.get('/analytics', getSellerAnalytics);

export default router;
