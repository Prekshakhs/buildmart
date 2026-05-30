const asyncHandler = require("express-async-handler");
const Category = require("../models/Category.model");

// @GET /api/categories — Public
const getCategories = asyncHandler(async (req, res) => {
  console.log("Fetching categories...");
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  console.log("Categories found:", categories.length);
  res.json({ success: true, data: categories });
});

// @POST /api/categories — Admin only
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon } = req.body;
  const category = await Category.create({ name, description, icon });
  res.status(201).json({ success: true, data: category });
});

// @PUT /api/categories/:id — Admin only
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json({ success: true, data: category });
});

// @DELETE /api/categories/:id — Admin only
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.json({ success: true, message: "Category removed" });
});

// @POST /api/categories/seed — Development/Admin only
const seedCategories = asyncHandler(async (req, res) => {
  const categories = [
    { name: "Construction Materials", description: "Cement, sand, brick, gravel, and other construction supplies", icon: "🏗️" },
    { name: "Hardware Tools", description: "Hand tools, power tools, and hardware supplies", icon: "🔧" },
    { name: "Plumbing & Electrical", description: "Pipes, fittings, electrical wires, and components", icon: "🔌" },
    { name: "Agriculture Equipment", description: "Farm tools, equipment, and agricultural supplies", icon: "🌾" },
    { name: "Safety & PPE", description: "Personal protective equipment and safety gear", icon: "🦺" },
    { name: "Paints & Coatings", description: "Interior and exterior paints, varnishes, and coatings", icon: "🎨" },
    { name: "Lumber & Wood", description: "Wood planks, plywood, and wood products", icon: "🪵" },
    { name: "Kitchen & Appliances", description: "Kitchen fixtures and household appliances", icon: "🚪" },
  ];

  await Category.deleteMany({});
  const seeded = await Category.insertMany(categories);
  res.json({ success: true, message: `Seeded ${seeded.length} categories`, data: seeded });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories,
};
