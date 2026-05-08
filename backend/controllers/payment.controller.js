const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");
const Order = require("../models/Order.model");
const crypto = require("crypto");
const razorpayInstance = require("../config/razorpay");
const { calculatePrice } = require("../utils/pricingCalculator");

// ─── @POST /api/payments/create-order ──────────────────────────────────────
// Create a Razorpay order (get the order_id for checkout modal)
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = "INR" } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error("Valid amount is required");
  }

  try {
    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    console.log("Creating Razorpay order with:", options);
    const razorpayOrder = await razorpayInstance.orders.create(options);
    console.log("Razorpay order created:", razorpayOrder.id);

    res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    console.error("Razorpay Error Details:", {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      response: error.response?.data,
    });
    res.status(400);
    throw new Error(`Failed to create Razorpay order: ${error.message || "Unknown error - check server credentials"}`);
  }
});

// ─── @POST /api/payments/verify ────────────────────────────────────────────
// Verify Razorpay payment signature after user pays
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    res.status(400);
    throw new Error("Payment details are required");
  }

  try {
    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      res.status(400);
      throw new Error("Payment signature verification failed");
    }

    // Fetch payment details from Razorpay to verify amount
    const payment = await razorpayInstance.payments.fetch(razorpay_payment_id);

    if (payment.status !== "captured") {
      res.status(400);
      throw new Error(`Payment status is ${payment.status}, expected 'captured'`);
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: payment.amount,
        status: payment.status,
      },
    });
  } catch (error) {
    res.status(400);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
});

// ─── @POST /api/payments/refund/:orderId ──────────────────────────────────
// Refund a payment (called when order is cancelled after payment)
const refundPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason = "Order cancelled" } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // Verify authorization
  if (
    req.user.role === "buyer" &&
    order.buyer.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to refund this order");
  }

  if (!order.paymentInfo?.id) {
    res.status(400);
    throw new Error("This order has no payment to refund");
  }

  if (order.paymentInfo.status === "refunded") {
    res.status(400);
    throw new Error("This payment has already been refunded");
  }

  try {
    // Create refund in Razorpay
    const refund = await razorpayInstance.payments.refund(order.paymentInfo.id, {
      amount: order.grandTotal * 100, // In paise
      notes: { reason },
    });

    // Update order payment info
    order.paymentInfo.status = "refunded";
    order.paymentInfo.refundId = refund.id;
    order.paymentInfo.refundedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: "Refund processed successfully",
      data: {
        refund_id: refund.id,
        amount: refund.amount,
        status: refund.status,
      },
    });
  } catch (error) {
    res.status(400);
    throw new Error(`Refund failed: ${error.message}`);
  }
});

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  refundPayment,
};
