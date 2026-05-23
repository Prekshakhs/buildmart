const express = require("express");
const router = express.Router();
const {
  submitContact,
  getContacts,
  getContactById,
  updateContactStatus,
  replyToContact,
  getContactStats,
} = require("../controllers/contact.controller");
const { protect, authorize } = require("../middleware/authMiddleware");

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post("/", submitContact);

// ─── Admin Routes ────────────────────────────────────────────────────────────
router.get("/admin/stats", protect, authorize("admin"), getContactStats);
router.get("/admin", protect, authorize("admin"), getContacts);
router.get("/admin/:id", protect, authorize("admin"), getContactById);
router.patch("/admin/:id/status", protect, authorize("admin"), updateContactStatus);
router.post("/admin/:id/reply", protect, authorize("admin"), replyToContact);

module.exports = router;
