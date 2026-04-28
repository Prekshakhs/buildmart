const express = require("express");
const router = express.Router();
const {
  getProducts,
  getCities,
  getCitiesWithCount,
  getProductById,
  getProductBySlug,
  getSimilarProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
} = require("../controllers/product.controller");
const {
  protect,
  authorize,
  requireApprovedSeller,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ─── Public Routes ─────────────────────────────────────────────────────────────
router.get("/", getProducts);
router.get("/cities", getCitiesWithCount);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id/similar", getSimilarProducts);
router.get("/:id", getProductById);

// ─── Seller / Admin Protected Routes ──────────────────────────────────────────
router.post(
  "/",
  protect,
  authorize("seller", "admin"),
  requireApprovedSeller,
  upload.array("images", 5),
  createProduct,
);

router.put(
  "/:id",
  protect,
  authorize("seller", "admin"),
  upload.array("images", 5),
  updateProduct,
);

router.delete(
  "/:id/images/:publicId",
  protect,
  authorize("seller", "admin"),
  deleteProductImage,
);

router.delete("/:id", protect, authorize("seller", "admin"), deleteProduct);

module.exports = router;
