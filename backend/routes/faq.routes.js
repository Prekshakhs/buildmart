const express = require("express");
const router = express.Router();
const {
  getFAQs,
  getFAQById,
  searchFAQs,
  getFAQsByCategory,
  markFAQHelpful,
  markFAQUnhelpful,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getAllFAQsAdmin,
} = require("../controllers/faq.controller");
const { protect, authorize } = require("../middleware/authMiddleware");

// ─── Admin Routes (must come first - more specific) ────────────────────────────
router.get("/admin/all", protect, authorize("admin"), getAllFAQsAdmin);
router.post("/", protect, authorize("admin"), createFAQ);
router.put("/:id", protect, authorize("admin"), updateFAQ);
router.delete("/:id", protect, authorize("admin"), deleteFAQ);

// ─── Public Routes (more specific first, then generic) ────────────────────────
router.get("/search", searchFAQs);
router.get("/category/:category", getFAQsByCategory);
router.post("/:id/helpful", markFAQHelpful);
router.post("/:id/unhelpful", markFAQUnhelpful);
router.get("/:id", getFAQById);
router.get("/", getFAQs);

module.exports = router;

