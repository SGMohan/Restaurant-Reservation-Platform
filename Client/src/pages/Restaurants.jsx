import { useState, useEffect } from "react";
import { assets, featuresIcon } from "../assets/assets";
import { useNavigate, useSearchParams } from "react-router-dom";
import Star from "../Components/Star";
import { useApp } from "../Context/AppContext";

/**
 * Restaurants page component that displays a list of dining options
 * with filtering and search capabilities
 */
const Restaurants = () => {
  // Router and context hooks
  const [searchParams, setSearchParams] = useSearchParams();
  const { dinings, CURRENCY, fetchDinings } = useApp();
  const navigate = useNavigate();

  // State management
  const [openFilters, setOpenFilters] = useState(false);
  const [filters, setFilters] = useState({
    dietary: [],
    ambiance: [],
    features: [],
    priceRange: [],
    rating: null,
    cuisine: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 4;

  // ========== UTILITY FUNCTIONS ========== //

  /**
   * Generate random rating between 3.0 and 5.0 with 0.5 increments
   * @returns {number} Random rating value
   */
  const generateRandomRating = () => {
    const baseRating = 3 + Math.random() * 2;
    return Math.round(baseRating * 2) / 2;
  };

  /**
   * Generate random review count between 50 and 500
   * @returns {number} Random review count
   */
  const generateRandomReviewCount = () => {
    return Math.floor(Math.random() * 451) + 50;
  };

  /**
   * Handle filter changes for checkboxes
   * @param {boolean} checked - Whether checkbox is checked
   * @param {string} value - Filter value
   * @param {string} type - Filter type (dietary, ambiance, etc.)
   */
  const handleFilterChange = (checked, value, type) => {
    setFilters((prev) => {
      const updatedFilters = { ...prev };
      if (type === "rating") {
        return {
          ...updatedFilters,
          rating: prev.rating === value ? null : value,
        };
      }

      if (checked) {
        updatedFilters[type] = [...prev[type], value];
      } else {
        updatedFilters[type] = prev[type].filter((item) => item !== value);
      }
      return updatedFilters;
    });
    setCurrentPage(1);
  };

  /**
   * Handle price range filter changes
   * @param {Object} range - Price range object
   */
  const handlePriceRangeChange = (range) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: prev.priceRange.some((r) => r.label === range.label)
        ? prev.priceRange.filter((r) => r.label !== range.label)
        : [range],
    }));
    setCurrentPage(1);
  };

  /**
   * Get unique filter options from dining data
   * @param {string} key - Property key to extract options from
   * @returns {Array} Array of unique options
   */
  const getUniqueOptions = (key) => {
    const options = new Set();

    if (!Array.isArray(dinings)) return [];

    dinings.forEach((dining) => {
      if (dining[key]) {
        if (Array.isArray(dining[key])) {
          dining[key].forEach((option) => options.add(option));
        } else {
          options.add(dining[key]);
        }
      }
    });
    return Array.from(options);
  };

  // Generate filter options from actual data
  const dietaryOptions = getUniqueOptions("dietaryOptions");
  const ambianceOptions = getUniqueOptions("ambiance");
  const featuresOptions = getUniqueOptions("features");

  // Price range options
  const priceRangeOptions = [
    { min: 0, max: 299, label: `Under ${CURRENCY}300` },
    { min: 300, max: 499, label: `${CURRENCY}300-${CURRENCY}500` },
    { min: 500, max: 799, label: `${CURRENCY}500-${CURRENCY}800` },
    { min: 800, max: Infinity, label: `${CURRENCY}800+` },
  ];

  // ========== EFFECT HOOKS ========== //

  /**
   * Initialize filters from URL parameters
   */
  useEffect(() => {
    const destination = searchParams.get("destination");
    const cuisineType = searchParams.get("cuisineType");
    const priceOption = searchParams.get("priceOption");

    // Reset filters first
    setFilters({
      dietary: [],
      ambiance: [],
      features: [],
      priceRange: [],
      rating: null,
      cuisine: [],
    });

    // If coming from search, remove cuisineType param
    if (destination && cuisineType) {
      searchParams.delete("cuisineType");
      setSearchParams(searchParams);
    }

    if (priceOption) {
      const priceRangeMap = {
        1: { min: 0, max: 299, label: `Under ${CURRENCY}300` },
        2: { min: 300, max: 499, label: `${CURRENCY}300-${CURRENCY}500` },
        3: { min: 500, max: 799, label: `${CURRENCY}500-${CURRENCY}800` },
        4: { min: 800, max: Infinity, label: `${CURRENCY}800+` },
      };
      const range = priceRangeMap[priceOption];
      if (range) {
        setFilters((prev) => ({
          ...prev,
          priceRange: [range],
        }));
      }
    }

    // Keep cuisine only if it's not from search
    if (cuisineType && !destination) {
      setFilters((prev) => ({
        ...prev,
        cuisine: [cuisineType],
      }));
    }
  }, [searchParams, CURRENCY]);

  /**
   * Filter restaurants based on selected filters and URL parameters
   */
  const filteredRestaurants = Array.isArray(dinings)
    ? dinings.filter((dining) => {
        const destination = searchParams.get("destination");
        const cuisineType = searchParams.get("cuisineType");

        // Destination filter (from URL)
        if (
          destination &&
          !dining.restaurant?.city
            ?.toLowerCase()
            .includes(destination.toLowerCase())
        ) {
          return false;
        }

        // Cuisine type filter (from URL)
        if (
          cuisineType &&
          !dining.cuisineType?.toLowerCase().includes(cuisineType.toLowerCase())
        ) {
          return false;
        }

        // Additional cuisine filter (from sidebar filters)
        if (
          filters.cuisine.length > 0 &&
          !filters.cuisine.some((cuisine) =>
            dining.cuisineType?.toLowerCase().includes(cuisine.toLowerCase())
          )
        ) {
          return false;
        }

        // Dietary restrictions filter
        if (
          filters.dietary.length > 0 &&
          !filters.dietary.some((diet) => dining.dietaryOptions?.includes(diet))
        ) {
          return false;
        }

        // Ambiance filter
        if (
          filters.ambiance.length > 0 &&
          !filters.ambiance.some((amb) => dining.ambiance?.includes(amb))
        ) {
          return false;
        }

        // Features filter
        if (
          filters.features.length > 0 &&
          !filters.features.some((feat) => dining.features?.includes(feat))
        ) {
          return false;
        }

        // Price range filter
        if (filters.priceRange.length > 0) {
          const price = parseInt(dining.priceRange);
          const range = filters.priceRange[0];
          if (price < range.min || price > range.max) {
            return false;
          }
        }

        // Rating filter
        if (filters.rating && dining.rating < filters.rating) {
          return false;
        }

        return true;
      })
    : [];

  /**
   * Clear all filters and URL parameters
   */
  const clearFilters = () => {
    setFilters({
      dietary: [],
      ambiance: [],
      features: [],
      priceRange: [],
      rating: null,
      cuisine: [],
    });
    setCurrentPage(1);
    setSearchParams({});
  };

  // Calculate pagination values
  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRestaurants.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  /**
   * Fetch dining data on component mount
   */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (!Array.isArray(dinings) || dinings.length === 0) {
        await fetchDinings();
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  /**
   * Reset current page when search parameters change
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [searchParams]);

  // Get current destination and cuisine for display
  const currentDestination = searchParams.get("destination");
  const currentCuisine = searchParams.get("cuisineType");

  // ========== SUB-COMPONENTS ========== //

  /**
   * Restaurant skeleton loading component
   */
  const RestaurantSkeleton = () => (
    <div className="flex flex-col md:flex-row gap-6 items-start py-8 border-b border-gray-300 last:pb-30 last:border-0">
      <div className="w-full md:w-[360px] h-[240px] rounded-lg bg-gray-200 animate-pulse"></div>

      <div className="md:w-1/2 flex flex-col gap-4 w-full">
        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        <div className="flex items-center gap-2">
          <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
        </div>
        <div className="flex flex-wrap gap-2 my-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 bg-gray-200 rounded w-20 animate-pulse"
            ></div>
          ))}
        </div>
        <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>
    </div>
  );

  /**
   * Filter skeleton loading component
   */
  const FilterSkeleton = () => (
    <div className="bg-white w-full lg:w-80 border border-gray-300 text-gray-600 max-lg:mb-8 min-lg:mt-16 mb-8">
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-300">
        <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse lg:hidden"></div>
        </div>
      </div>

      <div className="px-5 pt-5 border-b border-gray-200 pb-4">
        <div className="h-5 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2 mt-2">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="px-5 pt-5 border-b border-gray-200 pb-4">
        <div className="h-5 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 mt-2">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        ))}
      </div>

      <div className="px-5 pt-5 pb-4">
        <div className="h-5 bg-gray-200 rounded w-40 mb-2 animate-pulse"></div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-2 mt-2">
            <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-36 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );

  // ========== MAIN RENDER ========== //
  return (
    <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32">
      <div className="w-full lg:w-2/3">
        <div className="flex flex-col items-start text-left">
          <h1 className="font-playfair text-4xl md:text-[40px]">
            Celeste Dining
            {currentDestination && (
              <span className="text-gray-600 text-2xl ml-2">
                in {currentDestination}
              </span>
            )}
          </h1>
          <p className="text-sm md:text-base text-gray-500/90 mt-2 max-w-174">
            Reserve your table—where every dish is a masterpiece, and every
            moment becomes a cherished memory.
          </p>
          {(currentDestination || currentCuisine) && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {currentDestination && (
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  Location: {currentDestination}
                </span>
              )}
              {currentCuisine && (
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  Cuisine: {currentCuisine}
                </span>
              )}
              <button
                onClick={() => {
                  searchParams.delete("destination");
                  searchParams.delete("cuisineType");
                  searchParams.delete("priceOption");
                  setSearchParams(searchParams);
                  clearFilters();
                }}
                className="text-sm text-blue-600 hover:text-blue-800 underline hover:cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          // Show skeleton while loading
          <div className="mt-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <RestaurantSkeleton key={index} />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500 text-lg">
              {currentDestination
                ? `No restaurants found in ${currentDestination} matching your filters.`
                : "No restaurants match your filters."}
            </p>
            <div className="flex gap-4 justify-center mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 hover:cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <>
            {currentItems.map((dining) => {
              // Generate random rating and review count for each restaurant
              const randomRating = generateRandomRating();
              const randomReviewCount = generateRandomReviewCount();

              return (
                <div
                  key={dining._id}
                  className="flex flex-col md:flex-row gap-6 items-start py-8 border-b border-gray-300 last:pb-30 last:border-0"
                >
                  <img
                    onClick={() => {
                      navigate(`/dinings/${dining._id}`);
                      window.scrollTo(0, 0);
                    }}
                    src={dining.images?.[0] || assets.defaultRestaurantImage}
                    alt="Dining-Images"
                    loading="lazy"
                    className="w-full md:w-[360px] h-[240px] rounded-lg shadow-md object-cover hover:cursor-pointer"
                  />

                  <div className="md:w-1/2 flex flex-col gap-2">
                    <p className="text-sm text-gray-500">
                      ({dining.cuisineType})
                    </p>

                    <p
                      onClick={() => {
                        navigate(`/dinings/${dining._id}`);
                        window.scrollTo(0, 0);
                      }}
                      className="text-gray-800 text-3xl font-playfair hover:cursor-pointer"
                    >
                      {dining.restaurant?.name || "Restaurant Name"}
                    </p>
                    <div className="flex items-center">
                      <Star rating={randomRating} />
                      <p className="ml-2 ">{randomReviewCount}+ reviews</p>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 mt-1 text-sm">
                      <img
                        src={assets.locationIcon}
                        alt="locationIcon"
                        className="w-4 h-4"
                      />
                      <span>
                        {dining.restaurant?.address || "Address not available"},{" "}
                        {dining.restaurant?.city || "City not available"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center my-2 gap-4">
                      {dining.features?.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70"
                        >
                          <img
                            src={
                              featuresIcon[feature] || assets.defaultFeatureIcon
                            }
                            alt="feature icon"
                            loading="lazy"
                            className="w-5 h-5"
                          />
                          <p className="text-xs">{feature}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl md:text-xl text-gray-800">
                        {CURRENCY} {dining.priceRange || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {totalPages > 1 && (
              <div className="w-full flex justify-center my-8">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-black hover:bg-gray-100 cursor-pointer"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 flex items-center justify-center rounded-full ${
                            currentPage === page
                              ? "bg-gray-800 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-black hover:bg-gray-100 cursor-pointer"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Filters Sidebar */}
      {isLoading ? (
        <FilterSkeleton />
      ) : (
        <div className="bg-white w-full lg:w-80 border border-gray-300 text-gray-600 max-lg:mb-8 min-lg:mt-16 mb-8">
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-300">
            <p className="text-base font-medium text-gray-800">FILTERS</p>
            <div className="text-xs hover:cursor-pointer flex gap-4">
              <span
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-800"
              >
                CLEAR ALL
              </span>
              <span
                onClick={() => setOpenFilters(!openFilters)}
                className="lg:hidden text-gray-500 hover:text-gray-800"
              >
                {openFilters ? `HIDE` : `SHOW`}
              </span>
            </div>
          </div>

          <div
            className={`${
              openFilters ? "h-auto" : "h-0 lg:h-auto"
            } overflow-hidden transition-all duration-300`}
          >
            {/* Current Destination Display */}
            {currentDestination && (
              <div className="px-5 pt-5 border-b border-gray-200 pb-4">
                <p className="font-medium text-gray-800 pb-2">
                  Current Location
                </p>
                <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md">
                  <span className="text-sm text-blue-800">
                    {currentDestination}
                  </span>
                  <button
                    onClick={() => {
                      searchParams.delete("destination");
                      setSearchParams(searchParams);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Current Cuisine Display */}
            {currentCuisine && (
              <div className="px-5 pt-5 border-b border-gray-200 pb-4">
                <p className="font-medium text-gray-800 pb-2">
                  Current Cuisine
                </p>
                <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md">
                  <span className="text-sm text-blue-800">
                    {currentCuisine}
                  </span>
                  <button
                    onClick={() => {
                      searchParams.delete("cuisineType");
                      setSearchParams(searchParams);
                      setFilters((prev) => ({ ...prev, cuisine: [] }));
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Price Range Filter */}
            <div className="px-5 pt-5 border-b border-gray-200 pb-4">
              <p className="font-medium text-gray-800 pb-2">Price Range</p>
              <div className="flex flex-col gap-2">
                {priceRangeOptions.map((range) => (
                  <label
                    key={range.label}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={filters.priceRange.some(
                        (r) => r.label === range.label
                      )}
                      onChange={() => handlePriceRangeChange(range)}
                      className="accent-pink-600"
                    />
                    {range.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Dietary Restrictions Filter */}
            <div className="px-5 pt-5 border-b border-gray-200 pb-4">
              <p className="font-medium text-gray-800 pb-2">
                Dietary Restrictions
              </p>
              <div className="flex flex-col gap-2">
                {dietaryOptions.map((diet) => (
                  <label key={diet} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.dietary.includes(diet)}
                      onChange={(e) =>
                        handleFilterChange(e.target.checked, diet, "dietary")
                      }
                      className="accent-green-600"
                    />
                    {diet}
                  </label>
                ))}
              </div>
            </div>

            {/* Ambiance Filter */}
            <div className="px-5 pt-5 border-b border-gray-200 pb-4">
              <p className="font-medium text-gray-800 pb-2">Ambiance</p>
              <div className="flex flex-col gap-2">
                {ambianceOptions.map((amb) => (
                  <label key={amb} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.ambiance.includes(amb)}
                      onChange={(e) =>
                        handleFilterChange(e.target.checked, amb, "ambiance")
                      }
                      className="accent-blue-600"
                    />
                    {amb}
                  </label>
                ))}
              </div>
            </div>

            {/* Features Filter */}
            <div className="px-5 pt-5 pb-4 ">
              <p className="font-medium text-gray-800 pb-2">Special Features</p>
              <div className="flex flex-col gap-2">
                {featuresOptions.map((feature) => (
                  <label
                    key={feature}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={filters.features.includes(feature)}
                      onChange={(e) =>
                        handleFilterChange(
                          e.target.checked,
                          feature,
                          "features"
                        )
                      }
                      className="accent-purple-600"
                    />
                    {feature}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
