const asyncHandler = require("express-async-handler");
const Review = require("../models/Review.model");
const Product = require("../models/Product.model");
const User = require("../models/User.model");

// Helper function to calculate and update product ratings
const updateProductRatings = asyncHandler(async (productId) => {
  const reviews = await Review.find({ product: productId });

  if (reviews.length === 0) {
    // No reviews, reset ratings
    await Product.findByIdAndUpdate(productId, {
      "ratings.average": 0,
      "ratings.count": 0,
    });
  } else {
    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Update product with new ratings
    await Product.findByIdAndUpdate(productId, {
      "ratings.average": parseFloat(averageRating.toFixed(1)),
      "ratings.count": reviews.length,
    });
  }
});

// GET /api/reviews/product/:productId - Get all reviews for a product
exports.getReviewsByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = "newest" } = req.query;

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Build sort object
  let sortObj = { createdAt: -1 }; // newest first by default
  if (sort === "helpful") {
    sortObj = { "helpful.count": -1, createdAt: -1 };
  }

  // Fetch reviews with pagination
  const reviews = await Review.find({ product: productId })
    .populate("buyer", "name")
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count for pagination
  const totalReviews = await Review.countDocuments({ product: productId });

  // Transform response to include buyer name and ID
  const reviewsData = reviews.map((review) => ({
    _id: review._id,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    buyerName: review.buyer?.name || "Anonymous",
    buyerId: review.buyer?._id,
    helpful: review.helpful,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  }));

  res.status(200).json({
    success: true,
    data: reviewsData,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalReviews,
      pages: Math.ceil(totalReviews / limit),
    },
  });
});

// GET /api/reviews/check-existing/:productId - Check if current user has reviewed
exports.checkExistingReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  const existingReview = await Review.findOne({
    product: productId,
    buyer: userId,
  });

  if (existingReview) {
    return res.status(200).json({
      success: true,
      hasReview: true,
      data: {
        _id: existingReview._id,
        rating: existingReview.rating,
        title: existingReview.title,
        comment: existingReview.comment,
      },
    });
  }

  res.status(200).json({
    success: true,
    hasReview: false,
    data: null,
  });
});

// POST /api/reviews - Create or update review
exports.createOrUpdateReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;
  const userId = req.user._id;

  // Validation
  if (!productId || !rating) {
    return res.status(400).json({ success: false, message: "Product ID and rating are required" });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
  }

  if (comment && comment.length > 1000) {
    return res.status(400).json({ success: false, message: "Comment cannot exceed 1000 characters" });
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  // Check if review already exists (for update)
  let review = await Review.findOne({
    product: productId,
    buyer: userId,
  });

  if (review) {
    // Update existing review
    review.rating = rating;
    review.title = title || review.title;
    review.comment = comment || review.comment;
    await review.save();
  } else {
    // Create new review
    review = new Review({
      product: productId,
      buyer: userId,
      rating,
      title: title || "",
      comment: comment || "",
    });
    await review.save();
  }

  // Recalculate product ratings
  await updateProductRatings(productId);

  res.status(201).json({
    success: true,
    message: "Review submitted successfully",
    data: {
      _id: review._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
    },
  });
});

// PUT /api/reviews/:id - Update review (owner only)
exports.updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, title, comment } = req.body;
  const userId = req.user._id;

  // Find review
  const review = await Review.findById(id);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  // Check authorization (only owner can update)
  if (review.buyer.toString() !== userId.toString()) {
    return res.status(403).json({ success: false, message: "Unauthorized to update this review" });
  }

  // Validate input
  if (rating) {
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }
    review.rating = rating;
  }

  if (title) review.title = title;
  if (comment) {
    if (comment.length > 1000) {
      return res.status(400).json({ success: false, message: "Comment cannot exceed 1000 characters" });
    }
    review.comment = comment;
  }

  await review.save();

  // Recalculate product ratings
  await updateProductRatings(review.product);

  res.status(200).json({
    success: true,
    message: "Review updated successfully",
    data: {
      _id: review._id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
    },
  });
});

// DELETE /api/reviews/:id - Delete review (owner or admin only)
exports.deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const userRole = req.user.role;

  // Find review
  const review = await Review.findById(id);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  // Check authorization (owner or admin can delete)
  if (review.buyer.toString() !== userId.toString() && userRole !== "admin") {
    return res.status(403).json({ success: false, message: "Unauthorized to delete this review" });
  }

  const productId = review.product;
  await Review.findByIdAndDelete(id);

  // Recalculate product ratings
  await updateProductRatings(productId);

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

// POST /api/reviews/:id/helpful - Toggle helpful vote
exports.toggleHelpful = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  // Find review
  const review = await Review.findById(id);
  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  // Check if user already voted
  const alreadyVoted = review.helpful.userIds.some((id) => id.toString() === userId.toString());

  if (alreadyVoted) {
    // Remove vote
    review.helpful.userIds = review.helpful.userIds.filter((id) => id.toString() !== userId.toString());
    review.helpful.count = Math.max(0, review.helpful.count - 1);
  } else {
    // Add vote
    review.helpful.userIds.push(userId);
    review.helpful.count += 1;
  }

  await review.save();

  res.status(200).json({
    success: true,
    message: alreadyVoted ? "Vote removed" : "Marked as helpful",
    data: {
      count: review.helpful.count,
      userVoted: !alreadyVoted,
    },
  });
});
