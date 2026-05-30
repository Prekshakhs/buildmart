require("dotenv").config();
const mongoose = require("mongoose");

console.log("Testing MongoDB Atlas connection...");
console.log(
  "Connection string:",
  process.env.MONGO_URI.substring(0, 50) + "...",
);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
  })
  .then(() => {
    console.log("✅ Successfully connected to MongoDB Atlas!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection failed:");
    console.error("Error:", err.message);
    console.error("Code:", err.code);
    process.exit(1);
  });
