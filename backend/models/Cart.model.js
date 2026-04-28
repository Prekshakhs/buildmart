const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
    priceAtAdd: {
      type: Number,
      required: true, // snapshot of price when item was added
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one cart per user
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// ─── Virtual: totalItems ──────────────────────────────────────────────────────
cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((acc, item) => acc + item.quantity, 0);
});

// ─── Virtual: totalPrice ──────────────────────────────────────────────────────
cartSchema.virtual("totalPrice").get(function () {
  return this.items.reduce((acc, item) => acc + item.priceAtAdd * item.quantity, 0);
});

module.exports = mongoose.model("Cart", cartSchema);
