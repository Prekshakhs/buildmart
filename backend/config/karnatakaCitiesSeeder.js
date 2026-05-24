/**
 * Add All Karnataka Cities (No Products)
 * Run: node backend/config/karnatakaCitiesSeeder.js
 */

const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const connectDB = require("./db");
const User = require("../models/User.model");

const karnatakacities = [
  { city: "Bangalore", area: "Central" },
  { city: "Mangalore", area: "Coastal" },
  { city: "Mysore", area: "Southern" },
  { city: "Hubli", area: "Northern" },
  { city: "Belgaum", area: "Northern" },
  { city: "Shimoga", area: "Western" },
  { city: "Davangere", area: "Central" },
  { city: "Gulbarga", area: "Northern" },
  { city: "Bijapur", area: "Northern" },
  { city: "Kolar", area: "Eastern" },
  { city: "Chikmagalur", area: "Western" },
  { city: "Tumkur", area: "Central" },
  { city: "Raichur", area: "Southern" },
  { city: "Udupi", area: "Coastal" },
  { city: "Dharwad", area: "Northern" },
];

const addKarnatakaCities = async () => {
  await connectDB();

  try {
    console.log("📍 Adding Karnataka cities...\n");

    let created = 0;
    let skipped = 0;

    for (const cityData of karnatakacities) {
      const { city, area } = cityData;
      const email = `seller-${city.toLowerCase()}@pickmytools.com`;

      const exists = await User.findOne({ email });

      if (!exists) {
        // Create seller in this city with no products
        await User.create({
          name: `${city} Hardware & Construction`,
          email,
          password: "Seller@123456",
          role: "seller",
          phone: "+91-9876543210",
          isActive: true,
          address: {
            street: `Central Market, ${city}`,
            city,
            state: "Karnataka",
            pincode: "560001",
            country: "India",
          },
          sellerInfo: {
            businessName: `${city} Hardware & Construction`,
            gstin: "18AABCT1234H1Z0",
            isApproved: true,
            approvedAt: new Date(),
          },
        });
        console.log(`✅ ${city}, Karnataka (${area}) created`);
        created++;
      } else {
        skipped++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ KARNATAKA CITIES SEEDER COMPLETE!");
    console.log("=".repeat(60));
    console.log(`\n📊 Results:`);
    console.log(`   Created: ${created} new sellers`);
    console.log(`   Skipped: ${skipped} (already exist)`);

    const cities = await User.distinct("address.city", {
      role: "seller",
      isActive: true,
      "address.state": "Karnataka",
    });

    console.log(`\n📍 Total Karnataka Cities in Dropdown: ${cities.length}`);
    cities.sort().forEach((c) => console.log(`   • ${c}`));

    console.log("\n⚠️  Refresh the product page to see updated city list\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

addKarnatakaCities();
