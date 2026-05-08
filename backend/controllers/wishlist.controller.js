const asyncHandler = require("express-async-handler");
const Wishlist = require("../models/Wishlist.model");
const Product = require("../models/Product.model");

// Helper: Get or create wishlist for a user
const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate(
    "items.product"
  );
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
    wishlist = await wishlist.populate("items.product");
  }
  return wishlist;
};

// ─── @GET /api/wishlist ────────────────────────────────────────────────────
// Get user's wishlist with populated products
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);

  res.json({
    success: true,
    data: {
      _id: wishlist._id,
      items: wishlist.items,
      totalItems: wishlist.items.length,
    },
  });
});

// ─── @POST /api/wishlist/add ───────────────────────────────────────────────
// Add product to wishlist
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  try {
    // Get or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    // Check if product already in wishlist
    const alreadyExists = wishlist.items.some(
      (item) => item.product.toString() === productId
    );
    if (alreadyExists) {
      res.status(400);
      throw new Error("Product already in wishlist");
    }

    // Add to wishlist
    wishlist.items.push({
      product: productId,
      addedAt: new Date(),
    });
    await wishlist.save();

    // Populate and return
    await wishlist.populate("items.product");

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      data: {
        _id: wishlist._id,
        items: wishlist.items,
        totalItems: wishlist.items.length,
      },
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// ─── @DELETE /api/wishlist/remove/:productId ───────────────────────────────
// Remove product from wishlist
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      res.status(404);
      throw new Error("Wishlist not found");
    }

    // Remove item
    const initialLength = wishlist.items.length;
    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId
    );

    // Check if anything was removed
    if (wishlist.items.length === initialLength) {
      res.status(404);
      throw new Error("Product not in wishlist");
    }

    await wishlist.save();
    await wishlist.populate("items.product");

    res.json({
      success: true,
      message: "Product removed from wishlist",
      data: {
        _id: wishlist._id,
        items: wishlist.items,
        totalItems: wishlist.items.length,
      },
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// ─── @GET /api/wishlist/status/:productId ──────────────────────────────────
// Check if product is in user's wishlist
const checkWishlistStatus = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    const isWishlisted = wishlist
      ? wishlist.items.some((item) => item.product.toString() === productId)
      : false;

    res.json({
      success: true,
      data: {
        productId,
        isWishlisted,
      },
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// ─── @DELETE /api/wishlist/clear ───────────────────────────────────────────
// Clear entire wishlist
const clearWishlist = asyncHandler(async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      res.status(404);
      throw new Error("Wishlist not found");
    }

    wishlist.items = [];
    await wishlist.save();

    res.json({
      success: true,
      message: "Wishlist cleared successfully",
      data: {
        _id: wishlist._id,
        items: [],
        totalItems: 0,
      },
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistStatus,
  clearWishlist,
};
