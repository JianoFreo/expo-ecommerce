import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import {
    adminOnly,
    protectRoute,
    superAdminOnly
} from "../middleware/auth.middleware.js";
import {
    createProduct,
    getAllProducts,
    deleteProduct,
    updateProduct,
    getAllOrders,
    getOrderByIdAdmin,
    updateOrderStatus,
    getAllCustomers,
    getDashboardStats,
    migrateProductsToDefaultShop,
    getAllUsers,
    banUser,
    updateUserRole,
    unbanUser,
    getRecentActivities,
    getAllShopsAdmin,
    updateShopAdmin,
    deleteShopAdmin,
    migrateMagtangobProductsToJiano,
} from "../controllers/admin.controller.js";
import { upsertHomeBanner } from "../controllers/banner.controller.js";



const router = Router();

router.use(protectRoute, adminOnly); // Apply both middlewares to all routes in this router

router.post("/products", protectRoute, superAdminOnly, upload.array("images", 3), createProduct); // only super-admin can create via admin endpoint
// the "images" is what we gonna use if we get into the frontend 
router.get("/products", getAllProducts);
router.put("/products/:id", upload.array("images", 3), updateProduct);

router.get("/orders", getAllOrders);
router.get("/orders/:orderId", getOrderByIdAdmin);
router.patch("/orders/:orderId/status", updateOrderStatus); //pending -> shipped -> delivered

//PUT : update the whole resource, full resource replacement
//PATCH: update a part of the resource,  partial resource update, specific part of the resource

router.get("/customers", getAllCustomers);

router.get("/stats", getDashboardStats);
router.get("/activities", protectRoute, superAdminOnly, getRecentActivities);
router.get("/shops", protectRoute, superAdminOnly, getAllShopsAdmin);
router.patch("/shops/:id", protectRoute, superAdminOnly, updateShopAdmin);
router.delete("/shops/:id", protectRoute, superAdminOnly, deleteShopAdmin);
router.post("/migrations/magtangob-products", protectRoute, superAdminOnly, migrateMagtangobProductsToJiano);

router.delete("/products/:id", deleteProduct);

router.post("/migrate-products", migrateProductsToDefaultShop);

// Super admin only routes
router.put("/banner", protectRoute, superAdminOnly, upsertHomeBanner);

router.get("/users", protectRoute, superAdminOnly, getAllUsers);
router.patch("/users/:userId/ban", protectRoute, superAdminOnly, banUser);
router.patch("/users/:userId/unban", protectRoute, superAdminOnly, unbanUser);
router.patch("/users/:userId/role", protectRoute, superAdminOnly, updateUserRole);

export default router;