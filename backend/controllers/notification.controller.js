const asyncHandler = require("express-async-handler");
const Notification = require("../models/Notification.model");

// Get user's notifications
const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, read } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit)));

  const filter = { userId: req.user._id };
  if (type) filter.type = type;
  if (read !== undefined) filter.read = read === "true";

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({
    userId: req.user._id,
    read: false,
  });

  res.json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// Mark notification as read
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  if (notification.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  notification.read = true;
  notification.readAt = new Date();
  await notification.save();

  res.json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

// Delete notification
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  if (notification.userId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  await Notification.findByIdAndDelete(id);

  res.json({
    success: true,
    message: "Notification deleted",
  });
});

// Get notification preferences
const getPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("notificationPreferences");

  res.json({
    success: true,
    data: user.notificationPreferences,
  });
});

// Update notification preferences
const updatePreferences = asyncHandler(async (req, res) => {
  const { orders, returns, payments, account } = req.body;

  const updates = {};
  if (orders) updates["notificationPreferences.orders"] = orders;
  if (returns) updates["notificationPreferences.returns"] = returns;
  if (payments) updates["notificationPreferences.payments"] = payments;
  if (account) updates["notificationPreferences.account"] = account;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true }
  ).select("notificationPreferences");

  res.json({
    success: true,
    message: "Notification preferences updated",
    data: user.notificationPreferences,
  });
});

// Register device token for push notifications (Phase 3)
const registerDevice = asyncHandler(async (req, res) => {
  const { deviceToken } = req.body;

  if (!deviceToken) {
    res.status(400);
    throw new Error("Device token is required");
  }

  // TODO: Store device token in database for Phase 3 (Firebase push notifications)
  // For now, just acknowledge the request
  res.json({
    success: true,
    message: "Device token registered (Phase 3)",
  });
});

// Mark all as read
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, read: false },
    { $set: { read: true, readAt: new Date() } }
  );

  res.json({
    success: true,
    message: "All notifications marked as read",
  });
});

// Import User model
const User = require("../models/User.model");

module.exports = {
  getNotifications,
  markAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
  registerDevice,
  markAllAsRead,
};
