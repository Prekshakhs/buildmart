const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: require("path").resolve(__dirname, ".env") });

const connectDB = require("./config/db");
const User = require("./models/User.model");

const deleteAdmin = async () => {
  await connectDB();
  
  const result = await User.deleteOne({ email: "admin@buildmart.com" });
  console.log("Admin deleted:", result.deletedCount > 0 ? "✅" : "❌");
  
  process.exit(0);
};

deleteAdmin().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
