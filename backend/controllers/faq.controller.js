const FAQ = require("../models/FAQ.model");
const asyncHandler = require("express-async-handler");

// ─── @GET /api/faqs ─────────────────────────────────────────────────────────────
const getFAQs = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 10, sortBy = "order" } = req.query;

  const query = { isActive: true };
  if (category) query.category = category;

  const skip = (page - 1) * limit;

  const faqs = await FAQ.find(query)
    .sort({ [sortBy]: 1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select("-createdBy");

  const total = await FAQ.countDocuments(query);
  const pages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: faqs,
    pagination: { total, page: parseInt(page), pages, limit: parseInt(limit) },
  });
});

// ─── @GET /api/faqs/:id ─────────────────────────────────────────────────────────
const getFAQById = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq || !faq.isActive) {
    res.status(404);
    throw new Error("FAQ not found");
  }

  // Increment views
  faq.views += 1;
  await faq.save();

  res.json({
    success: true,
    data: faq,
  });
});

// ─── @GET /api/faqs/search ──────────────────────────────────────────────────────
const searchFAQs = asyncHandler(async (req, res) => {
  const { q, category, page = 1, limit = 10 } = req.query;

  if (!q) {
    res.status(400);
    throw new Error("Search query is required");
  }

  const query = { isActive: true };
  if (category) query.category = category;

  const skip = (page - 1) * limit;

  const faqs = await FAQ.find(
    { ...query, $text: { $search: q } },
    { score: { $meta: "textScore" } },
  )
    .sort({ score: { $meta: "textScore" } })
    .skip(skip)
    .limit(parseInt(limit))
    .select("-createdBy");

  const total = await FAQ.countDocuments({
    ...query,
    $text: { $search: q },
  });
  const pages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: faqs,
    pagination: { total, page: parseInt(page), pages, limit: parseInt(limit) },
  });
});

// ─── @GET /api/faqs/category/:category ──────────────────────────────────────────
const getFAQsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const validCategories = [
    "Getting Started",
    "Buying",
    "Selling",
    "Payments",
    "Returns",
    "Account",
    "Shipping",
    "Technical",
    "General",
  ];

  if (!validCategories.includes(category)) {
    res.status(400);
    throw new Error("Invalid category");
  }

  const skip = (page - 1) * limit;

  const faqs = await FAQ.find({ category, isActive: true })
    .sort({ order: 1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select("-createdBy");

  const total = await FAQ.countDocuments({ category, isActive: true });
  const pages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: faqs,
    pagination: { total, page: parseInt(page), pages, limit: parseInt(limit) },
  });
});

// ─── @POST /api/faqs/:id/helpful ────────────────────────────────────────────────
const markFAQHelpful = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    res.status(404);
    throw new Error("FAQ not found");
  }

  faq.helpful += 1;
  await faq.save();

  res.json({
    success: true,
    message: "Thank you for your feedback",
    data: { helpful: faq.helpful, unhelpful: faq.unhelpful },
  });
});

// ─── @POST /api/faqs/:id/unhelpful ──────────────────────────────────────────────
const markFAQUnhelpful = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    res.status(404);
    throw new Error("FAQ not found");
  }

  faq.unhelpful += 1;
  await faq.save();

  res.json({
    success: true,
    message: "Thank you for your feedback",
    data: { helpful: faq.helpful, unhelpful: faq.unhelpful },
  });
});

// ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────────

// ─── @POST /api/admin/faqs ──────────────────────────────────────────────────────
const createFAQ = asyncHandler(async (req, res) => {
  const { title, content, category, tags, order } = req.body;

  if (!title || !content || !category) {
    res.status(400);
    throw new Error("Title, content, and category are required");
  }

  const faq = await FAQ.create({
    title,
    content,
    category,
    tags: tags || [],
    order: order || 0,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "FAQ created successfully",
    data: faq,
  });
});

// ─── @PUT /api/admin/faqs/:id ───────────────────────────────────────────────────
const updateFAQ = asyncHandler(async (req, res) => {
  const { title, content, category, tags, order, isActive } = req.body;

  const faq = await FAQ.findById(req.params.id);
  if (!faq) {
    res.status(404);
    throw new Error("FAQ not found");
  }

  if (title) faq.title = title;
  if (content) faq.content = content;
  if (category) faq.category = category;
  if (tags) faq.tags = tags;
  if (order !== undefined) faq.order = order;
  if (isActive !== undefined) faq.isActive = isActive;

  await faq.save();

  res.json({
    success: true,
    message: "FAQ updated successfully",
    data: faq,
  });
});

// ─── @DELETE /api/admin/faqs/:id ────────────────────────────────────────────────
const deleteFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findById(req.params.id);

  if (!faq) {
    res.status(404);
    throw new Error("FAQ not found");
  }

  await FAQ.deleteOne({ _id: req.params.id });

  res.json({
    success: true,
    message: "FAQ deleted successfully",
  });
});

// ─── @GET /api/admin/faqs ──────────────────────────────────────────────────────
const getAllFAQsAdmin = asyncHandler(async (req, res) => {
  const { category, isActive, page = 1, limit = 10 } = req.query;

  const query = {};
  if (category) query.category = category;
  if (isActive !== undefined) query.isActive = isActive === "true";

  const skip = (page - 1) * limit;

  const faqs = await FAQ.find(query)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await FAQ.countDocuments(query);
  const pages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: faqs,
    pagination: { total, page: parseInt(page), pages, limit: parseInt(limit) },
  });
});

module.exports = {
  getFAQs,
  getFAQById,
  searchFAQs,
  getFAQsByCategory,
  markFAQHelpful,
  markFAQUnhelpful,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getAllFAQsAdmin,
};
