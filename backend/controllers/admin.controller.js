const asyncHandler = require("express-async-handler");
const User = require("../models/User.model");
const Product = require("../models/Product.model");
const Order = require("../models/Order.model");

// ─── @GET /api/admin/dashboard ────────────────────────────────────────────────
const getDashboard = asyncHandler(async (req, res) => {
  const [totalUsers, totalSellers, pendingSellers, totalProducts, totalOrders] =
    await Promise.all([
      User.countDocuments({ role: "buyer" }),
      User.countDocuments({ role: "seller", "sellerInfo.isApproved": true }),
      User.countDocuments({ role: "seller", "sellerInfo.isApproved": false }),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
    ]);

  const revenueAgg = await Order.aggregate([
    { $match: { status: "delivered" } },
    { $group: { _id: null, total: { $sum: "$grandTotal" } } },
  ]);

  res.json({
    success: true,
    data: {
      users: { buyers: totalUsers, sellers: totalSellers, pendingSellers },
      products: totalProducts,
      orders: totalOrders,
      revenue: revenueAgg[0]?.total || 0,
    },
  });
});

// ─── @GET /api/admin/users ────────────────────────────────────────────────────
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } },
  ];

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const [users, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    User.countDocuments(query),
  ]);

  res.json({ success: true, data: users, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

// ─── @PUT /api/admin/users/:id/toggle ────────────────────────────────────────
const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error("User not found"); }
  if (user.role === "admin") { res.status(400); throw new Error("Cannot modify another admin"); }

  user.isActive = !user.isActive;
  await user.save();

  res.json({ success: true, message: `User ${user.isActive ? "activated" : "deactivated"}`, data: user });
});

// ─── @PUT /api/admin/sellers/:id/approve ─────────────────────────────────────
const approveSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== "seller") { res.status(404); throw new Error("Seller not found"); }

  user.sellerInfo.isApproved = true;
  user.sellerInfo.approvedAt = new Date();
  await user.save();

  res.json({ success: true, message: "Seller approved", data: user });
});

// ─── @GET /api/admin/orders ───────────────────────────────────────────────────
const getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { status } : {};
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("buyer", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.json({ success: true, data: orders, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

// ─── @DELETE /api/admin/products/:id ─────────────────────────────────────────
const removeProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) { res.status(404); throw new Error("Product not found"); }

  res.json({ success: true, message: "Product removed from marketplace" });
});

module.exports = { getDashboard, getUsers, toggleUserStatus, approveSeller, getAllOrders, removeProduct };
