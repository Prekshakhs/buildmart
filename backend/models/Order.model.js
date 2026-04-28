const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },      // snapshot at time of order
    image: { type: String },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },  // price per unit applied
    totalPrice: { type: Number, required: true },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    cancellationStatus: {
      type: String,
      enum: ["active", "cancelled"],
      default: "active",
    },
    cancelledAt: Date,
    statusUpdatedAt: Date,
    // Return fields - Flipkart style
    returnStatus: {
      type: String,
      enum: ["none", "requested", "approved", "rejected", "shipped", "received", "refunded"],
      default: "none",
    },
    returnReason: String,
    returnDescription: String,
    returnRequestedAt: Date,
    returnApprovedAt: Date,
    returnShippedAt: Date,
    returnReceivedAt: Date,
    refundProcessedAt: Date,
    returnTrackingId: String,
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      enum: ["razorpay", "stripe", "cod"],
      default: "cod",
    },
    paymentInfo: {
      id: String, // razorpay/stripe payment ID
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      paidAt: Date,
    },
    itemsTotal: { type: Number, required: true },
    shippingCharges: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    deliveredAt: Date,
    cancelledAt: Date,
    cancellationReason: String,
  },
  {
    timestamps: true,
  },
);

// ─── Auto-generate order number before save ───────────────────────────────────
orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `MKT-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
