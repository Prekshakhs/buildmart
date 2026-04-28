const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    orderNumber: String,
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    productName: String,
    productImage: String,
    itemIndex: Number, // Index in order.items array
    quantity: { type: Number, required: true },
    unitPrice: Number,
    refundAmount: Number,
    reason: {
      type: String,
      enum: [
        "defective",
        "wrong_item",
        "not_as_described",
        "damaged",
        "changed_mind",
        "better_price_elsewhere",
        "quality_issues",
        "other",
      ],
      required: true,
      default: "other",
    },
    description: String,
    images: [String], // Image URLs for return proof
    status: {
      type: String,
      enum: [
        "initiated",
        "pending_seller_approval",
        "approved",
        "rejected",
        "return_shipped",
        "return_received",
        "refund_processed",
        "cancelled",
      ],
      default: "initiated",
    },
    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],
    sellerApprovalNote: String,
    refundedAt: Date,
    returnTrackingId: String,
    returnShippedAt: Date,
    returnReceivedAt: Date,
    initiatedAt: { type: Date, default: Date.now },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Return", returnSchema);
