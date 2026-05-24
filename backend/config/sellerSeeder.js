/**
 * Create Seller Account & Sample Products
 * Run: node backend/config/sellerSeeder.js
 */

const dotenv = require("dotenv");
const mongoose = require("mongoose");
require("path");
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

const connectDB = require("./db");
const User = require("../models/User.model");
const Product = require("../models/Product.model");
const Category = require("../models/Category.model");

const createSellerAndProducts = async () => {
  await connectDB();

  const sellerEmail = "seller@pickmytools.com";
  const sellerPassword = "Seller@123456";

  try {
    // Check if seller already exists
    let seller = await User.findOne({ email: sellerEmail });

    if (!seller) {
      console.log("📝 Creating seller account...");
      seller = await User.create({
        name: "PickMyTools Seller",
        email: sellerEmail,
        password: sellerPassword,
        role: "seller",
        phone: "+91-9876543211",
        isActive: true,
        address: {
          street: "123 Market Street",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560001",
          country: "India",
        },
        sellerInfo: {
          businessName: "PickMyTools Supplies",
          gstin: "18AABCT1234H1Z0",
          isApproved: true,
          approvedAt: new Date(),
        },
      });
      console.log("✅ Seller account created!");
    } else {
      console.log("✅ Seller account already exists!");
    }

    // Fetch category IDs
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // Create sample products with correct schema
    const products = [
      {
        name: "Cement Bag (50kg)",
        description: "High-quality Portland cement for construction. Perfect for concrete mixing, masonry, and RCC work.",
        category: categoryMap["Construction Materials"],
        images: [{ url: "https://via.placeholder.com/400?text=Cement+Bag" }],
        retailPrice: 450,
        wholesaleTiers: [
          { minQty: 10, price: 428 },
          { minQty: 50, price: 405 },
          { minQty: 100, price: 383 },
        ],
        stock: 500,
        unit: "bag",
        brand: "Dalmia",
        isActive: true,
        isFeatured: true,
        seller: seller._id,
      },
      {
        name: "Steel Rod 12mm (12 meters)",
        description: "Corrosion-resistant steel rods for structural reinforcement. Grade: Fe500.",
        category: categoryMap["Construction Materials"],
        images: [{ url: "https://via.placeholder.com/400?text=Steel+Rod" }],
        retailPrice: 580,
        wholesaleTiers: [
          { minQty: 20, price: 534 },
          { minQty: 100, price: 510 },
          { minQty: 500, price: 475 },
        ],
        stock: 300,
        unit: "piece",
        brand: "Tata Steel",
        isActive: true,
        isFeatured: true,
        seller: seller._id,
      },
      {
        name: "Power Drill Machine 13mm",
        description: "Heavy-duty power drill with variable speed control. Perfect for drilling and screwing.",
        category: categoryMap["Hardware Tools"],
        images: [{ url: "https://via.placeholder.com/400?text=Power+Drill" }],
        retailPrice: 2500,
        wholesaleTiers: [
          { minQty: 5, price: 2250 },
          { minQty: 10, price: 2125 },
          { minQty: 25, price: 2000 },
        ],
        stock: 150,
        unit: "piece",
        brand: "Bosch",
        isActive: true,
        isFeatured: true,
        seller: seller._id,
      },
      {
        name: "Agricultural Sprayer 20L",
        description: "Manual agricultural sprayer for pesticides and fertilizers. Durable and easy to use.",
        category: categoryMap["Agriculture Equipment"],
        images: [{ url: "https://via.placeholder.com/400?text=Sprayer" }],
        retailPrice: 1200,
        wholesaleTiers: [
          { minQty: 50, price: 1104 },
          { minQty: 100, price: 1056 },
        ],
        stock: 400,
        unit: "piece",
        brand: "Kisaan",
        isActive: true,
        isFeatured: false,
        seller: seller._id,
      },
      {
        name: "Safety Helmet (Hard Hat)",
        description: "ISI certified safety helmet with adjustable strap. Available in multiple sizes.",
        category: categoryMap["Safety & PPE"],
        images: [{ url: "https://via.placeholder.com/400?text=Safety+Helmet" }],
        retailPrice: 350,
        wholesaleTiers: [
          { minQty: 100, price: 315 },
          { minQty: 500, price: 298 },
        ],
        stock: 1000,
        unit: "piece",
        brand: "JSP",
        isActive: true,
        isFeatured: false,
        seller: seller._id,
      },
      {
        name: "Ceramic Floor Tiles (600x600mm)",
        description: "Premium ceramic floor tiles with high durability and slip resistance. Pack of 10.",
        category: categoryMap["Construction Materials"],
        images: [{ url: "https://via.placeholder.com/400?text=Tiles" }],
        retailPrice: 3500,
        wholesaleTiers: [
          { minQty: 50, price: 3150 },
          { minQty: 200, price: 2975 },
        ],
        stock: 600,
        unit: "pack",
        brand: "Kajaria",
        isActive: true,
        isFeatured: false,
        seller: seller._id,
      },
      {
        name: "Plumbing PVC Pipe 2 inch",
        description: "High-pressure PVC pipes for water supply and drainage. 6 meter length.",
        category: categoryMap["Plumbing & Electrical"],
        images: [{ url: "https://via.placeholder.com/400?text=PVC+Pipe" }],
        retailPrice: 250,
        wholesaleTiers: [
          { minQty: 100, price: 230 },
          { minQty: 500, price: 220 },
        ],
        stock: 800,
        unit: "piece",
        brand: "Supreme",
        isActive: true,
        isFeatured: false,
        seller: seller._id,
      },
      {
        name: "Wall Paint (Emulsion) 20L",
        description: "Premium emulsion paint with 100% smooth finish. Covers up to 2000 sq ft.",
        category: categoryMap["Paints & Chemicals"],
        images: [{ url: "https://via.placeholder.com/400?text=Wall+Paint" }],
        retailPrice: 2800,
        wholesaleTiers: [
          { minQty: 10, price: 2464 },
          { minQty: 50, price: 2296 },
        ],
        stock: 250,
        unit: "can",
        brand: "Asian Paints",
        isActive: true,
        isFeatured: false,
        seller: seller._id,
      },
    ];

    // Delete existing products from this seller
    await Product.deleteMany({ seller: seller._id });

    // Create new products
    const createdProducts = await Product.insertMany(products);

    console.log("\n" + "=".repeat(60));
    console.log("✅ SELLER & PRODUCTS CREATED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📧 Seller Email: " + sellerEmail);
    console.log("🔑 Seller Password: " + sellerPassword);
    console.log("\n📦 Products Added: " + createdProducts.length);
    console.log("\n📋 Products List:");
    createdProducts.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.name} (₹${p.retailPrice})`);
    });
    console.log("\n⚠️  SECURITY: Change password after first login!");
    console.log("=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

createSellerAndProducts();
