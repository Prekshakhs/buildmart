const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "FAQ title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
      index: true,
    },
    content: {
      type: String,
      required: [true, "FAQ content is required"],
      minlength: [10, "Content must be at least 10 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Getting Started",
        "Buying",
        "Selling",
        "Payments",
        "Returns",
        "Account",
        "Shipping",
        "Technical",
        "General",
      ],
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    unhelpful: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Index for search functionality
faqSchema.index({ title: "text", content: "text", tags: "text" });

module.exports = mongoose.model("FAQ", faqSchema);
