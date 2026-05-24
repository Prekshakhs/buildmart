const mongoose = require("mongoose");
require("dotenv").config();

const User = require("../models/User.model");
const Product = require("../models/Product.model");
const Category = require("../models/Category.model");

const seedTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB\n");

    // ─── Create test users ───────────────────────────────────────────────────────
    console.log("📝 Creating test users...");

    const testBuyer = new User({
      name: "John Buyer",
      email: "buyer@pickmytools.com",
      password: "Buyer@123",
      role: "buyer",
      phone: "+91-9876543210",
      address: {
        street: "123 Market Street",
        city: "Delhi",
        state: "Delhi",
        pincode: "110001",
        country: "India",
      },
      isActive: true,
    });

    const testSeller = new User({
      name: "PickMyTools Supplies",
      email: "seller@pickmytools.com",
      password: "Seller@123",
      role: "seller",
      phone: "+91-9987654321",
      address: {
        street: "456 Business Avenue",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        country: "India",
      },
      sellerInfo: {
        businessName: "PickMyTools Supplies Pvt Ltd",
        gstin: "27AAWFR1234H1Z0",
        isApproved: true,
        approvedAt: new Date(),
      },
      isActive: true,
    });

    const seller = await testSeller.save();
    const buyer = await testBuyer.save();
    console.log(`  ✅ Buyer: ${buyer.email}`);
    console.log(`  ✅ Seller: ${seller.email}\n`);

    // ─── Get categories ───────────────────────────────────────────────────────────
    console.log("📦 Fetching categories...");
    const categories = await Category.find();
    console.log(`  Found ${categories.length} categories\n`);

    // ─── Create sample products ────────────────────────────────────────────────────
    console.log("🛍️  Creating sample products...");

    const productImages = {
      construction: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=500",
      hardware: "https://images.unsplash.com/photo-1569163139394-de4798aa62b5?w=500",
      plumbing: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500",
      agriculture: "https://images.unsplash.com/photo-1574116905036-44f62e32ce6f?w=500",
      safety: "https://images.unsplash.com/photo-1517134191602-b2fbc62412da?w=500",
      paint: "https://images.unsplash.com/photo-1555356750-849b3c63e7e4?w=500",
    };

    const products = [
      {
        name: "Portland Cement 50kg",
        description:
          "High-quality Portland cement for construction. Suitable for all types of concrete and mortar work. 50kg bag.",
        category: categories.find((c) => c.name === "Construction Materials")?._id,
        images: [{ url: productImages.construction }],
        retailPrice: 450,
        wholesaleTiers: [
          { minQty: 100, price: 420, label: "100+ bags" },
          { minQty: 500, price: 400, label: "500+ bags" },
        ],
        stock: 5000,
        unit: "bag",
        brand: "Dalmia",
        seller: seller._id,
        isFeatured: true,
        tags: ["cement", "construction", "building"],
        specifications: [
          { label: "Type", value: "Portland Cement" },
          { label: "Package Weight", value: "50 kg" },
          { label: "Compressive Strength", value: "42.5 MPa" },
        ],
      },
      {
        name: "Steel Hammer 1kg",
        description:
          "Professional-grade steel hammer with ergonomic handle. Perfect for driving nails and general carpentry work. 1kg head.",
        category: categories.find((c) => c.name === "Hardware Tools")?._id,
        images: [{ url: productImages.hardware }],
        retailPrice: 299,
        wholesaleTiers: [
          { minQty: 50, price: 270, label: "50+ units" },
          { minQty: 200, price: 250, label: "200+ units" },
        ],
        stock: 2000,
        unit: "piece",
        brand: "Stanley",
        seller: seller._id,
        isFeatured: true,
        tags: ["hammer", "tools", "hardware"],
        specifications: [
          { label: "Head Weight", value: "1 kg" },
          { label: "Material", value: "Carbon Steel" },
          { label: "Handle", value: "Ergonomic Fiberglass" },
        ],
      },
      {
        name: "PVC Pipes 1 Inch (per meter)",
        description:
          "High-quality schedule 80 PVC pipes. Suitable for water supply and drainage systems. Price per running meter.",
        category: categories.find((c) => c.name === "Plumbing & Electrical")?._id,
        images: [{ url: productImages.plumbing }],
        retailPrice: 85,
        wholesaleTiers: [
          { minQty: 100, price: 75, label: "100+ meters" },
          { minQty: 500, price: 65, label: "500+ meters" },
        ],
        stock: 10000,
        unit: "metre",
        brand: "Astral",
        seller: seller._id,
        tags: ["pvc", "pipes", "plumbing"],
        specifications: [
          { label: "Diameter", value: "1 inch" },
          { label: "Schedule", value: "80" },
          { label: "Material", value: "Virgin PVC" },
        ],
      },
      {
        name: "Diesel Generator 5KVA",
        description:
          "Heavy-duty diesel generator for agricultural and industrial use. Reliable power backup with automatic choke. 5KVA capacity.",
        category: categories.find((c) => c.name === "Agriculture Equipment")?._id,
        images: [{ url: productImages.agriculture }],
        retailPrice: 65000,
        wholesaleTiers: [
          { minQty: 5, price: 60000, label: "5+ units" },
        ],
        stock: 150,
        unit: "piece",
        brand: "Crompton",
        seller: seller._id,
        isFeatured: true,
        tags: ["generator", "power", "agriculture"],
        specifications: [
          { label: "Power Output", value: "5 KVA" },
          { label: "Fuel Type", value: "Diesel" },
          { label: "Runtime (Full Tank)", value: "8 hours" },
        ],
      },
      {
        name: "Safety Helmet (Hard Hat)",
        description:
          "ANSI Z89.1 certified safety helmet. Protects against impact, falling objects, and electrical hazards. Available in multiple colors.",
        category: categories.find((c) => c.name === "Safety & PPE")?._id,
        images: [{ url: productImages.safety }],
        retailPrice: 380,
        wholesaleTiers: [
          { minQty: 100, price: 320, label: "100+ units" },
          { minQty: 500, price: 280, label: "500+ units" },
        ],
        stock: 3000,
        unit: "piece",
        brand: "3M",
        seller: seller._id,
        tags: ["safety", "helmet", "protection"],
        specifications: [
          { label: "Certification", value: "ANSI Z89.1" },
          { label: "Material", value: "Polycarbonate" },
          { label: "Colors", value: "Red, Yellow, White, Orange" },
        ],
      },
      {
        name: "Exterior Emulsion Paint 20L",
        description:
          "Premium quality exterior emulsion paint with UV protection. Provides long-lasting color and weather resistance. 20L bucket.",
        category: categories.find((c) => c.name === "Paints & Chemicals")?._id,
        images: [{ url: productImages.paint }],
        retailPrice: 2800,
        wholesaleTiers: [
          { minQty: 10, price: 2600, label: "10+ buckets" },
          { minQty: 50, price: 2400, label: "50+ buckets" },
        ],
        stock: 800,
        unit: "litre",
        brand: "Berger",
        seller: seller._id,
        tags: ["paint", "exterior", "coating"],
        specifications: [
          { label: "Type", value: "Acrylic Emulsion" },
          { label: "Coverage", value: "120 sq ft/liter" },
          { label: "Finish", value: "Matt" },
          { label: "UV Protection", value: "Yes" },
        ],
      },
      {
        name: "Sand (River Sand) - Per Bag",
        description:
          "High-quality river sand for concrete mix and masonry work. Clean and graded for optimal construction results. Per 50kg bag.",
        category: categories.find((c) => c.name === "Construction Materials")?._id,
        images: [{ url: productImages.construction }],
        retailPrice: 180,
        wholesaleTiers: [
          { minQty: 100, price: 160, label: "100+ bags" },
        ],
        stock: 10000,
        unit: "bag",
        brand: "Local Supply",
        seller: seller._id,
        tags: ["sand", "construction", "aggregate"],
        specifications: [
          { label: "Type", value: "River Sand" },
          { label: "Package Size", value: "50 kg" },
          { label: "Grade", value: "M" },
        ],
      },
      {
        name: "Cordless Power Drill 20V",
        description:
          "Versatile 20V cordless drill/driver with 2 batteries and charger. Perfect for drilling and fastening in construction work.",
        category: categories.find((c) => c.name === "Hardware Tools")?._id,
        images: [{ url: productImages.hardware }],
        retailPrice: 3500,
        wholesaleTiers: [
          { minQty: 20, price: 3200, label: "20+ units" },
        ],
        stock: 500,
        unit: "piece",
        brand: "Bosch",
        seller: seller._id,
        isFeatured: true,
        tags: ["drill", "power tools", "cordless"],
        specifications: [
          { label: "Voltage", value: "20V" },
          { label: "Batteries Included", value: "2 x 1.3Ah" },
          { label: "Max Drilling Diameter", value: "13mm" },
        ],
      },
    ];

    const createdProducts = [];
    for (const productData of products) {
      const product = new Product(productData);
      await product.save();
      createdProducts.push(product);
      console.log(`  ✅ ${product.name}`);
    }

    console.log(`\n✅ Created ${createdProducts.length} sample products\n`);

    // ─── Summary ────────────────────────────────────────────────────────────────────
    console.log("━".repeat(50));
    console.log("📊 TEST DATA SUMMARY");
    console.log("━".repeat(50));
    console.log("\n👥 Test Users Created:");
    console.log(`  Buyer:  buyer@pickmytools.com / Buyer@123`);
    console.log(`  Seller: seller@pickmytools.com / Seller@123`);
    console.log(`  Admin:  admin@pickmytools.com / Admin@123`);
    console.log(`\n📦 Data Created:`);
    console.log(`  • ${categories.length} Categories`);
    console.log(`  • ${createdProducts.length} Sample Products`);
    console.log(`  • 2 Test Users (Buyer + Seller)`);
    console.log("\n🌐 Application Ready at: http://localhost:5173");
    console.log("━".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
};

seedTestData();
