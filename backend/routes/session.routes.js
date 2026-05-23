const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getActiveSessions,
  revokeSession,
  revokeAllSessions,
  getSessionDetails,
} = require("../services/sessionService");

// ─── All Protected Routes (Authenticated Users Only) ────────────────────────
router.use(protect);

// Get all active sessions for current user
router.get("/", getActiveSessions);

// Get specific session details
router.get("/:sessionId", getSessionDetails);

// Revoke specific session
router.delete("/:sessionId", revokeSession);

// Revoke all sessions
router.post("/revoke-all", revokeAllSessions);

module.exports = router;
