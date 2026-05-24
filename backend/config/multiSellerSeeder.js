/**
 * Create Multiple Sellers in Different Cities
 * Run: node backend/config/multiSellerSeeder.js
 */

const dotenv = require("dotenv");
const mongoose = require("mongoose");
require("path");
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

const connectDB = require("./db");
const User = require("../models/User.model");

const sellers = [
  {
    name: "Delhi Hardware Hub",
    email: "seller-delhi@pickmytools.com",
    password: "Seller@123456",
    city: "Delhi",
    state: "Delhi",
    businessName: "Delhi Hardware Hub",
  },
  {
    name: "Mumbai Supplies Co",
    email: "seller-mumbai@pickmytools.com",
    password: "Seller@123456",
    city: "Mumbai",
    state: "Maharashtra",
    businessName: "Mumbai Supplies Co",
  },
  {
    name: "Chennai Construction Materials",
    email: "seller-chennai@pickmytools.com",
    password: "Seller@123456",
    city: "Chennai",
    state: "Tamil Nadu",
    businessName: "Chennai Construction Materials",
  },
  {
    name: "Kolkata Tools",
    email: "seller-kolkata@pickmytools.com",
    password: "Seller@123456",
    city: "Kolkata",
    state: "West Bengal",
    businessName: "Kolkata Tools",
  },
  {
    name: "Hyderabad Hardware",
    email: "seller-hyderabad@pickmytools.com",
    password: "Seller@123456",
    city: "Hyderabad",
    state: "Telangana",
    businessName: "Hyderabad Hardware",
  },
];

const createMultipleSellers = async () => {
  await connectDB();

  try {
    console.log("📍 Creating sellers in multiple cities...\n");

    for (const seller of sellers) {
      const exists = await User.findOne({ email: seller.email });

      if (!exists) {
        await User.create({
          name: seller.name,
          email: seller.email,
          password: seller.password,
          role: "seller",
          phone: "+91-9876543212",
          isActive: true,
          address: {
            street: `123 ${seller.city} Street`,
            city: seller.city,
            state: seller.state,
            pincode: "560001",
            country: "India",
          },
          sellerInfo: {
            businessName: seller.businessName,
            gstin: "18AABCT1234H1Z0",
            isApproved: true,
            approvedAt: new Date(),
          },
        });
        console.log(`✅ ${seller.name} (${seller.city}) created`);
      } else {
        console.log(`⏭️  ${seller.name} (${seller.city}) already exists`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ MULTIPLE SELLERS CREATED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📋 Cities now available in dropdown:");
    const cities = await User.distinct("address.city", {
      role: "seller",
      isActive: true,
    });
    cities.sort().forEach((city) => console.log(`   • ${city}`));
    console.log("\n⚠️  Refresh the product page to see updated city list\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createMultipleSellers();
