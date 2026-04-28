const asyncHandler = require("express-async-handler");
const Product = require("../models/Product.model");
const Order = require("../models/Order.model");

// ─── @GET /api/seller/dashboard ───────────────────────────────────────────────
// Seller: Summary stats
const getDashboard = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const [totalProducts, activeProducts, outOfStock] = await Promise.all([
    Product.countDocuments({ seller: sellerId }),
    Product.countDocuments({ seller: sellerId, isActive: true, stock: { $gt: 0 } }),
    Product.countDocuments({ seller: sellerId, stock: 0 }),
  ]);

  // Orders containing seller's products
  const orders = await Order.find({
    "items.seller": sellerId,
    status: { $ne: "cancelled" },
  });

  let totalRevenue = 0;
  let totalOrdersCount = 0;
  const statusCounts = { pending: 0, confirmed: 0, shipped: 0, delivered: 0 };

  orders.forEach((order) => {
    const sellerItems = order.items.filter(
      (i) => i.seller?.toString() === sellerId.toString()
    );

    if (sellerItems.length === 0) return;

    const orderRevenue = sellerItems.reduce((sum, i) => sum + i.totalPrice, 0);
    totalRevenue += orderRevenue;
    totalOrdersCount++;

    // Count item-level statuses
    sellerItems.forEach((item) => {
      if (statusCounts[item.status] !== undefined) {
        statusCounts[item.status]++;
      }
    });
  });

  res.json({
    success: true,
    data: {
      products: { total: totalProducts, active: activeProducts, outOfStock },
      orders: { total: totalOrdersCount, ...statusCounts },
      revenue: { total: parseFloat(totalRevenue.toFixed(2)) },
    },
  });
});

// ─── @GET /api/seller/products ────────────────────────────────────────────────
const getSellerProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, isActive } = req.query;
  const query = { seller: req.user._id };

  if (search) query.$text = { $search: search };
  if (isActive !== undefined) query.isActive = isActive === "true";

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
  });
});

// ─── @GET /api/seller/orders ──────────────────────────────────────────────────
const getSellerOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { "items.seller": req.user._id };
  if (status) query.status = status;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("buyer", "name email phone")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);

  // Return only this seller's items in each order
  const filteredOrders = orders.map((order) => {
    const obj = order.toObject();
    obj.items = obj.items.filter(
      (i) => i.seller?.toString() === req.user._id.toString()
    );
    return obj;
  });

  res.json({
    success: true,
    data: filteredOrders,
    pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
  });
});

// ─── @GET /api/seller/dashboard/stats ─────────────────────────────────────────
// Detailed dashboard statistics for seller
const getDashboardStats = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  // Get all orders containing seller's products
  const orders = await Order.find({ "items.seller": sellerId }).lean();

  const stats = {
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    total: 0,
  };

  let thisMonthRevenue = 0;
  let allTimeRevenue = 0;
  let pendingItems = 0;

  const currentDate = new Date();
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  orders.forEach((order) => {
    // Get only this seller's items
    const sellerItems = order.items.filter(
      (i) => i.seller?.toString() === sellerId.toString()
    );

    if (sellerItems.length === 0) return;

    // Calculate revenue
    const itemsRevenue = sellerItems.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
    allTimeRevenue += itemsRevenue;

    // Check if order is from this month and delivered
    if (order.status === "delivered" && order.deliveredAt && new Date(order.deliveredAt) >= monthStart) {
      thisMonthRevenue += itemsRevenue;
    }

    // Count item-level statuses (not order status)
    sellerItems.forEach((item) => {
      if (stats[item.status] !== undefined) {
        stats[item.status]++;
      }
      stats.total++;

      // Count pending items (items in pending/confirmed status)
      if (item.status === "pending" || item.status === "confirmed") {
        pendingItems++;
      }
    });
  });

  res.json({
    success: true,
    data: {
      orders: stats,
      revenue: {
        thisMonth: parseFloat(thisMonthRevenue.toFixed(2)),
        allTime: parseFloat(allTimeRevenue.toFixed(2)),
      },
      pendingItems,
    },
  });
});

// ─── @PUT /api/seller/orders/bulk-status ──────────────────────────────────────
// Bulk update order statuses for seller's items only
const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { orderIds, status, note } = req.body;
  const sellerId = req.user._id;

  // Validate input
  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return res.status(400).json({ success: false, message: "orderIds must be a non-empty array" });
  }

  if (!status) {
    return res.status(400).json({ success: false, message: "status is required" });
  }

  const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status: ${status}` });
  }

  // Get all orders
  const orders = await Order.find({ _id: { $in: orderIds } });

  if (orders.length === 0) {
    return res.status(404).json({ success: false, message: "No orders found" });
  }

  let updatedCount = 0;

  // Update each order, but only the seller's items
  for (const order of orders) {
    const hasSellerItems = order.items.some((item) => item.seller.toString() === sellerId.toString());

    if (!hasSellerItems) {
      continue; // Skip orders that don't have this seller's items
    }

    // Update only the items belonging to this seller
    order.items.forEach((item) => {
      if (item.seller.toString() === sellerId.toString()) {
        item.status = status;
        item.statusUpdatedAt = new Date();
      }
    });

    // Add to status history
    order.statusHistory.push({
      status,
      updatedAt: new Date(),
      note: note || `Items status updated to ${status}`,
    });

    await order.save();
    updatedCount++;
  }

  res.json({
    success: true,
    data: {
      updated: updatedCount,
      failed: orderIds.length - updatedCount,
      message: `${updatedCount} order(s) updated successfully (seller items only)`,
    },
  });
});

module.exports = { getDashboard, getSellerProducts, getSellerOrders, getDashboardStats, bulkUpdateStatus };
