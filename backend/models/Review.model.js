const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Buyer is required"],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    helpful: {
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
      userIds: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
  },
  { timestamps: true }
);

// Unique index: one review per buyer per product
reviewSchema.index({ product: 1, buyer: 1 }, { unique: true });

// Index for fetching reviews by product
reviewSchema.index({ product: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
