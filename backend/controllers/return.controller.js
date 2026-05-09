const asyncHandler = require("express-async-handler");
const Order = require("../models/Order.model");
const Product = require("../models/Product.model");
const notificationService = require("../services/notificationService");

// Buyer: Get all their returns
const getMyReturns = asyncHandler(async (req, res) => {
  const { status } = req.query;

  // Find all orders with return requests from this buyer
  const match = { buyer: req.user._id };
  if (status && status !== "all") {
    match["items.returnStatus"] = status;
  }

  const returns = await Order.aggregate([
    { $unwind: "$items" },
    { $match: match },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productData",
      },
    },
    { $sort: { "items.returnRequestedAt": -1 } },
    {
      $project: {
        _id: "$items._id",
        orderId: "$_id",
        productId: "$items.product",
        productName: "$items.name",
        productImage: "$items.image",
        quantity: "$items.quantity",
        refundAmount: "$items.totalPrice",
        reason: "$items.returnReason",
        description: "$items.returnDescription",
        status: "$items.returnStatus",
        initiatedAt: "$items.returnRequestedAt",
        refundedAt: "$items.refundProcessedAt",
        statusHistory: [
          {
            status: "$items.returnStatus",
            updatedAt: "$items.returnRequestedAt",
          },
        ],
      },
    },
  ]);

  res.json({
    success: true,
    data: returns,
  });
});

// Buyer: Request return for an item
const requestReturn = asyncHandler(async (req, res) => {
  const { orderId, itemIndex, reason, description } = req.body;

  if (!orderId || itemIndex === undefined || !reason) {
    res.status(400);
    throw new Error("Order ID, item index, and reason are required");
  }

  const order = await Order.findById(orderId).populate("buyer");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.buyer._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (itemIndex < 0 || itemIndex >= order.items.length) {
    res.status(400);
    throw new Error("Invalid item index");
  }

  const item = order.items[itemIndex];

  // Only allow return for delivered items
  if (item.status !== "delivered") {
    res.status(400);
    throw new Error("Item must be delivered to return");
  }

  // 30-day return window
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  if (new Date(order.deliveredAt) < thirtyDaysAgo) {
    res.status(400);
    throw new Error("Return window expired (30 days from delivery)");
  }

  // Don't allow multiple returns for same item
  if (item.returnStatus !== "none") {
    res.status(400);
    throw new Error("Return already requested for this item");
  }

  // Update order item
  item.returnStatus = "requested";
  item.returnReason = reason;
  item.returnDescription = description;
  item.returnRequestedAt = new Date();

  await order.save();

  // Send notification
  notificationService.notify(req.user._id, "return_initiated", {
    orderId: order._id,
    orderNumber: order.orderNumber,
    productName: item.name,
    refundAmount: item.totalPrice,
    reason: RETURN_REASONS[reason] || reason,
  });

  res.status(201).json({
    success: true,
    message: "Return request submitted",
    data: order,
  });
});

// Seller: Get all return requests
const getReturnRequests = asyncHandler(async (req, res) => {
  const { page = 1, status = "requested" } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = 10;

  // Find all orders with items that have return requests from this seller
  const orders = await Order.aggregate([
    { $unwind: "$items" },
    {
      $match: {
        "items.seller": req.user._id,
        "items.returnStatus": status,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "buyer",
        foreignField: "_id",
        as: "buyerData",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productData",
      },
    },
    { $sort: { "items.returnRequestedAt": -1 } },
    { $skip: (pageNum - 1) * limitNum },
    { $limit: limitNum },
  ]);

  const total = await Order.aggregate([
    { $unwind: "$items" },
    {
      $match: {
        "items.seller": req.user._id,
        "items.returnStatus": status,
      },
    },
    { $count: "count" },
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: {
      total: total[0]?.count || 0,
      page: pageNum,
      pages: Math.ceil((total[0]?.count || 0) / limitNum),
    },
  });
});

// Seller: Approve return
const approveReturn = asyncHandler(async (req, res) => {
  const { orderId, itemIndex } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const item = order.items[itemIndex];
  if (!item) {
    res.status(400);
    throw new Error("Item not found");
  }

  if (item.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (item.returnStatus !== "requested") {
    res.status(400);
    throw new Error("Invalid return status");
  }

  item.returnStatus = "approved";
  item.returnApprovedAt = new Date();

  await order.save();

  // Send notification to buyer
  notificationService.notify(order.buyer, "return_approved", {
    orderId: order._id,
    productName: item.name,
    refundAmount: item.totalPrice,
  });

  res.json({
    success: true,
    message: "Return approved",
    data: order,
  });
});

// Seller: Reject return
const rejectReturn = asyncHandler(async (req, res) => {
  const { orderId, itemIndex } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const item = order.items[itemIndex];
  if (!item) {
    res.status(400);
    throw new Error("Item not found");
  }

  if (item.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (item.returnStatus !== "requested") {
    res.status(400);
    throw new Error("Invalid return status");
  }

  item.returnStatus = "rejected";

  await order.save();

  // Send notification to buyer
  notificationService.notify(order.buyer, "return_rejected", {
    orderId: order._id,
    orderNumber: order.orderNumber,
    productName: item.name,
  });

  res.json({
    success: true,
    message: "Return rejected",
    data: order,
  });
});

// Buyer: Mark return as shipped
const markReturnShipped = asyncHandler(async (req, res) => {
  const { orderId, itemIndex, trackingId } = req.body;

  const order = await Order.findById(orderId).populate("buyer");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.buyer._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  const item = order.items[itemIndex];
  if (!item) {
    res.status(400);
    throw new Error("Item not found");
  }

  if (item.returnStatus !== "approved") {
    res.status(400);
    throw new Error("Return not approved yet");
  }

  item.returnStatus = "shipped";
  item.returnShippedAt = new Date();
  item.returnTrackingId = trackingId || "Not provided";

  await order.save();

  res.json({
    success: true,
    message: "Return marked as shipped",
    data: order,
  });
});

// Seller: Confirm return received and process refund
const confirmReturnReceived = asyncHandler(async (req, res) => {
  const { orderId, itemIndex } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  const item = order.items[itemIndex];
  if (!item) {
    res.status(400);
    throw new Error("Item not found");
  }

  if (item.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (item.returnStatus !== "shipped") {
    res.status(400);
    throw new Error("Return not shipped yet");
  }

  item.returnStatus = "refunded";
  item.returnReceivedAt = new Date();
  item.refundProcessedAt = new Date();

  // Restore stock
  if (item.product) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity },
    });
  }

  await order.save();

  // Send notification to buyer
  notificationService.notify(order.buyer, "return_refunded", {
    orderId: order._id,
    productName: item.name,
    refundAmount: item.totalPrice,
  });

  res.json({
    success: true,
    message: "Refund processed",
    data: order,
  });
});

module.exports = {
  getMyReturns,
  requestReturn,
  getReturnRequests,
  approveReturn,
  rejectReturn,
  markReturnShipped,
  confirmReturnReceived,
};
