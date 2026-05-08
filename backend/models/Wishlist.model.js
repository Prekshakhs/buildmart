const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One wishlist per user
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        _id: false, // Prevent MongoDB from creating _id for items
      },
    ],
  },
  { timestamps: true }
);

// Index for efficient lookups (user, product)
wishlistSchema.index({ user: 1, "items.product": 1 });

module.exports = mongoose.model("Wishlist", wishlistSchema);
