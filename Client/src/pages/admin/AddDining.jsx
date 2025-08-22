import { useState } from "react";
import { assets } from "../../assets/assets";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { useApp } from "../../Context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";

const AddDining = () => {
  // Context and state initialization
  const { token, BACKEND_URL } = useApp();

  // State for image uploads
  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  const [loading, setLoading] = useState(false);

  // State for form inputs with nested objects for categories
  const [inputs, setInputs] = useState({
    cuisineType: "",
    priceRange: "",
    guestCapacity: "",
    diningType: "",
    ambiance: {
      Romantic: false,
      Casual: false,
      "Family-Friendly": false,
      Upscale: false,
      Business: false,
    },
    dietaryOptions: {
      Vegetarian: false,
      Vegan: false,
      "Gluten-Free": false,
      Halal: false,
      Kosher: false,
      Jain: false,
    },
    features: {
      "Live Music": false,
      "Outdoor Seating": false,
      "Fine Dining": false,
      "Private Parties": false,
      "Live Cooking": false,
      "Family Friendly": false,
      "Bar Service": false,
      "Birthday Celebrations": false,
      "Sunset Views": false,
      "Lounge Seating": false,
    },
  });

  /**
   * Handles changes to text/select inputs
   * @param {Object} e - The event object
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  /**
   * Handles checkbox toggles for category options
   * @param {String} category - The category name (ambiance, dietaryOptions, features)
   * @param {String} option - The specific option being toggled
   */
  const handleCheckboxChange = (category, option) => {
    setInputs({
      ...inputs,
      [category]: {
        ...inputs[category],
        [option]: !inputs[category][option],
      },
    });
  };

  /**
   * Handles form submission
   * @param {Object} e - The event object
   */
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Form validation
    if (
      !inputs.cuisineType ||
      !inputs.priceRange ||
      !inputs.ambiance ||
      !inputs.dietaryOptions ||
      !inputs.features ||
      !Object.values(images).some((image) => image)
    ) {
      toast.error("Please fill in all the details");
      return;
    }

    setLoading(true);

    try {
      // Prepare form data for submission
      const formData = new FormData();
      formData.append("cuisineType", inputs.cuisineType);
      formData.append("diningType", inputs.diningType);
      formData.append("guestCapacity", inputs.guestCapacity);
      formData.append("priceRange", inputs.priceRange);

      // Convert checkbox categories to arrays of selected options
      const ambiance = Object.keys(inputs.ambiance).filter(
        (key) => inputs.ambiance[key]
      );
      formData.append("ambiance", JSON.stringify(ambiance));

      const dietaryOptions = Object.keys(inputs.dietaryOptions).filter(
        (key) => inputs.dietaryOptions[key]
      );
      formData.append("dietaryOptions", JSON.stringify(dietaryOptions));

      const features = Object.keys(inputs.features).filter(
        (key) => inputs.features[key]
      );
      formData.append("features", JSON.stringify(features));

      // Add images to FormData
      Object.keys(images).forEach((key) => {
        images[key] && formData.append("images", images[key]);
      });

      // API call to add dining
      const { data } = await axios.post(
        `${BACKEND_URL}/dinings/dinings`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Handle response
      if (data.success) {
        toast.success(data.message);

        // Reset form after successful submission
        setInputs({
          cuisineType: "",
          priceRange: "",
          guestCapacity: "",
          diningType: "",
          ambiance: {
            Romantic: false,
            Casual: false,
            "Family-Friendly": false,
            Upscale: false,
            Business: false,
          },
          dietaryOptions: {
            Vegetarian: false,
            Vegan: false,
            "Gluten-Free": false,
            Halal: false,
            Kosher: false,
            Jain: false,
          },
          features: {
            "Live Music": false,
            "Outdoor Seating": false,
            "Fine Dining": false,
            "Private Parties": false,
            "Live Cooking": false,
            "Family Friendly": false,
            "Bar Service": false,
            "Birthday Celebrations": false,
            "Sunset Views": false,
            "Lounge Seating": false,
          },
        });

        setImages({
          1: null,
          2: null,
          3: null,
          4: null,
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="px-2 sm:px-4 py-4 max-w-7xl mx-auto w-full"
    >
      {/* Header Section */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">Add Dining</h1>
        <p className="text-gray-600 text-xs sm:text-sm max-w-3xl">
          Fill in the details carefully and accurate dining details, pricing,
          and features, to enhance the dining booking experience
        </p>
      </div>

      {/* Restaurant Details Section */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 border-b border-gray-300 pb-2">
          Restaurant Details
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
          {/* Cuisine Type Input */}
          <div>
            <label
              htmlFor="cuisineType"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Cuisine Type*
            </label>
            <select
              id="cuisineType"
              name="cuisineType"
              value={inputs.cuisineType}
              onChange={handleInputChange}
              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select Cuisine</option>
              <option value="Indian">Indian</option>
              <option value="Italian">Italian</option>
              <option value="Chinese">Chinese</option>
              <option value="Continental">Continental</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="Mexican">Mexican</option>
              <option value="Thai">Thai</option>
              <option value="Japanese">Japanese</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Price Range Input */}
          <div>
            <label
              htmlFor="priceRange"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Average Price Per Person (₹)*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaIndianRupeeSign className="text-gray-500 text-sm" />
              </div>
              <input
                type="number"
                id="priceRange"
                name="priceRange"
                value={inputs.priceRange}
                onChange={handleInputChange}
                min="0"
                className="w-full pl-8 px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                placeholder="Enter average price"
              />
            </div>
          </div>

          {/* Dining Type Input */}
          <div>
            <label
              htmlFor="diningType"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Dining Type*
            </label>
            <select
              id="diningType"
              name="diningType"
              value={inputs.diningType}
              onChange={handleInputChange}
              className="w-full px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            >
              <option value="">Select Type</option>
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Both Indoor & Outdoor">
                Both Indoor & Outdoor
              </option>
            </select>
          </div>

          {/* Guest Capacity Input */}
          <div>
            <label
              htmlFor="guestCapacity"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
            >
              Guest Capacity
            </label>
            <div className="relative">
              <input
                type="number"
                id="guestCapacity"
                name="guestCapacity"
                value={inputs.guestCapacity}
                onChange={handleInputChange}
                min="0"
                className="w-full  px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 border-b border-gray-300 pb-2">
          Images
        </h2>
        <p className="text-gray-600 text-xs sm:text-sm mb-2">
          Upload at least 4 high-quality images of your restaurant
        </p>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-4">
          {Object.keys(images).map((key) => (
            <label
              htmlFor={`images${key}`}
              key={key}
              className="cursor-pointer"
            >
              <div className="relative group">
                <img
                  src={
                    images[key]
                      ? URL.createObjectURL(images[key])
                      : assets.uploadArea
                  }
                  alt="upload-area"
                  className="w-full h-20 sm:h-24 object-cover rounded border border-dashed border-gray-300 group-hover:border-blue-500 transition-colors"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                id={`images${key}`}
                hidden
                onChange={(e) =>
                  setImages({ ...images, [key]: e.target.files[0] })
                }
              />
            </label>
          ))}
        </div>
      </div>

      {/* Dietary Options Section */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 border-b border-gray-300 pb-2">
          Dietary Options
        </h2>
        <p className="text-gray-600 text-xs sm:text-sm mb-2">
          Select the dietary options your restaurant accommodates
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
          {Object.keys(inputs.dietaryOptions).map((option) => (
            <div key={option} className="flex items-center">
              <input
                type="checkbox"
                id={`dietary-${option}`}
                checked={inputs.dietaryOptions[option]}
                onChange={() => handleCheckboxChange("dietaryOptions", option)}
                className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor={`dietary-${option}`}
                className="ml-2 text-xs sm:text-sm text-gray-700"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Ambiance Options Section */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 border-b border-gray-300 pb-2">
          Ambiance Options
        </h2>
        <p className="text-gray-600 text-xs sm:text-sm mb-2">
          Select the ambiance options your restaurant offers
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
          {Object.keys(inputs.ambiance).map((option) => (
            <div key={option} className="flex items-center">
              <input
                type="checkbox"
                id={`ambiance-${option}`}
                checked={inputs.ambiance[option]}
                onChange={() => handleCheckboxChange("ambiance", option)}
                className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor={`ambiance-${option}`}
                className="ml-2 text-xs sm:text-sm text-gray-700"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Special Features Section */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 border-b border-gray-300 pb-2">
          Special Features
        </h2>
        <p className="text-gray-600 text-xs sm:text-sm mb-2">
          Select that apply to your restaurant
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
          {Object.keys(inputs.features).map((feature) => (
            <div key={feature} className="flex items-center">
              <input
                type="checkbox"
                id={`feature-${feature}`}
                checked={inputs.features[feature]}
                onChange={() => handleCheckboxChange("features", feature)}
                className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor={`feature-${feature}`}
                className="ml-2 text-xs sm:text-sm text-gray-700"
              >
                {feature}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-start mt-8">
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
        >
          {loading ? "Adding..." : "Add Dining"}
        </button>
      </div>
    </form>
  );
};

export default AddDining;
