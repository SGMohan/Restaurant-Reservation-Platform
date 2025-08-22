import { useState } from "react";
import { assets, cities } from "../assets/assets";
import { useApp } from "../Context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

/**
 * Hero section component with search functionality
 */
const HeroSection = () => {
  // Context and state management
  const { token, BACKEND_URL, setSearchRestaurants, CURRENCY } = useApp();
  const [destination, setDestination] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [price, setPrice] = useState("");
  const navigate = useNavigate();

  /**
   * Converts price option to range object
   * @param {string} priceOption - Selected price option
   * @returns {Object} Price range with min, max and label
   */
  const getPriceRangeFromOption = (priceOption) => {
    const priceRangeMap = {
      1: { min: 0, max: 299, label: `Under ${CURRENCY}300` },
      2: { min: 300, max: 499, label: `${CURRENCY}300-${CURRENCY}500` },
      3: { min: 500, max: 799, label: `${CURRENCY}500-${CURRENCY}800` },
      4: { min: 800, max: Infinity, label: `${CURRENCY}800+` },
    };
    return priceRangeMap[priceOption] || null;
  };

  /**
   * Handles search form submission
   * @param {Event} e - Form submit event
   */
  const onSearch = async (e) => {
    e.preventDefault();

    // Validate city is selected from the list
    const isValidCity = cities.includes(destination);
    if (destination && !isValidCity) {
      toast.error("Please select a valid city from the list");
      return;
    }

    // Prepare search parameters
    const searchParams = new URLSearchParams();
    if (destination) searchParams.append("destination", destination);
    if (cuisine) searchParams.append("cuisineType", cuisine);
    if (price) searchParams.append("priceOption", price);

    // Navigate with query params
    navigate(`/restaurants?${searchParams.toString()}`);

    // Prepare search object for backend storage
    const searchObject = {
      city: destination || "",
      cuisine: cuisine || "",
      price: price || "",
    };

    // Call backend to store recent search
    try {
      await axios.post(
        `${BACKEND_URL}/auth/recent-search`,
        { recentSearchDining: searchObject },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("Error saving recent search:", error);
    }

    // Save in context (limit to last 3)
    setSearchRestaurants((prev) => {
      const filtered = prev.filter(
        (search) =>
          !(
            search.city === searchObject.city &&
            search.cuisine === searchObject.cuisine &&
            search.price === searchObject.price
          )
      );
      return [...filtered, searchObject].slice(-3);
    });
  };

  return (
    <div className="flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-[url('/src/assets/heroImage.jpg')] bg-no-repeat bg-cover bg-center h-screen">
      {/* Hero tagline */}
      <p className="bg-[#FFA07A]/50 px-3.5 py-1 rounded-full inline-block mt-20">
        The Ultimate Dining Experience
      </p>

      {/* Main heading */}
      <h1 className="font-playfair text-2xl md:text-5xl md:text-[56px] md:leading-[56px] font-bold md:font-extrabold max-w-xl mt-4">
        Discover Your Perfect Dining Destination
      </h1>

      {/* Subheading */}
      <p className="max-w-lg mt-2 text-sm md:text-base">
        Unparalleled ambiance, taste, and service await you. Reserve now and
        elevate every meal.
      </p>

      {/* Search form */}
      <form
        onSubmit={onSearch}
        className="mt-6 bg-white text-gray-500 rounded-md px-3 py-3 flex flex-col md:flex-row gap-3 w-full max-w-4xl shadow-md text-sm"
      >
        {/* Location input */}
        <div className="flex-1 min-w-[120px]">
          <div className="flex items-center gap-1">
            <img
              src={assets.locationFind}
              alt="LocationFind"
              className="h-3.5"
            />
            <label htmlFor="locationInput">Location</label>
          </div>
          <input
            id="locationInput"
            onChange={(e) => setDestination(e.target.value)}
            value={destination}
            list="location"
            type="text"
            className="w-full rounded border border-gray-200 px-2.5 py-1.5 mt-1 text-sm outline-none"
            placeholder="e.g., Chennai"
            required
          />
          <datalist id="location">
            {cities.map((city, index) => (
              <option key={index} value={city} />
            ))}
          </datalist>
        </div>

        {/* Cuisine selection */}
        <div className="flex-1 min-w-[120px]">
          <div className="flex items-center gap-1">
            <img
              src={assets.cuisineIcon}
              alt="Cuisine Icon"
              className="h-3.5"
            />
            <label htmlFor="cuisine">Cuisine</label>
          </div>
          <select
            id="cuisine"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="w-full rounded border border-gray-200 px-2.5 py-1.5 mt-1 text-sm outline-none"
          >
            <option value="">All Cuisines</option>
            <option value="Indian">Indian</option>
            <option value="Italian">Italian</option>
            <option value="Chinese">Chinese</option>
            <option value="Mexican">Mexican</option>
            <option value="Continental">Continental</option>
            <option value="Mediterranean">Mediterranean</option>
            <option value="Thai">Thai</option>
            <option value="Japanese">Japanese</option>
          </select>
        </div>

        {/* Price selection */}
        <div className="flex-1 min-w-[100px]">
          <div className="flex items-center gap-1">
            {CURRENCY}
            <label htmlFor="price">Price</label>
          </div>
          <select
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded border border-gray-200 px-2.5 py-1.5 mt-1 text-sm outline-none"
          >
            <option value="">Any Price</option>
            <option value="1">Under {CURRENCY}300</option>
            <option value="2">
              {CURRENCY}300 - {CURRENCY}500
            </option>
            <option value="3">
              {CURRENCY}500 - {CURRENCY}800
            </option>
            <option value="4">Above {CURRENCY}800</option>
          </select>
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="flex items-center justify-center gap-1 rounded bg-black px-4 py-2 text-white text-sm my-auto max-md:w-full"
        >
          <img src={assets.searchIcon} alt="searchIcon" className="h-3.5" />
          <span>Search</span>
        </button>
      </form>
    </div>
  );
};

export default HeroSection;
