import { Link, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import PropTypes from "prop-types";
import { useApp } from "../Context/AppContext";
import { useState, useEffect } from "react";

/**
 * Dining Card Component
 * Displays individual restaurant/dining information
 */
const DiningCard = ({ dining, index }) => {
  const { CURRENCY } = useApp();
  const [randomRating, setRandomRating] = useState(0);
  const navigate = useNavigate();

  // Function to generate random rating between 3.0 and 5.0 with 0.5 increments
  const generateRandomRating = () => {
    const baseRating = 3 + Math.random() * 2; // Random between 3.0 and 5.0
    return Math.round(baseRating * 2) / 2; // Round to nearest 0.5
  };

  // Generate random rating count when component mounts
  useEffect(() => {
    setRandomRating(generateRandomRating());
  }, []);

  // Safely destructure with the correct structure
  const {
    restaurant = {}, // This contains the restaurant details
    images = [],
    priceRange = "",
  } = dining || {};

  const displayName = restaurant?.name || "Restaurant Name Not Available";
  const displayAddress = restaurant?.address || "Address not available";
  const displayCity = restaurant?.city || "City not available";

  return (
    <Link
      to={`/dinings/${dining._id}`}
      onClick={() => scrollTo(0, 0)}
      className="block h-full rounded-2xl bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
    >
      {/* Image with badge */}
      <div className="relative aspect-[4/3] rounded-t-2xl overflow-hidden">
        <img
          src={images?.[0] || assets.placeholderImage}
          alt={displayName}
          className="w-full h-full object-cover"
        />

        {/* Badge */}
        {index % 2 !== 0 && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 px-3 py-1 rounded-full shadow-sm">
            Best Dining
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 md:p-5">
        {/* Restaurant Name and Rating */}
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-xl md:text-2xl font-medium text-gray-900 line-clamp-1 font-playfair">
            {displayName}
          </h3>
          <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
            <img src={assets.starIconFilled} alt="star" className="w-4 h-4" />
            <span>{randomRating.toFixed(1)}</span>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-start gap-1 text-sm text-gray-600 mb-3">
          <img
            src={assets.locationIcon}
            alt="location"
            className="w-4 h-4 mt-0.5 "
          />
          <span className=" font-medium">
            {displayAddress}, {displayCity}
          </span>
        </div>

        {/* Price and Book Button */}
        <div className="flex justify-between items-center pt-1">
          <div className="flex items-baseline">
            <span className="text-base md:text-lg text-gray-800">
              {CURRENCY} {priceRange || "Price not available"}
            </span>
          </div>

          <button
            className="px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium bg-gray-50 hover:bg-gray-200 hover:cursor-pointer text-gray-800 border border-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            onClick={() => {
              navigate(`/dinings/${dining._id}`);
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </Link>
  );
};

// Prop type validation
DiningCard.propTypes = {
  dining: PropTypes.shape({
    _id: PropTypes.string,
    restaurant: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      address: PropTypes.string,
      city: PropTypes.string,
      rating: PropTypes.number,
    }),
    images: PropTypes.arrayOf(PropTypes.string),
    rating: PropTypes.number,
    priceRange: PropTypes.string,
  }),
  index: PropTypes.number,
};

export default DiningCard;
