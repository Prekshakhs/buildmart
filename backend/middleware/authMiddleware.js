const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User.model");

// ─── Protect: Verify JWT Token ─────────────────────────────────────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("User not found");
    }

    if (!req.user.isActive) {
      res.status(403);
      throw new Error("Your account has been deactivated");
    }

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized, token failed");
  }
});

// ─── Role Authorization ────────────────────────────────────────────────────────
// Usage: authorize("admin"), authorize("seller", "admin")
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Role '${req.user.role}' is not authorized to access this route`);
    }
    next();
  };
};

// ─── Seller Approval Check ─────────────────────────────────────────────────────
const requireApprovedSeller = (req, res, next) => {
  if (req.user.role === "seller" && !req.user.sellerInfo?.isApproved) {
    res.status(403);
    throw new Error("Your seller account is pending approval");
  }
  next();
};

module.exports = { protect, authorize, requireApprovedSeller };
