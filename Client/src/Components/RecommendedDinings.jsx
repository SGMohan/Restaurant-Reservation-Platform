import DiningCard from "./DiningCard";
import { useApp } from "../Context/AppContext";
import { useEffect, useState } from "react";

/**
 * Component that displays recommended dining options based on user's recent searches
 */
const RecommendDinings = () => {
  // Get data and functions from app context
  const { dinings, loadingUser, searchRestaurants } = useApp();
  const [recommended, setRecommended] = useState([]);

  /**
   * Filters restaurants based on recent search cities and sorts by most recent search
   */
  const filterRestaurants = () => {
    // Return early if no search data or dining data
    if (!searchRestaurants.length || !dinings.length) {
      setRecommended([]);
      return;
    }

    // Get all unique cities from recent searches
    const recentCities = [
      ...new Set(searchRestaurants.map((search) => search.city)),
    ];

    // Filter dinings that match any of the recent cities
    const filtered = dinings.filter((dining) =>
      recentCities.includes(dining.restaurant.city)
    );

    // Sort by most recent search (prioritize restaurants from cities that were searched more recently)
    filtered.sort((a, b) => {
      const aIndex = searchRestaurants.findLastIndex(
        (search) => search.city === a.restaurant.city
      );
      const bIndex = searchRestaurants.findLastIndex(
        (search) => search.city === b.restaurant.city
      );
      return bIndex - aIndex;
    });

    setRecommended(filtered);
  };

  // Run filter when dependencies change
  useEffect(() => {
    if (!loadingUser && dinings.length) {
      filterRestaurants();
    }
  }, [dinings, searchRestaurants, loadingUser]);

  // Show loading spinner while user data is being fetched
  if (loadingUser) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  // Don't show if no recommendations or no recent searches
  if (!recommended.length || !searchRestaurants.length) return null;

  return (
    <section className="w-full bg-slate-50 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-4xl font-semibold font-playfair text-gray-900 mb-4">
            Popular And Trending Dinings
          </h2>
          <p className="text-md text-gray-600 max-w-2xl mx-auto">
            Based on your searches, we found these restaurants matching your
            preferences in{" "}
            {[...new Set(searchRestaurants.map((s) => s.city))].join(", ")}
          </p>
        </div>

        {/* Recommended dining cards */}
        <div className="flex flex-wrap justify-center gap-6">
          {recommended.slice(0, 3).map((dining, index) => (
            <div key={dining._id} className="max-w-xs">
              <DiningCard dining={dining} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendDinings;
