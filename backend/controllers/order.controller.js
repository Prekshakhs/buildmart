const asyncHandler = require("express-async-handler");
const Order = require("../models/Order.model");
const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");
const { calculatePrice } = require("../utils/pricingCalculator");

// ─── @POST /api/orders ────────────────────────────────────────────────────────
// Buyer: Place a new order
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod = "cod", razorpay_payment_id } = req.body;

  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address is required");
  }

  // Validate payment method
  if (paymentMethod === "razorpay" && !razorpay_payment_id) {
    res.status(400);
    throw new Error("Razorpay payment ID is required for razorpay payment method");
  }

  // Load cart
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: "items.product",
    select: "name images retailPrice wholesaleTiers stock seller isActive",
  });

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error("Cart is empty");
  }

  // Validate stock and build order items
  const orderItems = [];
  let itemsTotal = 0;

  for (const item of cart.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      res.status(400);
      throw new Error(`Product "${product?.name || "unknown"}" is no longer available`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
    }

    const { unitPrice, totalPrice } = calculatePrice(
      item.quantity,
      product.retailPrice,
      product.wholesaleTiers
    );

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || "",
      quantity: item.quantity,
      unitPrice,
      totalPrice,
      seller: product.seller,
    });

    itemsTotal += totalPrice;
  }

  const shippingCharges = itemsTotal >= 5000 ? 0 : 99; // Free shipping above ₹5000
  const grandTotal = parseFloat((itemsTotal + shippingCharges).toFixed(2));

  // Build payment info
  const paymentInfo =
    paymentMethod === "razorpay"
      ? {
          id: razorpay_payment_id,
          status: "paid",
          paidAt: new Date(),
        }
      : {
          id: null,
          status: "pending",
        };

  // Create order
  const order = await Order.create({
    buyer: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    paymentInfo,
    itemsTotal: parseFloat(itemsTotal.toFixed(2)),
    shippingCharges,
    grandTotal,
    status: paymentMethod === "razorpay" ? "confirmed" : "pending",
    statusHistory: [
      {
        status: paymentMethod === "razorpay" ? "confirmed" : "pending",
        note:
          paymentMethod === "razorpay"
            ? "Payment received, order confirmed"
            : "Order placed",
      },
    ],
  });

  // Decrement stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity },
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  await order.populate("items.product", "name images");

  res.status(201).json({
    success: true,
    message: "Order placed successfully",
    data: order,
  });
});

// ─── @GET /api/orders ─────────────────────────────────────────────────────────
// Buyer: Get own orders
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { buyer: req.user._id };
  if (status) query.status = status;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(20, parseInt(limit));

  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
  });
});

// ─── @GET /api/orders/:id ─────────────────────────────────────────────────────
// Buyer (own order) | Admin
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("buyer", "name email");

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Buyers can only see their own orders
  if (
    req.user.role === "buyer" &&
    order.buyer._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to view this order");
  }

  res.json({ success: true, data: order });
});

// ─── @PUT /api/orders/:id/cancel ─────────────────────────────────────────────
// Buyer: Cancel own order (only if pending)
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  if (order.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized");
  }

  if (!["pending", "confirmed"].includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot cancel an order that is already "${order.status}"`);
  }

  order.status = "cancelled";
  order.cancelledAt = new Date();
  order.cancellationReason = req.body.reason || "Cancelled by buyer";
  order.statusHistory.push({ status: "cancelled", note: order.cancellationReason });

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  await order.save();
  res.json({ success: true, message: "Order cancelled", data: order });
});

// ─── @PUT /api/orders/:id/items/:itemIndex/status ────────────────────────────
// Seller (their items only) | Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const { id, itemIndex } = req.params;
  const validStatuses = ["confirmed", "shipped", "delivered", "cancelled"];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Verify item index is valid
  if (itemIndex < 0 || itemIndex >= order.items.length) {
    res.status(400);
    throw new Error("Invalid item index");
  }

  const item = order.items[itemIndex];

  // Verify seller authorization - seller can only update their own items
  if (req.user.role === "seller" && item.seller.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this item's status (not the seller)");
  }

  // Update only this specific item's status
  item.status = status;
  item.statusUpdatedAt = new Date();

  // Add to order status history with seller info
  const sellerName = req.user.role === "seller" ? req.user.name : "Admin";
  order.statusHistory.push({
    status,
    note: note || `Item "${item.name}" status updated to ${status} by ${sellerName}`,
  });

  if (status === "delivered") {
    item.statusUpdatedAt = new Date(); // Track when item was delivered
  }

  await order.save();
  res.json({
    success: true,
    message: `Item status updated to "${status}"`,
    data: order,
  });
});

// ─── @PUT /api/orders/:id/items/:itemIndex/cancel ──────────────────────────────
// Buyer: Cancel individual item from order
const cancelOrderItem = asyncHandler(async (req, res) => {
  const { itemIndex } = req.params;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Verify buyer ownership
  if (order.buyer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to modify this order");
  }

  // Verify item index is valid
  if (itemIndex < 0 || itemIndex >= order.items.length) {
    res.status(400);
    throw new Error("Invalid item index");
  }

  // Check if order is in cancellable status
  if (!["pending", "confirmed"].includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot cancel items from an order that is "${order.status}"`);
  }

  const item = order.items[itemIndex];

  // Check if item is already cancelled
  if (item.cancellationStatus === "cancelled") {
    res.status(400);
    throw new Error("This item has already been cancelled");
  }

  // Mark item as cancelled
  item.cancellationStatus = "cancelled";
  item.cancelledAt = new Date();

  // Restore stock
  await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });

  // Recalculate order totals
  const activeItems = order.items.filter((i) => i.cancellationStatus === "active");
  const newItemsTotal = activeItems.reduce((sum, i) => sum + (i.totalPrice || 0), 0);
  const newShippingCharges = newItemsTotal >= 5000 ? 0 : 99;
  const newGrandTotal = parseFloat((newItemsTotal + newShippingCharges).toFixed(2));

  order.itemsTotal = parseFloat(newItemsTotal.toFixed(2));
  order.shippingCharges = newShippingCharges;
  order.grandTotal = newGrandTotal;

  // Add to status history
  order.statusHistory.push({
    status: order.status,
    note: `Item "${item.name}" cancelled by buyer`,
  });

  // Check if all items are cancelled - if so, cancel entire order
  const allCancelled = order.items.every((i) => i.cancellationStatus === "cancelled");
  if (allCancelled) {
    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.statusHistory.push({
      status: "cancelled",
      note: "All items cancelled - Order cancelled",
    });
  }

  await order.save();

  res.json({
    success: true,
    message: `Item "${item.name}" cancelled successfully`,
    data: order,
  });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  cancelOrderItem,
  updateOrderStatus,
};
