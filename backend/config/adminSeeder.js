/**
 * Create Admin Account
 * Run: node backend/config/adminSeeder.js
 */

const dotenv = require("dotenv");
const mongoose = require("mongoose");
require("path");
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

const connectDB = require("./db");
const User = require("../models/User.model");

const createAdmin = async () => {
  await connectDB();

  const adminEmail = "admin@buildmart.com";
  const adminPassword = "Admin@123456";

  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("❌ Admin already exists with this email!");
      process.exit(1);
    }

    // Create admin user (password will be hashed by User model pre-save hook)
    const admin = await User.create({
      name: "Admin User",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      phone: "+91-9876543210",
      isActive: true,
    });

    console.log("\n✅ Admin Account Created Successfully!\n");
    console.log("📧 Email: " + adminEmail);
    console.log("🔑 Password: " + adminPassword);
    console.log("\n⚠️  SECURITY: Change password after first login!\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();
