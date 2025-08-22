/**
 * StarIcon Component - Displays a single star with optional filled/half states
 */
const StarIcon = ({ filled, half, className = "w-5 h-5" }) => (
  <div className="relative">
    {/* Empty star background */}
    <svg
      className={`${className} text-gray-300`}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 17.25l-6.16 3.73 1.64-7.03L2.5 9.77l7.19-.61L12 2.5l2.31 6.66 7.19.61-5 4.18 1.64 7.03z"
      />
    </svg>

    {/* Filled portion - conditionally rendered */}
    {filled && (
      <svg
        className={`${className} absolute top-0 left-0 text-orange-500`}
        fill="currentColor"
        viewBox="0 0 24 24"
        style={half ? { clipPath: "inset(0 50% 0 0)" } : {}}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 17.25l-6.16 3.73 1.64-7.03L2.5 9.77l7.19-.61L12 2.5l2.31 6.66 7.19.61-5 4.18 1.64 7.03z"
        />
      </svg>
    )}
  </div>
);

/**
 * Star Rating Component - Displays a 5-star rating with proper filled/half states
 */
const Star = ({ rating, starSize = "w-5 h-5" }) => {
  // Ensure rating is a number between 0 and 5
  const validRating = Math.min(5, Math.max(0, Number(rating) || 0));

  return (
    <div className="flex">
      {Array(5)
        .fill(0)
        .map((_, index) => {
          const starValue = index + 1;
          const filled = validRating >= starValue;
          const half = validRating >= index + 0.5 && validRating < starValue;

          return (
            <StarIcon
              key={index}
              filled={filled}
              half={half}
              className={starSize}
            />
          );
        })}
    </div>
  );
};

export default Star;
