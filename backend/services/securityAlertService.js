const SecurityAlert = require("../models/SecurityAlert.model");
const UAParser = require("ua-parser-js");

// ─── Create Alert ──────────────────────────────────────────────────────────────
const createAlert = async (userId, type, options = {}) => {
  try {
    const {
      title,
      description,
      severity = "info",
      deviceInfo = null,
      ipAddress = null,
      location = null,
      actionRequired = false,
      actions = [],
      metadata = {},
    } = options;

    const alert = await SecurityAlert.create({
      userId,
      type,
      title,
      description,
      severity,
      deviceInfo,
      ipAddress,
      location,
      actionRequired,
      actions,
      metadata,
    });

    return alert;
  } catch (error) {
    console.error("Error creating security alert:", error);
  }
};

// ─── Get User Alerts ──────────────────────────────────────────────────────────
const getUserAlerts = async (userId, options = {}) => {
  try {
    const { limit = 20, skip = 0, unreadOnly = false } = options;

    const query = { userId };
    if (unreadOnly) query.isRead = false;

    const alerts = await SecurityAlert.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await SecurityAlert.countDocuments(query);

    return { alerts, total };
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return { alerts: [], total: 0 };
  }
};

// ─── Mark Alert as Read ────────────────────────────────────────────────────────
const markAsRead = async (alertId, userId) => {
  try {
    const alert = await SecurityAlert.findOneAndUpdate(
      { _id: alertId, userId },
      { isRead: true },
      { new: true }
    );

    return alert;
  } catch (error) {
    console.error("Error marking alert as read:", error);
  }
};

// ─── Mark All Alerts as Read ───────────────────────────────────────────────────
const markAllAsRead = async (userId) => {
  try {
    const result = await SecurityAlert.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );

    return result;
  } catch (error) {
    console.error("Error marking alerts as read:", error);
  }
};

// ─── Delete Alert ──────────────────────────────────────────────────────────────
const deleteAlert = async (alertId, userId) => {
  try {
    const result = await SecurityAlert.deleteOne({
      _id: alertId,
      userId,
    });

    return result;
  } catch (error) {
    console.error("Error deleting alert:", error);
  }
};

// ─── Get Unread Count ──────────────────────────────────────────────────────────
const getUnreadCount = async (userId) => {
  try {
    const count = await SecurityAlert.countDocuments({
      userId,
      isRead: false,
    });

    return count;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};

// ─── Alert Templates ──────────────────────────────────────────────────────────

const alertTemplates = {
  newLogin: (deviceInfo, ipAddress, location) => ({
    type: "login",
    title: "New login",
    severity: "info",
    description: `New login from ${deviceInfo?.browser || "Unknown"} on ${deviceInfo?.os || "Unknown"}`,
    deviceInfo,
    ipAddress,
    location,
  }),

  failedLogin: (ipAddress, attempts = 1) => ({
    type: "failed_login",
    title: "Failed login attempt",
    severity: attempts >= 3 ? "critical" : "warning",
    description: `Failed login attempt from ${ipAddress}${attempts >= 3 ? " (Multiple attempts detected)" : ""}`,
    ipAddress,
    actionRequired: attempts >= 3,
  }),

  passwordChanged: () => ({
    type: "password_changed",
    title: "Password changed",
    severity: "info",
    description: "Your password has been successfully changed",
    actionRequired: false,
  }),

  sessionRevoked: (deviceInfo) => ({
    type: "session_revoked",
    title: "Session revoked",
    severity: "info",
    description: `Session revoked on ${deviceInfo?.browser || "device"}`,
    deviceInfo,
  }),

  accountLocked: (ipAddress) => ({
    type: "account_locked",
    title: "Account locked",
    severity: "critical",
    description: "Your account has been locked due to multiple failed login attempts",
    ipAddress,
    actionRequired: true,
    actions: [
      {
        action: "Reset Password",
        url: "/forgot-password",
      },
    ],
  }),

  suspiciousActivity: (reason) => ({
    type: "suspicious_activity",
    title: "Suspicious activity detected",
    severity: "critical",
    description: reason,
    actionRequired: true,
    actions: [
      {
        action: "Review Sessions",
        url: "/profile?tab=sessions",
      },
    ],
  }),

  deviceAdded: (deviceInfo) => ({
    type: "device_added",
    title: "New device login",
    severity: "warning",
    description: `New device detected: ${deviceInfo?.browser} on ${deviceInfo?.os}`,
    deviceInfo,
    actionRequired: false,
  }),
};

// ─── Helper to extract device info from request ────────────────────────────────
const extractDeviceInfo = (userAgent) => {
  try {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
      browser: result.browser.name,
      browserVersion: result.browser.version,
      os: result.os.name,
      osVersion: result.os.version,
      deviceType: result.device.type || "desktop",
    };
  } catch (error) {
    console.error("Error parsing user agent:", error);
    return null;
  }
};

module.exports = {
  createAlert,
  getUserAlerts,
  markAsRead,
  markAllAsRead,
  deleteAlert,
  getUnreadCount,
  alertTemplates,
  extractDeviceInfo,
};
