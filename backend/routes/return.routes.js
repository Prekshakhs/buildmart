const express = require("express");
const router = express.Router();
console.log("✓ Return routes file loaded");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getMyReturns,
  requestReturn,
  getReturnRequests,
  approveReturn,
  rejectReturn,
  markReturnShipped,
  confirmReturnReceived,
} = require("../controllers/return.controller");

// Buyer: Request return
router.post("/request", protect, authorize("buyer"), requestReturn);

// Buyer: Get my returns
router.get("/my-returns", protect, authorize("buyer"), getMyReturns);

// Buyer: Mark return as shipped
router.put("/ship", protect, authorize("buyer"), markReturnShipped);

// Seller: Get all return requests
router.get("/seller/requests", protect, authorize("seller"), getReturnRequests);

// Seller: Approve return
router.put("/approve", protect, authorize("seller"), approveReturn);

// Seller: Reject return
router.put("/reject", protect, authorize("seller"), rejectReturn);

// Seller: Confirm return received and process refund
router.put("/confirm-received", protect, authorize("seller"), confirmReturnReceived);

module.exports = router;
