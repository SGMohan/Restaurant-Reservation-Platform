import { useNavigate } from "react-router-dom";
import DiningCard from "./DiningCard";
import { useApp } from "../Context/AppContext";
import { useEffect } from "react";

/**
 * Dining Destination Component
 * Displays a section with featured dining destinations
 */
const DiningDestination = () => {
  const navigate = useNavigate();
  const { dinings, loadingUser, fetchDinings } = useApp();

  // Fetch dining data on component mount
  useEffect(() => {
    fetchDinings();
  }, [fetchDinings]);

  // Show loading spinner while data is being fetched
  if (loadingUser) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  return (
    dinings.length > 0 && (
      <section className="w-full bg-slate-50 py-12 md:py-18 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-4xl font-semibold font-playfair text-gray-900 mb-4">
              Dining Destinations
            </h2>
            <p className="text-md text-gray-600 max-w-2xl mx-auto">
              Discover our curated selection of exceptional restaurants around
              the city, offering exquisite cuisines and unforgettable dining
              experiences.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {dinings.slice(0, 4).map((dining, index) => (
              <DiningCard key={dining._id} dining={dining} index={index} />
            ))}
          </div>
        </div>

        <div className="flex justify-center my-14">
          <button
            onClick={() => {
              navigate("/restaurants");
              scrollTo(0, 0);
            }}
            className="px-6 py-3 text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-100 transition-all cursor-pointer"
          >
            View All Restaurants
          </button>
        </div>
      </section>
    )
  );
};

export default DiningDestination;
