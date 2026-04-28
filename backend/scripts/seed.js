const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("../models/Category.model");

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    // Clear existing categories
    await Category.deleteMany({});
    console.log("Cleared existing categories");

    const categories = [
      {
        name: "Construction Materials",
        description:
          "Cement, sand, brick, gravel, and other construction supplies",
        icon: "🏗️",
        isActive: true,
      },
      {
        name: "Hardware Tools",
        description: "Hand tools, power tools, and hardware supplies",
        icon: "🔧",
        isActive: true,
      },
      {
        name: "Plumbing & Electrical",
        description: "Pipes, fittings, electrical wires, and components",
        icon: "🔌",
        isActive: true,
      },
      {
        name: "Agriculture Equipment",
        description: "Farm tools, equipment, and agricultural supplies",
        icon: "🌾",
        isActive: true,
      },
      {
        name: "Safety & PPE",
        description: "Personal protective equipment and safety gear",
        icon: "🦺",
        isActive: true,
      },
      {
        name: "Paints & Chemicals",
        description: "Paints, varnishes, solvents, and chemical products",
        icon: "🎨",
        isActive: true,
      },
    ];

    // Save each category individually so pre-save hook runs
    const inserted = [];
    for (const catData of categories) {
      const cat = new Category(catData);
      await cat.save();
      inserted.push(cat);
    }

    console.log(`✅ Seeded ${inserted.length} categories`);

    inserted.forEach((cat) => {
      console.log(`  - ${cat.icon} ${cat.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error.message);
    process.exit(1);
  }
};

seedCategories();
