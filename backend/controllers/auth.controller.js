const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const crypto = require("crypto");
const User = require("../models/User.model");
const Session = require("../models/Session.model");
const tokenService = require("../services/tokenService");
const emailService = require("../services/emailService");
const rateLimitService = require("../services/rateLimitService");
const activityLogger = require("../services/activityLogger");
const { createSession } = require("../services/sessionService");
const securityAlertService = require("../services/securityAlertService");
const distanceCalculator = require("../utils/distanceCalculator");

// ─── Validation Rules ──────────────────────────────────────────────────────────
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and numbers"),
  body("role")
    .optional()
    .isIn(["buyer", "seller"])
    .withMessage("Role must be buyer or seller"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

const passwordValidation = [
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain uppercase, lowercase, and numbers"),
];

// ─── @POST /api/auth/register ──────────────────────────────────────────────────
const register = [
  ...registerValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      name,
      email,
      password,
      role,
      phone,
      businessName,
      gstin,
      street,
      city,
      state,
      pincode,
      country,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("Email already registered");
    }

    const userData = {
      name,
      email,
      password,
      role: role || "buyer",
      emailVerified: false,
    };

    if (phone) userData.phone = phone;
    if (city || street || state || pincode) {
      userData.address = {
        street: street || "",
        city: city || "",
        state: state || "",
        pincode: pincode || "",
        country: country || "India",
      };
      // Auto-geocode address from city
      if (city) {
        const coords = distanceCalculator.getCityCoordinates(city);
        if (coords) {
          userData.address.latitude = coords.latitude;
          userData.address.longitude = coords.longitude;
        }
      }
    }

    if (role === "seller" && businessName) {
      userData.sellerInfo = {
        businessName,
        gstin: gstin || "",
      };
    }

    const user = await User.create(userData);

    const verificationToken = user.generateEmailToken();
    await user.save();

    try {
      await emailService.sendVerificationEmail(user, verificationToken);
    } catch (error) {
      console.error("Error sending verification email:", error);
    }

    res.status(201).json({
      success: true,
      message: "Account created. Please check your email to verify.",
      user: user.toJSON(),
    });
  }),
];

// ─── @GET /api/auth/verify-email ───────────────────────────────────────────────
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    res.status(400);
    throw new Error("Verification token required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired verification token");
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  try {
    await activityLogger.log(user._id, "email_verified", {
      status: "success",
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }

  res.json({
    success: true,
    message: "Email verified successfully. You can now login.",
  });
});

// ─── @POST /api/auth/login ─────────────────────────────────────────────────────
const login = [
  ...loginValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress || "unknown";

    try {
      rateLimitService.checkLoginAttempt(email, ip);
    } catch (error) {
      await activityLogger.log(null, "failed_login", {
        reason: "Rate limited",
        ipAddress: ip,
        userAgent: req.get("user-agent"),
        status: "failed",
      });
      res.status(429);
      throw error;
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      rateLimitService.recordFailedAttempt(email, ip);

      // Create alert for failed login
      if (user) {
        const failedAttempts = rateLimitService.getAttempts(email, ip)?.count || 1;
        await securityAlertService.createAlert(
          user._id,
          "failed_login",
          securityAlertService.alertTemplates.failedLogin(ip, failedAttempts)
        );
      }

      await activityLogger.log(
        user?._id,
        "failed_login",
        {
          reason: "Invalid credentials",
          ipAddress: ip,
          userAgent: req.get("user-agent"),
          status: "failed",
        }
      );
      res.status(401);
      throw new Error("Invalid email or password");
    }

    if (!user.emailVerified) {
      res.status(403);
      throw new Error("Please verify your email first");
    }

    if (user.isLocked()) {
      await securityAlertService.createAlert(
        user._id,
        "account_locked",
        securityAlertService.alertTemplates.accountLocked(ip)
      );

      await activityLogger.log(user._id, "failed_login", {
        reason: "Account locked",
        ipAddress: ip,
        userAgent: req.get("user-agent"),
        status: "failed",
      });
      res.status(403);
      throw new Error("Account locked due to multiple failed attempts. Try again later.");
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error("Account deactivated. Contact support.");
    }

    const { accessToken, refreshToken } = await tokenService.generateTokens(
      user._id,
      user.role,
      user
    );

    user.lastLogin = new Date();
    user.lastActive = new Date();
    await user.resetLoginAttempts();
    rateLimitService.recordSuccessfulLogin(email, ip);

    await activityLogger.log(user._id, "login", {
      ipAddress: ip,
      userAgent: req.get("user-agent"),
      status: "success",
    });

    // Create session record for device tracking
    const session = await createSession(user._id, accessToken, req);

    // Create security alert for new login
    const deviceInfo = securityAlertService.extractDeviceInfo(
      req.get("user-agent")
    );
    await securityAlertService.createAlert(
      user._id,
      "login",
      securityAlertService.alertTemplates.newLogin(deviceInfo, ip)
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({
      success: true,
      message: "Login successful",
      user: user.toJSON(),
      token: accessToken,
    });
  }),
];

