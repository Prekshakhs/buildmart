const asyncHandler = require("express-async-handler");
const Product = require("../models/Product.model");
const User = require("../models/User.model");
const { cloudinary } = require("../config/cloudinary");
const KARNATAKA_CITIES = require("../config/karnataka-cities");

// ─── @GET /api/products ───────────────────────────────────────────────────────
// Public | Search, filter, sort, paginate
const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    sort = "createdAt",
    order = "desc",
    page = 1,
    limit = 12,
    featured,
    city,
  } = req.query;

  const query = { isActive: true };

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.retailPrice = {};
    if (minPrice) query.retailPrice.$gte = Number(minPrice);
    if (maxPrice) query.retailPrice.$lte = Number(maxPrice);
  }

  // Featured filter
  if (featured === "true") {
    query.isFeatured = true;
  }

  // Location filter - filter by seller's city
  if (city) {
    const sellers = await User.find({
      "address.city": new RegExp(city, "i"),
      role: "seller",
    });
    const sellerIds = sellers.map((s) => s._id);
    query.seller = { $in: sellerIds };
  }

  // Sorting
  const sortOptions = {
    price_asc: { retailPrice: 1 },
    price_desc: { retailPrice: -1 },
    newest: { createdAt: -1 },
    popular: { "ratings.count": -1 },
  };
  const sortObj = sortOptions[sort] || { [sort]: order === "asc" ? 1 : -1 };

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, parseInt(limit));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug icon")
      .populate("seller", "name sellerInfo.businessName address")
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
});

// ─── @GET /api/products/cities ────────────────────────────────────────────
// Public | Get list of cities where sellers are located
const getCities = asyncHandler(async (req, res) => {
  const cities = await User.distinct("address.city", {
    role: "seller",
    isActive: true,
  });

  const sortedCities = cities.filter((c) => c).sort();

  res.json({
    success: true,
    data: sortedCities,
  });
});

// ─── @GET /api/products/cities-with-count ────────────────────────────────
// Public | Get cities with product count - shows availability per city
const getCitiesWithCount = asyncHandler(async (req, res) => {
  // Get product counts by city from all sellers with that city
  const cityProductCounts = await User.aggregate([
    { $match: { role: "seller", isActive: true, "address.city": { $exists: true, $ne: null } } },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "seller",
        as: "sellerProducts",
      },
    },
    {
      $addFields: {
        activeProductsCount: {
          $size: {
            $filter: {
              input: "$sellerProducts",
              as: "product",
              cond: { $eq: ["$$product.isActive", true] },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: "$address.city",
        state: { $first: "$address.state" },
        productCount: { $sum: "$activeProductsCount" },
      },
    },
  ]);

  // Create a map of city to product count for quick lookup
  const cityCountMap = {};
  cityProductCounts.forEach((item) => {
    cityCountMap[item._id] = item.productCount;
  });

  // Build response with all 31 Karnataka cities
  const citiesWithCount = KARNATAKA_CITIES.map(({ city, state }) => ({
    city,
    state,
    productCount: cityCountMap[city] || 0,
  }));

  res.json({
    success: true,
    data: citiesWithCount,
  });
});

// ─── @GET /api/products/:id ───────────────────────────────────────────────────
// Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .populate("seller", "name email sellerInfo.businessName");

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, data: product });
});

// ─── @GET /api/products/slug/:slug ───────────────────────────────────────────
// Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  })
    .populate("category", "name slug")
    .populate("seller", "name sellerInfo.businessName");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.json({ success: true, data: product });
});

// ─── @GET /api/products/:id/similar ───────────────────────────────────────────
// Public | Get 4-6 similar products from same category
const getSimilarProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 6 } = req.query;

  // Get current product
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  // Get similar products from same category, excluding current product
  const similarProducts = await Product.find({
    category: product.category,
    _id: { $ne: id },
    isActive: true,
  })
    .populate("category", "name slug icon")
    .populate("seller", "name sellerInfo.businessName address")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: similarProducts,
  });
});

// ─── @POST /api/products ──────────────────────────────────────────────────────
// Seller | Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    category,
    retailPrice,
    wholesaleTiers,
    stock,
    unit,
    brand,
    tags,
    isFeatured,
  } = req.body;

  // Parse wholesaleTiers if sent as JSON string
  let tiers = wholesaleTiers;
  if (typeof wholesaleTiers === "string") {
    try {
      tiers = JSON.parse(wholesaleTiers);
    } catch {
      tiers = [];
    }
  }

  // Handle uploaded images
  const images = req.files
    ? req.files.map((f) => ({ url: f.path, publicId: f.filename }))
    : [];

  const product = await Product.create({
    name,
    description,
    category,
    retailPrice: Number(retailPrice),
    wholesaleTiers: tiers || [],
    stock: Number(stock),
    unit: unit || "piece",
    brand,
    tags: tags ? tags.split(",").map((t) => t.trim()) : [],
    images,
    seller: req.user._id,
    isFeatured: req.user.role === "admin" ? isFeatured : false,
  });

  await product.populate("category", "name slug");

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

// ─── @PUT /api/products/:id ───────────────────────────────────────────────────
// Seller (own) | Admin (any)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Only the seller who created it, or admin, can update
  if (
    req.user.role !== "admin" &&
    product.seller.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to update this product");
  }

  const allowedFields = [
    "name",
    "description",
    "category",
    "retailPrice",
    "wholesaleTiers",
    "stock",
    "unit",
    "brand",
    "tags",
    "isActive",
  ];
  if (req.user.role === "admin") allowedFields.push("isFeatured");

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      if (field === "wholesaleTiers" && typeof req.body[field] === "string") {
        try {
          product[field] = JSON.parse(req.body[field]);
        } catch {}
      } else if (field === "tags" && typeof req.body[field] === "string") {
        product[field] = req.body[field].split(",").map((t) => t.trim());
      } else {
        product[field] = req.body[field];
      }
    }
  });

  // Add new images if uploaded
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => ({
      url: f.path,
      publicId: f.filename,
    }));
    product.images.push(...newImages);
  }

  const updated = await product.save();
  res.json({ success: true, message: "Product updated", data: updated });
});

// ─── @DELETE /api/products/:id/images/:publicId ───────────────────────────────
// Seller (own) | Admin
const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (
    req.user.role !== "admin" &&
    product.seller.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const { publicId } = req.params;
  await cloudinary.uploader.destroy(publicId);
  product.images = product.images.filter((img) => img.publicId !== publicId);
  await product.save();

  res.json({ success: true, message: "Image removed" });
});

// ─── @DELETE /api/products/:id ────────────────────────────────────────────────
// Seller (own) | Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  if (
    req.user.role !== "admin" &&
    product.seller.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to delete this product");
  }

  // Delete images from Cloudinary
  for (const img of product.images) {
    if (img.publicId) {
      await cloudinary.uploader.destroy(img.publicId);
    }
  }

  await product.deleteOne();
  res.json({ success: true, message: "Product deleted successfully" });
});

module.exports = {
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
};
