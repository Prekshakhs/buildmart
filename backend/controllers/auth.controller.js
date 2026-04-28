const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const User = require("../models/User.model");
const generateToken = require("../utils/generateToken");

// ─── Validation Rules ──────────────────────────────────────────────────────────
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
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

// ─── @POST /api/auth/register ─────────────────────────────────────────────────
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
      throw new Error("User with this email already exists");
    }

    const userData = { name, email, password, role: role || "buyer" };
    if (phone) userData.phone = phone;

    // Add address data if provided (for sellers)
    if (city || street || state || pincode) {
      userData.address = {
        street: street || "",
        city: city || "",
        state: state || "",
        pincode: pincode || "",
        country: country || "India",
      };
    }

    if (role === "seller" && businessName) {
      userData.sellerInfo = { businessName, gstin: gstin || "" };
    }

    const user = await User.create(userData);
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerInfo: user.sellerInfo,
        address: user.address,
      },
    });
  }),
];

// ─── @POST /api/auth/login ────────────────────────────────────────────────────
const login = [
  ...loginValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    if (!user.isActive) {
      res.status(403);
      throw new Error("Account deactivated. Contact support.");
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        sellerInfo: user.sellerInfo,
      },
    });
  }),
];

// ─── @GET /api/auth/me ────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// ─── @PUT /api/auth/profile ───────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, address, avatar, sellerInfo } = req.body;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;

  // Update address
  if (address) {
    user.address = {
      ...user.address,
      ...address,
    };
  }

  // Update seller info (only for sellers)
  if (sellerInfo && user.role === "seller") {
    user.sellerInfo = {
      ...user.sellerInfo,
      businessName: sellerInfo.businessName || user.sellerInfo?.businessName,
      gstin: sellerInfo.gstin || user.sellerInfo?.gstin,
    };
  }

  const updated = await user.save();
  res.json({ success: true, message: "Profile updated", user: updated });
});

// ─── @PUT /api/auth/change-password ──────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: "Password changed successfully" });
});

module.exports = { register, login, getMe, updateProfile, changePassword };
