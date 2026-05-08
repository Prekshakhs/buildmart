const express = require("express");
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
  clearWishlist,
} = require("../controllers/wishlist.controller");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// ─── ALL WISHLIST ROUTES PROTECTED WITH JWT & BUYER ONLY ───────────────────
router.use(protect, authorize("buyer"));

router.get("/", getWishlist);
router.post("/add", addToWishlist);
router.delete("/remove/:productId", removeFromWishlist);
router.get("/status/:productId", checkWishlistStatus);
router.delete("/clear", clearWishlist);

module.exports = router;
