const express = require("express");
const router = express.Router();
const {
  register,
  verifyEmail,
  login,
  logout,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
  getMe,
  changePassword,
  getLoginHistory,
  updateProfile,
  uploadAvatar,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/authMiddleware");

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

// ─── Protected Routes (Authenticated Users) ───────────────────────────────────
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.post("/refresh", refreshAccessToken);
router.put("/change-password", protect, changePassword);
router.get("/login-history", protect, getLoginHistory);
router.put("/profile", protect, updateProfile);
router.post("/upload-avatar", protect, uploadAvatar);

module.exports = router;
