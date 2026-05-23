const LoginHistory = require("../models/LoginHistory.model");

const activityLogger = {
  log: async (userId, action, metadata = {}) => {
    try {
      const { ipAddress, userAgent, deviceInfo, reason, status = "success", location } = metadata;

      const logEntry = new LoginHistory({
        userId,
        action,
        status,
        ipAddress,
        userAgent,
        deviceInfo,
        reason,
        location,
        timestamp: new Date(),
      });

      await logEntry.save();
      console.log(`📝 Activity logged: ${action} for user ${userId}`);
      return logEntry;
    } catch (error) {
      console.error("Error logging activity:", error);
    }
  },

  getLoginHistory: async (userId, limit = 20) => {
    try {
      const history = await LoginHistory.find({ userId })
        .sort({ timestamp: -1 })
        .limit(limit);

      return history;
    } catch (error) {
      console.error("Error fetching login history:", error);
      return [];
    }
  },

  getRecentFailedAttempts: async (userId, minutes = 15) => {
    try {
      const startTime = new Date(Date.now() - minutes * 60 * 1000);

      const attempts = await LoginHistory.find({
        userId,
        action: "failed_login",
        timestamp: { $gte: startTime },
      }).sort({ timestamp: -1 });

      return attempts;
    } catch (error) {
      console.error("Error fetching failed attempts:", error);
      return [];
    }
  },

  getAccountEvents: async (userId, daysBack = 30) => {
    try {
      const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

      const events = await LoginHistory.find({
        userId,
        timestamp: { $gte: startDate },
      }).sort({ timestamp: -1 });

      return events;
    } catch (error) {
      console.error("Error fetching account events:", error);
      return [];
    }
  },

  detectSuspiciousActivity: async (userId, currentIp) => {
    try {
      const recentLogins = await LoginHistory.find({
        userId,
        action: "login",
        status: "success",
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }).sort({ timestamp: -1 });

      const uniqueIps = [...new Set(recentLogins.map((log) => log.ipAddress))];

      const alerts = [];

      if (uniqueIps.length > 5) {
        alerts.push({
          type: "multiple_ips",
          severity: "high",
          message: `Logged in from ${uniqueIps.length} different IP addresses in 24 hours`,
        });
      }

      const rapidLogins = recentLogins.filter(
        (log, idx) => idx < 10 && recentLogins[idx + 1] && log.timestamp - recentLogins[idx + 1].timestamp < 5 * 60 * 1000
      );

      if (rapidLogins.length > 0) {
        alerts.push({
          type: "rapid_logins",
          severity: "medium",
          message: "Multiple logins in a short time period",
        });
      }

      const failedAttemptsInLastHour = await LoginHistory.countDocuments({
        userId,
        action: "failed_login",
        timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
      });

      if (failedAttemptsInLastHour > 3) {
        alerts.push({
          type: "failed_attempts",
          severity: "high",
          message: `${failedAttemptsInLastHour} failed login attempts in the last hour`,
        });
      }

      return alerts;
    } catch (error) {
      console.error("Error detecting suspicious activity:", error);
      return [];
    }
  },
};

module.exports = activityLogger;
