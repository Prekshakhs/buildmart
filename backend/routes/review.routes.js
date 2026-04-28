const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getReviewsByProduct,
  checkExistingReview,
  createOrUpdateReview,
  updateReview,
  deleteReview,
  toggleHelpful,
} = require("../controllers/review.controller");

// Public route
router.get("/product/:productId", getReviewsByProduct);

// Protected routes
router.get("/check-existing/:productId", protect, checkExistingReview);
router.post("/", protect, createOrUpdateReview);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);
router.post("/:id/helpful", protect, toggleHelpful);

module.exports = router;
