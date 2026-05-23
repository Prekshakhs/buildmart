const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { protect } = require("../middleware/authMiddleware");
const securityAlertService = require("../services/securityAlertService");
const SecurityAlert = require("../models/SecurityAlert.model");

// ─── All Protected Routes ──────────────────────────────────────────────────────
router.use(protect);

// ─── @GET /api/security-alerts ────────────────────────────────────────────────
// Get all alerts for current user
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { limit = 20, skip = 0, unreadOnly = false } = req.query;

    const { alerts, total } = await securityAlertService.getUserAlerts(
      req.user._id,
      {
        limit: parseInt(limit),
        skip: parseInt(skip),
        unreadOnly: unreadOnly === "true",
      }
    );

    res.status(200).json({
      success: true,
      data: alerts,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  })
);

// ─── @GET /api/security-alerts/unread-count ───────────────────────────────────
// Get unread alert count
router.get(
  "/unread-count",
  asyncHandler(async (req, res) => {
    const count = await securityAlertService.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      unreadCount: count,
    });
  })
);

// ─── @GET /api/security-alerts/:id ────────────────────────────────────────────
// Get specific alert
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const alert = await SecurityAlert.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      data: alert,
    });
  })
);

// ─── @PUT /api/security-alerts/:id/read ───────────────────────────────────────
// Mark alert as read
router.put(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const alert = await securityAlertService.markAsRead(
      req.params.id,
      req.user._id
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Alert marked as read",
      data: alert,
    });
  })
);

// ─── @PUT /api/security-alerts/read-all ───────────────────────────────────────
// Mark all alerts as read
router.put(
  "/read-all",
  asyncHandler(async (req, res) => {
    const result = await securityAlertService.markAllAsRead(req.user._id);

    res.status(200).json({
      success: true,
      message: "All alerts marked as read",
      data: result,
    });
  })
);

// ─── @DELETE /api/security-alerts/:id ─────────────────────────────────────────
// Delete alert
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const result = await securityAlertService.deleteAlert(
      req.params.id,
      req.user._id
    );

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Alert deleted",
    });
  })
);

module.exports = router;
