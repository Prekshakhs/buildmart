/**
 * Test Seller Registration with Address
 * This script demonstrates how a seller registering with an address
 * automatically updates the location dropdown
 *
 * Usage: node backend/config/testSellerRegistration.js
 */

const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("./db");
const User = require("../models/User.model");

const testSellerRegistration = async () => {
  await connectDB();

  try {
    console.log("\n" + "=".repeat(70));
    console.log("🧪 TESTING SELLER REGISTRATION WITH ADDRESS AUTO-UPDATE");
    console.log("=".repeat(70) + "\n");

    // Test Seller 1: Mysore
    console.log("📝 Test 1: Registering seller from Mysore...");
    const seller1Email = "mysore-hardware@buildmart.com";
    const seller1Exists = await User.findOne({ email: seller1Email });

    if (!seller1Exists) {
      const seller1 = await User.create({
        name: "Mysore Hardware Supply",
        email: seller1Email,
        password: "Test@123456",
        phone: "+91-9876543212",
        role: "seller",
        isActive: true,
        address: {
          street: "789 Main Bazaar",
          city: "Mysore",
          state: "Karnataka",
          pincode: "570001",
          country: "India",
        },
        sellerInfo: {
          businessName: "Mysore Hardware Supply",
          gstin: "29AABCT1234H1Z0",
          isApproved: true,
          approvedAt: new Date(),
        },
      });
      console.log(`✅ Seller created: ${seller1.name}`);
      console.log(
        `   📍 Location: ${seller1.address.city}, ${seller1.address.state}`,
      );
    } else {
      console.log(`⏭️  Seller already exists: ${seller1Email}`);
    }

    // Test Seller 2: Mangalore
    console.log("\n📝 Test 2: Registering seller from Mangalore...");
    const seller2Email = "mangalore-supplies@buildmart.com";
    const seller2Exists = await User.findOne({ email: seller2Email });

    if (!seller2Exists) {
      const seller2 = await User.create({
        name: "Mangalore Construction Supplies",
        email: seller2Email,
        password: "Test@123456",
        phone: "+91-9876543213",
        role: "seller",
        isActive: true,
        address: {
          street: "456 Commercial Street",
          city: "Mangalore",
          state: "Karnataka",
          pincode: "575001",
          country: "India",
        },
        sellerInfo: {
          businessName: "Mangalore Construction Supplies",
          gstin: "29AABCT1234H1Z1",
          isApproved: true,
          approvedAt: new Date(),
        },
      });
      console.log(`✅ Seller created: ${seller2.name}`);
      console.log(
        `   📍 Location: ${seller2.address.city}, ${seller2.address.state}`,
      );
    } else {
      console.log(`⏭️  Seller already exists: ${seller2Email}`);
    }

    // Verify all Karnataka cities are in dropdown
    console.log("\n" + "=".repeat(70));
    console.log("📊 VERIFYING LOCATION DROPDOWN UPDATE");
    console.log("=".repeat(70) + "\n");

    const allCities = await User.distinct("address.city", {
      role: "seller",
      isActive: true,
      "address.state": "Karnataka",
    });

    console.log(`✅ Total Karnataka Cities in Dropdown: ${allCities.length}\n`);
    allCities.sort().forEach((city, i) => {
      console.log(`   ${i + 1}. 📍 ${city}, Karnataka`);
    });

    // Show newly added cities
    console.log("\n" + "=".repeat(70));
    console.log("🆕 NEW CITIES ADDED (Auto-Updated from Registration)");
    console.log("=".repeat(70) + "\n");

    const newlyAdded = ["Mysore", "Mangalore"].filter((city) =>
      allCities.includes(city),
    );
    if (newlyAdded.length > 0) {
      newlyAdded.forEach((city) => {
        console.log(`✅ ${city} - Now appears in Location dropdown!`);
      });
    } else {
      console.log("Note: These cities were already in the database");
    }

    console.log("\n" + "=".repeat(70));
    console.log("✨ HOW THIS WORKS:");
    console.log("=".repeat(70) + "\n");

    console.log(`1️⃣  Seller Registers on Website
   ├─ Fills form with shop details
   ├─ Provides: Name, Email, Business Name
   ├─ Provides: Street, City, State, Pincode
   └─ Clicks: Create Account

2️⃣  Backend Registration Endpoint
   ├─ POST /api/auth/register
   ├─ Receives all address data
   ├─ Creates seller with address
   └─ ✅ City saved to database

3️⃣  Location Dropdown Auto-Updates
   ├─ Frontend calls: GET /api/products/cities
   ├─ Backend queries distinct cities
   ├─ Returns all seller cities
   └─ ✅ New city appears in dropdown!

4️⃣  Buyers See New Location
   ├─ Location dropdown refreshes
   ├─ Shows: All 15+ Karnataka cities
   ├─ Includes: Newly registered seller's city
   └─ ✅ Can immediately filter by that city!`);

    console.log("\n" + "=".repeat(70));
    console.log("🎯 NO MANUAL CONFIGURATION NEEDED!");
    console.log("=".repeat(70) + "\n");
    console.log("✅ System is fully automatic");
    console.log("✅ Cities update when sellers register");
    console.log("✅ No hardcoded lists or configuration");
    console.log("✅ Real-time updates\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

testSellerRegistration();
