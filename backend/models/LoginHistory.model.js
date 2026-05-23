const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    action: {
      type: String,
      enum: ["login", "logout", "failed_login", "password_reset", "email_verified", "account_locked"],
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    ipAddress: String,
    userAgent: String,
    deviceInfo: String,
    reason: String,
    location: {
      country: String,
      city: String,
      timezone: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

loginHistorySchema.index({ userId: 1, timestamp: -1 });
loginHistorySchema.index({ userId: 1, action: 1 });

module.exports = mongoose.model("LoginHistory", loginHistorySchema);
