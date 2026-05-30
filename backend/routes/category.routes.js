const express = require("express");
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories,
} = require("../controllers/category.controller");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", getCategories);
router.post("/seed", seedCategories);
router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
