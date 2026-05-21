import { Router } from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';
import {
  getMyShop,
  createShop,
  updateShop,
  getShopById,
  getAllShops,
  getShopProducts,
  getMyShopStats,
  getMyShopProducts,
  createSellerProduct,
} from '../controllers/shop.controller.js';

const router = Router();

// Public
router.get('/', getAllShops);

// Protected: only authenticated users can create/update their shop
router.get('/user/me', protectRoute, getMyShop);
router.get('/user/me/stats', protectRoute, getMyShopStats);
router.get('/user/me/products', protectRoute, getMyShopProducts);
router.post('/', protectRoute, createShop);
router.put('/:id', protectRoute, updateShop);
router.post('/user/me/products', protectRoute, upload.array('images', 3), createSellerProduct);

router.get('/:id/products', getShopProducts);
router.get('/:id', getShopById);

export default router;
