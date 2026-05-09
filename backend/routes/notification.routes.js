const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  getNotifications,
  markAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
  registerDevice,
  markAllAsRead,
} = require("../controllers/notification.controller");

// All routes require authentication
router.use(protect);

// Get notifications
router.get("/", getNotifications);

// Mark all as read
router.put("/mark-all-read", markAllAsRead);

// Mark single notification as read
router.put("/:id/read", markAsRead);

// Delete notification
router.delete("/:id", deleteNotification);

// Get notification preferences
router.get("/preferences", getPreferences);

// Update notification preferences
router.put("/preferences", updatePreferences);

// Register device token for push notifications (Phase 3)
router.post("/register-device", registerDevice);

module.exports = router;
