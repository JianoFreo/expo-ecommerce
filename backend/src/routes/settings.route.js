import { Router } from 'express';
import { getSettings, setGuestAccess } from '../controllers/settings.controller.js';
import { protectRoute, superAdminOnly } from '../middleware/auth.middleware.js';

const router = Router();

// Public: get current settings (used by mobile/web to decide if guests allowed)
router.get('/', getSettings);

// Protected: only super-admin can toggle guest access
router.patch('/guest-access', protectRoute, superAdminOnly, setGuestAccess);

export default router;
