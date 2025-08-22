import React from "react";
import Star from "./Star";

/**
 * Component to display a single review card
 */
const ReviewCard = React.memo(({ review }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm min-w-[300px] max-w-xs">
    {/* User info and rating */}
    <div className="flex items-center gap-4 mb-4">
      <img
        src={review.avatar}
        alt={review.user}
        width={40}
        height={40}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div>
        <p className="font-medium">{review.user}</p>
        <div className="flex items-center gap-1 mt-1">
          <Star rating={review.rating} size="small" />
          <span className="text-xs text-gray-500">
            {new Date(review.date).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>

    {/* Review comment */}
    <p className="text-gray-700">{review.comment}</p>
  </div>
));

export default ReviewCard;
