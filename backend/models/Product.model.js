const mongoose = require("mongoose");

// ─── Wholesale Tier Sub-Schema ─────────────────────────────────────────────────
const wholesaleTierSchema = new mongoose.Schema(
  {
    minQty: {
      type: Number,
      required: true,
      min: [1, "Minimum quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    label: String, // e.g. "10+ units", "50+ units"
  },
  { _id: false }
);

// ─── Product Schema ────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [150, "Product name cannot exceed 150 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: String, // Cloudinary public_id for deletion
      },
    ],
    retailPrice: {
      type: Number,
      required: [true, "Retail price is required"],
      min: [0, "Price cannot be negative"],
    },
    wholesaleTiers: {
      type: [wholesaleTierSchema],
      default: [],
      validate: {
        validator: function (tiers) {
          // Ensure tiers are sorted by minQty ascending
          for (let i = 1; i < tiers.length; i++) {
            if (tiers[i].minQty <= tiers[i - 1].minQty) return false;
          }
          return true;
        },
        message: "Wholesale tiers must have unique, ascending minimum quantities",
      },
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    unit: {
      type: String,
      default: "piece",  // piece, kg, litre, bag, metre, etc.
    },
    brand: String,
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String],
    specifications: [
      {
        label: {
          type: String,
          required: true,
          trim: true,
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes for Search & Filtering ───────────────────────────────────────────
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, retailPrice: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });

// ─── Auto-generate slug ────────────────────────────────────────────────────────
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .concat("-", Date.now().toString(36));
  }
  next();
});

// ─── Virtual: inStock ─────────────────────────────────────────────────────────
productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

module.exports = mongoose.model("Product", productSchema);
