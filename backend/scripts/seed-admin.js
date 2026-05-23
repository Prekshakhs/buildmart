const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User.model");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("✅ Admin already exists:");
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Name: ${existingAdmin.name}`);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: "pickmytool@gmail.com",
      password: "9876543210",
      role: "admin",
      phone: "+91-9876543210",
      isActive: true,
      emailVerified: true, // Admin account pre-verified
    });

    await adminUser.save();
    console.log("✅ Admin user created successfully!");
    console.log("\n📝 Admin Login Details:");
    console.log("━".repeat(40));
    console.log(`  Email:    pickmytool@gmail.com`);
    console.log(`  Password: 9876543210`);
    console.log("━".repeat(40));

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
};

seedAdmin();
