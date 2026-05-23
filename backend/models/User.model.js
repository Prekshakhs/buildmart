const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: "India" },
    },
    sellerInfo: {
      businessName: String,
      gstin: String,
      isApproved: { type: Boolean, default: false },
      approvedAt: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notificationPreferences: {
      orders: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true },
      },
      returns: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true },
      },
      payments: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true },
      },
      account: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: false },
        inApp: { type: Boolean, default: true },
      },
    },
    // ─── Email Verification ───────────────────────────────────────────
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    // ─── Password Reset ───────────────────────────────────────────────
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // ─── Account Lockout ──────────────────────────────────────────────
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    // ─── Token Revocation ─────────────────────────────────────────────
    refreshTokens: [
      {
        token: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: Date,
        revokedAt: Date,
      },
    ],
    // ─── Login History ────────────────────────────────────────────────
    lastLogin: Date,
    lastActive: Date,
    // ─── 2FA (Future) ─────────────────────────────────────────────────
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
  },
  {
    timestamps: true,
  },
);

// ─── Hash Password Before Save ────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Compare Password Method ──────────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ─── Check if Account is Locked ───────────────────────────────────────────────
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// ─── Increment Failed Login Attempts ───────────────────────────────────────────
userSchema.methods.incLoginAttempts = function () {
  if (this.loginAttempts + 1 >= 5) {
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
  } else {
    this.loginAttempts += 1;
  }
  return this.save();
};

// ─── Reset Failed Login Attempts ──────────────────────────────────────────────
userSchema.methods.resetLoginAttempts = function () {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

// ─── Generate Email Verification Token ────────────────────────────────────────
userSchema.methods.generateEmailToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto.createHash("sha256").update(token).digest("hex");
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

// ─── Generate Password Reset Token ────────────────────────────────────────────
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
  this.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
  return token;
};

// ─── Remove sensitive fields from JSON output ─────────────────────────────────
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.emailVerificationToken;
  delete obj.resetPasswordToken;
  delete obj.refreshTokens;
  return obj;
};

// ─── Indexes for performance ──────────────────────────────────────────────────
userSchema.index({ "address.city": 1, role: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);
