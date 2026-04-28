const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("./db");
const User = require("../models/User.model");

const updateSellerAddress = async () => {
  await connectDB();

  try {
    const seller = await User.findOne({ email: "seller@buildmart.com" });
    if (seller) {
      seller.address = {
        street: "123 Market Street",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        country: "India",
      };
      await seller.save();
      console.log("✅ Seller address updated!");
      console.log("📍 Address:", seller.address);
    } else {
      console.log("❌ Seller not found");
    }
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

updateSellerAddress();