// ─── @POST /api/auth/logout ────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const accessToken = req.cookies.accessToken;

  if (refreshToken) {
    try {
      await tokenService.revokeToken(req.user._id, refreshToken, User);
    } catch (error) {
      console.error("Error revoking token:", error);
    }
  }

  // Revoke the session
  if (accessToken) {
    try {
      await Session.findOneAndUpdate(
        { token: accessToken, userId: req.user._id },
        {
          isRevoked: true,
          isActive: false,
          revokedAt: new Date(),
          revokeReason: "User logout",
        }
      );
    } catch (error) {
      console.error("Error revoking session:", error);
    }
  }

  await activityLogger.log(req.user._id, "logout", {
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
    status: "success",
  });

  // Create alert for logout
  const deviceInfo = securityAlertService.extractDeviceInfo(
    req.get("user-agent")
  );
  await securityAlertService.createAlert(
    req.user._id,
    "logout",
    securityAlertService.alertTemplates.sessionRevoked(deviceInfo)
  );

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// ─── @POST /api/auth/refresh ───────────────────────────────────────────────────
const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401);
    throw new Error("Refresh token not found");
  }

  try {
    const { accessToken } = await tokenService.refreshAccessToken(
      refreshToken,
      User
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.json({
      success: true,
      message: "Token refreshed",
      token: accessToken,
    });
  } catch (error) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(401);
    throw new Error("Invalid or expired refresh token");
  }
});

// ─── @POST /api/auth/forgot-password ────────────────────────────────────────────
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({
      success: true,
      message: "If email exists, you will receive reset instructions",
    });
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save();

  try {
    await emailService.sendPasswordResetEmail(user, resetToken);
    await activityLogger.log(user._id, "password_reset", {
      reason: "Password reset requested",
      status: "success",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    throw error;
  }

  res.json({
    success: true,
    message: "If email exists, you will receive reset instructions",
  });
});

// ─── @POST /api/auth/reset-password ────────────────────────────────────────────
const resetPassword = [
  ...passwordValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    if (!token) {
      res.status(400);
      throw new Error("Reset token required");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      throw new Error("Invalid or expired reset token");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await tokenService.revokeAllTokens(user._id, User);

    await activityLogger.log(user._id, "password_reset", {
      reason: "Password reset completed",
      status: "success",
    });

    try {
      await emailService.sendSecurityAlert(user, "password_changed");
    } catch (error) {
      console.error("Error sending security alert:", error);
    }

    res.json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    });
  }),
];

// ─── @GET /api/auth/me ─────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user: user.toJSON() });
});

// ─── @PUT /api/auth/change-password ────────────────────────────────────────────
const changePassword = [
  body("currentPassword").notEmpty().withMessage("Current password required"),
  ...passwordValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.matchPassword(currentPassword))) {
      res.status(400);
      throw new Error("Current password is incorrect");
    }

    if (currentPassword === newPassword) {
      res.status(400);
      throw new Error("New password must be different from current password");
    }

    user.password = newPassword;
    await user.save();

    await tokenService.revokeAllTokens(user._id, User);

    // Create security alert for password change
    await securityAlertService.createAlert(
      user._id,
      "password_changed",
      securityAlertService.alertTemplates.passwordChanged()
    );

    await activityLogger.log(user._id, "password_reset", {
      reason: "Password changed by user",
      status: "success",
    });

    try {
      await emailService.sendSecurityAlert(user, "password_changed");
    } catch (error) {
      console.error("Error sending security alert:", error);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });
  }),
];

// ─── @GET /api/auth/login-history ──────────────────────────────────────────────
const getLoginHistory = asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  const history = await activityLogger.getLoginHistory(req.user._id, parseInt(limit));

  res.json({
    success: true,
    data: history,
  });
});

// ─── @PUT /api/auth/profile ──────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar, businessName, gstin, address } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;
  if (businessName) user.businessName = businessName;
  if (gstin) user.gstin = gstin;
  if (address) {
    user.address = address;
    // Auto-geocode the address from city name
    if (address.city) {
      const coords = distanceCalculator.getCityCoordinates(address.city);
      if (coords) {
        user.address.latitude = coords.latitude;
        user.address.longitude = coords.longitude;
      }
    }
  }

  await user.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      businessName: user.businessName,
      gstin: user.gstin,
      address: user.address,
    },
  });
});

// ─── @POST /api/auth/upload-avatar ────────────────────────────────────────────────
const uploadAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  if (!req.body.avatar) {
    res.status(400);
    throw new Error("No avatar data provided");
  }

  user.avatar = req.body.avatar;
  await user.save();

  res.json({
    success: true,
    message: "Avatar updated successfully",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    },
  });
});

module.exports = {
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
};
