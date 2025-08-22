import { useMemo } from "react";
import ReviewCard from "./ReviewCard";

/**
 * Component that displays reviews in a horizontal scrolling carousel
 */
const ReviewCarousel = ({ reviews }) => {
  // Limit to first 5 reviews
  const limitedReviews = useMemo(() => reviews.slice(0, 5), [reviews]);

  // Duplicate for infinite scroll effect
  const duplicatedReviews = useMemo(
    () => [...limitedReviews, ...limitedReviews],
    [limitedReviews]
  );

  return (
    <div className="relative w-full overflow-hidden">
      {/* Gradient overlays for fade effect on sides */}
      <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
      <div className="absolute right-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />

      {/* Marquee container with animation */}
      <div
        className="flex w-fit will-change-transform"
        style={{
          animation: `marquee ${limitedReviews.length * 7}s linear infinite`,
        }}
      >
        <div className="flex gap-6 px-4 py-2">
          {duplicatedReviews.map((review, index) => (
            <ReviewCard key={`${review.user}-${index}`} review={review} />
          ))}
        </div>
      </div>

      {/* CSS animation for the marquee effect */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default ReviewCarousel;
