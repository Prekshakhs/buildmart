const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: require("path").resolve(__dirname, ".env") });

const connectDB = require("./config/db");
const User = require("./models/User.model");

const checkAdmin = async () => {
  await connectDB();
  
  const admin = await User.findOne({ email: "admin@buildmart.com" }).select("+password");
  
  if (admin) {
    console.log("✅ Admin found:");
    console.log("Email:", admin.email);
    console.log("Name:", admin.name);
    console.log("Role:", admin.role);
    console.log("Active:", admin.isActive);
    console.log("Password Hash:", admin.password);
    
    // Try to match the password
    const isMatch = await admin.matchPassword("Admin@123456");
    console.log("\nPassword match result:", isMatch);
  } else {
    console.log("❌ Admin not found");
  }
  
  process.exit(0);
};

checkAdmin().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
