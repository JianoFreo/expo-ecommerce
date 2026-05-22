import { Router } from 'express';
import { protectRoute, sellerOnly } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';
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
  updateOrderStatus,
} from '../controllers/seller.controller.js';

const router = Router();

router.use(protectRoute, sellerOnly);

router.get('/products', getSellerProducts);
router.post('/products', upload.array('images', 3), createSellerProduct);
router.patch('/products/:id', upload.array('images', 3), updateSellerProduct);
router.delete('/products/:id', deleteSellerProduct);
router.get('/orders', getSellerOrders);
router.get('/orders/:orderId', getSellerOrderById);
router.patch('/orders/:orderId/status', updateOrderStatus);
router.get('/stats', getSellerStats);
router.get('/analytics', getSellerAnalytics);
router.patch('/shop', updateSellerShop);

export default router;
