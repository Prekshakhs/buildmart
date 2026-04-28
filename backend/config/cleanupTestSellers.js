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
      "seller-delhi@buildmart.com",
      "seller-mumbai@buildmart.com",
      "seller-chennai@buildmart.com",
      "seller-kolkata@buildmart.com",
      "seller-hyderabad@buildmart.com",
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
      email: "seller@buildmart.com",
    });
    if (bangaloreSeller) {
      console.log(
        `\n✅ Kept: seller@buildmart.com (Bangalore with 8 products)`,
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
