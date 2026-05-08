const express = require("express");
const router = express.Router();
const { placeOrder, placeDirectOrder, getMyOrders, getOrderById, cancelOrder, cancelOrderItem, updateOrderStatus } = require("../controllers/order.controller");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", authorize("buyer"), placeOrder);
router.post("/direct", authorize("buyer"), placeDirectOrder);
router.get("/", authorize("buyer"), getMyOrders);
router.get("/:id", getOrderById); // buyer sees own, admin sees all
router.put("/:id/cancel", authorize("buyer"), cancelOrder);
router.put("/:id/items/:itemIndex/cancel", authorize("buyer"), cancelOrderItem);
router.put("/:id/items/:itemIndex/status", authorize("seller", "admin"), updateOrderStatus);

module.exports = router;
