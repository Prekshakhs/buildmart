import React, { useState, useEffect } from "react";
import { ThumbsUp, Trash2, Edit2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import ReviewStars from "./ReviewStars";
import ReviewForm from "./ReviewForm";
import { reviewService } from "../api/services";
import { useAuth } from "../context/AuthContext";

export default function ReviewList({
  productId,
  onReviewDeleted = null,
  loading: externalLoading = false,
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(externalLoading);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [userVotes, setUserVotes] = useState(new Set());
  const [expandedComments, setExpandedComments] = useState(new Set());
  const { user } = useAuth();

  // Fetch reviews
  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await reviewService.getByProduct(productId, {
        page,
        limit: 10,
        sort: "newest",
      });

      setReviews(data.data || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(pagination.page);
  }, [productId]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await reviewService.delete(reviewId);
      toast.success("Review deleted successfully");
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      if (onReviewDeleted) {
        onReviewDeleted();
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    }
  };

  const handleHelpful = async (reviewId) => {
    try {
      const { data } = await reviewService.markHelpful(reviewId);
      setUserVotes((prev) => {
        const newVotes = new Set(prev);
        if (data.data.userVoted) {
          newVotes.add(reviewId);
        } else {
          newVotes.delete(reviewId);
        }
        return newVotes;
      });

      // Update review count
      setReviews((prev) =>
        prev.map((r) =>
          r._id === reviewId
            ? { ...r, helpful: { ...r.helpful, count: data.data.count } }
            : r
        )
      );
    } catch (error) {
      console.error("Error marking helpful:", error);
      toast.error("Failed to mark as helpful");
    }
  };

  const toggleExpandComment = (reviewId) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchReviews(newPage);
    }
  };

  const handleReviewSubmitted = () => {
    setEditingReviewId(null);
    fetchReviews(pagination.page);
    if (onReviewDeleted) {
      onReviewDeleted();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-steel-400">
        <p className="text-sm">No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Reviews List */}
      {reviews.map((review) => {
        const isCommentTruncated = review.comment && review.comment.length > 200;
        const isExpanded = expandedComments.has(review._id);
        const displayComment = isExpanded
          ? review.comment
          : review.comment?.substring(0, 200) + (isCommentTruncated ? "..." : "");

        return (
          <div key={review._id} className="p-4 bg-steel-900 border border-steel-800 rounded-lg space-y-3">
            {/* Header: Reviewer Name & Date */}
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display font-600 text-sm text-steel-100">
                  {review.buyerName}
                </p>
                <p className="text-xs text-steel-500">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              {user && user._id === review.buyerId && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingReviewId(review._id)}
                    className="p-1 hover:bg-steel-800 rounded transition-colors"
                    title="Edit"
                    type="button"
                  >
                    <Edit2 size={14} className="text-steel-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="p-1 hover:bg-steel-800 rounded transition-colors"
                    title="Delete"
                    type="button"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              )}
            </div>

            {/* Rating */}
            <ReviewStars rating={review.rating} />

            {/* Title */}
            {review.title && (
              <h4 className="font-display font-600 text-sm text-steel-100">
                {review.title}
              </h4>
            )}

            {/* Comment */}
            {review.comment && (
              <div className="space-y-1">
                <p className="text-sm text-steel-300 leading-relaxed">
                  {displayComment}
                </p>
                {isCommentTruncated && (
                  <button
                    onClick={() => toggleExpandComment(review._id)}
                    className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors"
                    type="button"
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            )}

            {/* Helpful Button */}
            <button
              onClick={() => handleHelpful(review._id)}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                userVotes.has(review._id)
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "hover:bg-steel-800 text-steel-400"
              }`}
              type="button"
            >
              <ThumbsUp size={12} />
              <span>Helpful ({review.helpful?.count || 0})</span>
            </button>

            {/* Edit Form (if editing this review) */}
            {editingReviewId === review._id && (
              <div className="mt-4 pt-4 border-t border-steel-700">
                <ReviewForm
                  productId={productId}
                  initialReview={review}
                  isEditing={true}
                  onSubmit={handleReviewSubmitted}
                  onCancel={() => setEditingReviewId(null)}
                />
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded hover:bg-steel-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            <ChevronLeft size={16} className="text-steel-400" />
          </button>

          <span className="text-xs text-steel-400">
            Page {pagination.page} of {pagination.pages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="p-2 rounded hover:bg-steel-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            <ChevronRight size={16} className="text-steel-400" />
          </button>
        </div>
      )}
    </div>
  );
}
