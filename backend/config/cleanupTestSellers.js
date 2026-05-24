/**
 * Remove Test Sellers (Keep Only Bangalore)
 * Run: node backend/config/cleanupTestSellers.js
 */

const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("./db");
const User = require("../models/User.model");
const Product = require("../models/Product.model");

const removeTestSellers = async () => {
  await connectDB();

  try {
    console.log("🗑️  Removing test sellers except Bangalore...\n");

    const sellersToRemove = [
      "seller-delhi@pickmytools.com",
      "seller-mumbai@pickmytools.com",
      "seller-chennai@pickmytools.com",
      "seller-kolkata@pickmytools.com",
      "seller-hyderabad@pickmytools.com",
    ];

    for (const email of sellersToRemove) {
      const seller = await User.findOne({ email });
      if (seller) {
        // Delete seller's products first
        await Product.deleteMany({ seller: seller._id });
        // Delete seller
        await User.deleteOne({ _id: seller._id });
        console.log(`✅ Removed: ${email}`);
      }
    }

    // Keep Bangalore seller
    const bangaloreSeller = await User.findOne({
      email: "seller@pickmytools.com",
    });
    if (bangaloreSeller) {
      console.log(
        `\n✅ Kept: seller@pickmytools.com (Bangalore with 8 products)`,
      );
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ CLEANUP COMPLETE!");
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

removeTestSellers();
