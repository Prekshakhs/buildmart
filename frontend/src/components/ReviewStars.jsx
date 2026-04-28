import React from "react";
import { Star } from "lucide-react";

export default function ReviewStars({
  rating = 0,
  count = 0,
  interactive = false,
  onChange = null,
  size = "sm",
}) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6",
  };

  const starSize = sizeClasses[size] || sizeClasses.sm;
  const validRating = Math.min(Math.max(rating || 0, 0), 5);
  const fullStars = Math.floor(validRating);
  const hasHalfStar = validRating % 1 !== 0;

  const handleStarClick = (starValue) => {
    if (interactive && onChange) {
      onChange(starValue);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Stars */}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          let isFilled = false;
          let isHalf = false;

          if (interactive) {
            isFilled = star <= (rating || 0);
          } else {
            isFilled = star <= fullStars;
            isHalf = star === Math.ceil(validRating) && hasHalfStar;
          }

          return (
            <button
              key={star}
              onClick={() => handleStarClick(star)}
              className={`transition-colors ${
                interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
              }`}
              disabled={!interactive}
              type="button"
            >
              {isHalf ? (
                <div className="relative">
                  <Star
                    size={16}
                    className={`${starSize} text-steel-600`}
                    fill="currentColor"
                  />
                  <div className="absolute top-0 left-0 overflow-hidden w-1/2">
                    <Star
                      size={16}
                      className={`${starSize} text-amber-400`}
                      fill="currentColor"
                    />
                  </div>
                </div>
              ) : (
                <Star
                  size={16}
                  className={`${starSize} ${
                    isFilled ? "text-amber-400" : "text-steel-600"
                  }`}
                  fill={isFilled ? "currentColor" : "none"}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Rating Text */}
      {!interactive && (
        <span className="text-xs font-mono text-steel-400">
          {validRating > 0 ? `${validRating.toFixed(1)}` : "No ratings"}{!!count && ` (${count})`}
        </span>
      )}
    </div>
  );
}
