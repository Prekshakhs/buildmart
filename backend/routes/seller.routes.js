const express = require("express");
const router = express.Router();
const { getDashboard, getSellerProducts, getSellerOrders, getDashboardStats, bulkUpdateStatus } = require("../controllers/seller.controller");
const { protect, authorize, requireApprovedSeller } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("seller", "admin"));
router.use(requireApprovedSeller);

router.get("/dashboard", getDashboard);
router.get("/dashboard/stats", getDashboardStats);
router.get("/products", getSellerProducts);
router.get("/orders", getSellerOrders);
router.put("/orders/bulk-status", bulkUpdateStatus);

module.exports = router;
