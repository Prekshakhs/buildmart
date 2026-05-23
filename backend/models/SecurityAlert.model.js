const mongoose = require("mongoose");

const securityAlertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "login",
        "failed_login",
        "logout",
        "password_changed",
        "email_changed",
        "session_revoked",
        "account_locked",
        "suspicious_activity",
        "unauthorized_access",
        "device_added",
      ],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["info", "warning", "critical"],
      default: "info",
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    deviceInfo: {
      browser: String,
      os: String,
      deviceType: String,
    },
    ipAddress: String,
    location: {
      country: String,
      city: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    actionRequired: {
      type: Boolean,
      default: false,
    },
    actions: [
      {
        action: String,
        url: String,
      },
    ],
    metadata: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
    collection: "security_alerts",
  }
);

// Index for efficient queries
securityAlertSchema.index({ userId: 1, createdAt: -1 });
securityAlertSchema.index({ userId: 1, isRead: 1 });
securityAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SecurityAlert", securityAlertSchema);
