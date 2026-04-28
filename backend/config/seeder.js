/**
 * Run: node backend/config/seeder.js
 * Seeds default categories into the database
 */

const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: require("path").resolve(__dirname, "../.env") });

const connectDB = require("./db");
const Category = require("../models/Category.model");

const categories = [
  { name: "Construction Materials", description: "Cement, bricks, steel rods, tiles, sand", icon: "🏗️" },
  { name: "Hardware Tools", description: "Drill machines, hammers, screwdrivers, spanners", icon: "🔧" },
  { name: "Plumbing & Electrical", description: "Pipes, taps, wires, switches, sockets", icon: "🔌" },
  { name: "Agriculture Equipment", description: "Sprayers, pumps, mini tillers, irrigation tools", icon: "🌾" },
  { name: "Safety & PPE", description: "Helmets, gloves, boots, safety vests", icon: "🦺" },
  { name: "Paints & Chemicals", description: "Wall paints, primers, solvents, adhesives", icon: "🎨" },
];

const seed = async () => {
  await connectDB();
  await Category.deleteMany({});
  const created = await Category.insertMany(categories);
  console.log(`✅ Seeded ${created.length} categories`);
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeder error:", err);
  process.exit(1);
});
