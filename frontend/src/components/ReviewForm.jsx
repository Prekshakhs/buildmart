import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import ReviewStars from "./ReviewStars";
import { reviewService } from "../api/services";

export default function ReviewForm({
  productId,
  onSubmit,
  initialReview = null,
  onCancel,
  isEditing = false,
}) {
  const [form, setForm] = useState({
    rating: 5,
    title: "",
    comment: "",
  });
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (initialReview) {
      setForm({
        rating: initialReview.rating || 5,
        title: initialReview.title || "",
        comment: initialReview.comment || "",
      });
      setCharCount(initialReview.comment?.length || 0);
    }
  }, [initialReview]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "comment") {
      setCharCount(value.length);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.rating < 1 || form.rating > 5) {
      toast.error("Please select a rating");
      return;
    }

    if (!form.title.trim() && !form.comment.trim()) {
      toast.error("Please provide a title or comment");
      return;
    }

    setLoading(true);
    try {
      const reviewData = {
        productId,
        rating: form.rating,
        title: form.title || "Review",
        comment: form.comment,
      };

      if (isEditing && initialReview?._id) {
        await reviewService.update(initialReview._id, reviewData);
        toast.success("Review updated successfully");
      } else {
        await reviewService.create(reviewData);
        toast.success("Review submitted successfully");
      }

      // Call parent callback
      if (onSubmit) {
        onSubmit();
      }

      // Reset form
      setForm({ rating: 5, title: "", comment: "" });
      setCharCount(0);
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-steel-900 border border-steel-800 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-display font-700 uppercase tracking-widest text-steel-300">
          {isEditing ? "Edit Your Review" : "Share Your Review"}
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1 hover:bg-steel-800 rounded transition-colors"
            type="button"
          >
            <X size={16} className="text-steel-400" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="label mb-2">Rating *</label>
          <div className="flex gap-1">
            <ReviewStars
              rating={form.rating}
              interactive={true}
              onChange={(rating) => handleChange("rating", rating)}
              size="lg"
            />
            <span className="text-sm text-steel-400 ml-2">
              {form.rating} out of 5 stars
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="label">Review Title</label>
          <input
            type="text"
            placeholder="Summarize your experience"
            value={form.title}
            onChange={(e) => handleChange("title", e.target.value)}
            maxLength={100}
            className="input text-xs"
          />
          <p className="text-xs text-steel-500 mt-1 text-right">
            {form.title.length}/100
          </p>
        </div>

        {/* Comment */}
        <div>
          <label className="label">Your Review (Optional)</label>
          <textarea
            placeholder="Share your experience with this product..."
            value={form.comment}
            onChange={(e) => handleChange("comment", e.target.value)}
            maxLength={1000}
            rows="4"
            className="input text-xs resize-none"
          />
          <p className="text-xs text-steel-500 mt-1 text-right">
            {charCount}/1000
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-end pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline text-xs"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn-primary text-xs"
            disabled={loading}
          >
            {loading ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
}
