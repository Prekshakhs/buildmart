const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Product = require("../models/Product.model");
const Category = require("../models/Category.model");

const sampleProducts = [
  {
    name: "Power Drill Professional",
    description: "Heavy-duty power drill for professional use",
    price: 4500,
    category: "Power Tools",
    seller: "TechTools Co",
    image: "https://via.placeholder.com/300?text=Power+Drill",
    stock: 25,
    featured: true,
  },
  {
    name: "Cement Bags (50kg)",
    description: "High-quality cement for construction",
    price: 450,
    category: "Construction Materials",
    seller: "BuildRight",
    image: "https://via.placeholder.com/300?text=Cement",
    stock: 100,
    featured: true,
  },
  {
    name: "Steel Rods (12mm)",
    description: "Premium quality steel reinforcement bars",
    price: 650,
    category: "Steel Products",
    seller: "SteelMax",
    image: "https://via.placeholder.com/300?text=Steel+Rods",
    stock: 50,
    featured: true,
  },
  {
    name: "Hammer Set (5 pieces)",
    description: "Professional hammer set with various sizes",
    price: 1200,
    category: "Hand Tools",
    seller: "ToolMaster",
    image: "https://via.placeholder.com/300?text=Hammer+Set",
    stock: 40,
    featured: false,
  },
  {
    name: "Safety Helmet",
    description: "OSHA compliant safety helmet for construction",
    price: 350,
    category: "Safety Equipment",
    seller: "SafeGuard",
    image: "https://via.placeholder.com/300?text=Safety+Helmet",
    stock: 200,
    featured: true,
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clear existing products
    await Product.deleteMany({});
    console.log("🗑️ Cleared existing products");

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log("✅ Sample products added:", sampleProducts.length);

    console.log("🎉 Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    process.exit(1);
  }
}

seedDatabase();
