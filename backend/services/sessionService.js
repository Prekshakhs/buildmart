const asyncHandler = require("express-async-handler");
const Session = require("../models/Session.model");
const UAParser = require("ua-parser-js");

// ─── Create Session on Login ───────────────────────────────────────────────────
const createSession = asyncHandler(async (userId, token, req) => {
  const parser = new UAParser(req.headers["user-agent"]);
  const result = parser.getResult();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30-day sessions

  const session = await Session.create({
    userId,
    token,
    deviceInfo: {
      userAgent: req.headers["user-agent"],
      browser: result.browser.name,
      browserVersion: result.browser.version,
      os: result.os.name,
      osVersion: result.os.version,
      deviceType: result.device.type || "desktop",
      isMobile: result.device.type === "mobile",
    },
    ipAddress: req.ip,
    expiresAt,
    lastActivityAt: new Date(),
  });

  return session;
});

// ─── Get All Active Sessions ──────────────────────────────────────────────────
const getActiveSessions = asyncHandler(async (req, res) => {
  const { userId } = req.user;

  const sessions = await Session.find(
    {
      userId,
      isActive: true,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    },
    {
      token: 0, // Don't expose tokens
      failedAttempts: 0,
    }
  )
    .sort({ lastActivityAt: -1 })
    .lean();

  const sessionsWithStatus = sessions.map((session) => ({
    ...session,
    isCurrent: session.ipAddress === req.ip, // Mark if current session
    isExpired: new Date(session.expiresAt) < new Date(),
  }));

  res.status(200).json({
    success: true,
    count: sessionsWithStatus.length,
    data: sessionsWithStatus,
  });
});

// ─── Revoke Specific Session ──────────────────────────────────────────────────
const revokeSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { userId } = req.user;

  const session = await Session.findById(sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    });
  }

  // Verify ownership
  if (session.userId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to revoke this session",
    });
  }

  session.isRevoked = true;
  session.isActive = false;
  session.revokedAt = new Date();
  session.revokeReason = "Manual revocation by user";
  await session.save();

  res.status(200).json({
    success: true,
    message: "Session revoked successfully",
    data: session,
  });
});

// ─── Revoke All Sessions ──────────────────────────────────────────────────────
const revokeAllSessions = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { exceptCurrentToken } = req.body;

  const query = {
    userId,
    isActive: true,
    isRevoked: false,
  };

  // Optionally keep current session active
  if (exceptCurrentToken) {
    query.token = { $ne: exceptCurrentToken };
  }

  const result = await Session.updateMany(
    query,
    {
      isRevoked: true,
      isActive: false,
      revokedAt: new Date(),
      revokeReason: "Bulk revocation - Security action",
    }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} sessions revoked`,
    data: {
      revokedCount: result.modifiedCount,
    },
  });
});

// ─── Update Last Activity ─────────────────────────────────────────────────────
const updateSessionActivity = asyncHandler(async (token) => {
  try {
    await Session.findOneAndUpdate(
      { token, isActive: true, isRevoked: false },
      { lastActivityAt: new Date() },
      { new: false }
    );
  } catch (error) {
    // Silently fail - activity update is not critical
    console.log("Session activity update failed:", error.message);
  }
});

// ─── Get Session Details ──────────────────────────────────────────────────────
const getSessionDetails = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { userId } = req.user;

  const session = await Session.findById(sessionId, { token: 0 }).lean();

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    });
  }

  // Verify ownership
  if (session.userId.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to view this session",
    });
  }

  res.status(200).json({
    success: true,
    data: session,
  });
});

// ─── Check Session Health ─────────────────────────────────────────────────────
const checkSessionHealth = asyncHandler(async (token) => {
  const session = await Session.findOne({ token, isActive: true });

  if (!session) {
    return { valid: false, reason: "Session not found" };
  }

  if (session.isRevoked) {
    return { valid: false, reason: "Session revoked" };
  }

  if (new Date(session.expiresAt) < new Date()) {
    return { valid: false, reason: "Session expired" };
  }

  return {
    valid: true,
    session: {
      sessionId: session._id,
      userId: session.userId,
      expiresAt: session.expiresAt,
      lastActivityAt: session.lastActivityAt,
    },
  };
});

// ─── Cleanup Expired Sessions ──────────────────────────────────────────────────
const cleanupExpiredSessions = asyncHandler(async () => {
  const result = await Session.deleteMany({
    expiresAt: { $lt: new Date() },
  });

  console.log(`🧹 Cleaned up ${result.deletedCount} expired sessions`);
  return result;
});

module.exports = {
  createSession,
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
  updateSessionActivity,
  getSessionDetails,
  checkSessionHealth,
  cleanupExpiredSessions,
};
