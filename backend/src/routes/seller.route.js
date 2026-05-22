import { Router } from 'express';
import { protectRoute, sellerOnly } from '../middleware/auth.middleware.js';
import {
  getSellerProducts,
  getSellerOrders,
  getSellerOrderById,
  getSellerStats,
  getSellerAnalytics,
  updateSellerShop,
  createSellerProduct,
  updateSellerProduct,
  deleteSellerProduct,
} from '../controllers/seller.controller.js';

const router = Router();

router.use(protectRoute, sellerOnly);

router.get('/products', getSellerProducts);
router.post('/products', createSellerProduct);
router.patch('/products/:id', updateSellerProduct);
router.delete('/products/:id', deleteSellerProduct);
router.get('/orders', getSellerOrders);
router.get('/orders/:orderId', getSellerOrderById);
router.get('/stats', getSellerStats);
router.get('/analytics', getSellerAnalytics);
router.patch('/shop', updateSellerShop);

export default router;
