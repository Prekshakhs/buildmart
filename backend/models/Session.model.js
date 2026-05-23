const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceInfo: {
      userAgent: String,
      browser: String,
      browserVersion: String,
      os: String,
      osVersion: String,
      deviceType: {
        type: String,
        enum: ["desktop", "mobile", "tablet", "unknown"],
        default: "unknown",
      },
      isMobile: Boolean,
    },
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },
    location: {
      country: String,
      city: String,
      timezone: String,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: Date,
    revokeReason: String,
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
      // Auto-delete expired sessions after 30 days
      expires: 2592000,
    },
    loginAttempt: {
      count: { type: Number, default: 1 },
      timestamp: { type: Date, default: Date.now },
    },
    failedAttempts: [
      {
        timestamp: Date,
        reason: String,
      },
    ],
  },
  {
    timestamps: true,
    collection: "sessions",
  }
);

// Index for efficient queries
sessionSchema.index({ userId: 1, isActive: 1, isRevoked: 1 });
sessionSchema.index({ createdAt: -1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for session duration
sessionSchema.virtual("duration").get(function () {
  return this.expiresAt - this.createdAt;
});

// Ensure virtuals are included in JSON
sessionSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Session", sessionSchema);
