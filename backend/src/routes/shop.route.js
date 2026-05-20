import { Router } from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  getMyShop,
  createShop,
  updateShop,
  getShopById,
  getAllShops,
  getShopProducts,
} from '../controllers/shop.controller.js';

const router = Router();

// Public
router.get('/', getAllShops);
router.get('/:id', getShopById);
router.get('/:id/products', getShopProducts);

// Protected: only authenticated users can create/update their shop
router.get('/user/me', protectRoute, getMyShop);
router.post('/', protectRoute, createShop);
router.put('/:id', protectRoute, updateShop);

export default router;
