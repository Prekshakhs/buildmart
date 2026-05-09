const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "order_placed",
        "order_shipped",
        "order_delivered",
        "order_cancelled",
        "return_initiated",
        "return_approved",
        "return_rejected",
        "return_refunded",
        "payment_confirmed",
        "payment_refunded",
        "account_registered",
        "password_reset",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      orderId: mongoose.Schema.Types.ObjectId,
      returnId: mongoose.Schema.Types.ObjectId,
      paymentId: String,
      productName: String,
      amount: Number,
    },
    channels: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
