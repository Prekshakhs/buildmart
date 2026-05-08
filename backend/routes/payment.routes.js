const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createRazorpayOrder,
  verifyPayment,
  refundPayment,
} = require("../controllers/payment.controller");

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create Razorpay order (user provides amount)
router.post("/create-order", createRazorpayOrder);

// Verify payment signature after user pays
router.post("/verify", verifyPayment);

// Refund payment (admin/seller/buyer can refund their order)
router.post("/refund/:orderId", refundPayment);

module.exports = router;
