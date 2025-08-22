import axios from "axios";
import { useState } from "react";
import { assets, cities } from "../assets/assets";
import { useApp } from "../Context/AppContext";
import toast from "react-hot-toast";

/**
 * Component for restaurant owners to register their restaurant
 */
const RestaurantRegister = () => {
  // Get data and functions from app context
  const { setShowRegister, token, setIsOwner, BACKEND_URL } = useApp();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [city, setCity] = useState("");

  /**
   * Handles form submission for restaurant registration
   */
  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      setLoading(true);

      const { data } = await axios.post(
        `${BACKEND_URL}/restaurants/register`,
        {
          name,
          contact,
          address,
          city,
          openingHours,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setIsOwner(true);
        setShowRegister(false);
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
    <div className="fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center justify-center bg-black/70 p-4">
      <form
        onSubmit={onSubmitHandler}
        onChange={(e) => e.stopPropagation()}
        className="flex flex-col md:flex-row bg-white rounded-xl max-w-4xl w-full overflow-hidden"
      >
        {/* Image Section - Hidden on mobile, visible on md screens and up */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src={assets.regImage}
            alt="reg-image"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Form Content Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 relative">
          {/* Close Button */}
          <div className="absolute top-4 right-4">
            <img
              src={assets.closeIcon}
              alt="closeIcon"
              className="h-4 w-4 hover:cursor-pointer"
              onClick={() => setShowRegister((prev) => !prev)}
            />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-medium text-center mt-4 mb-2">
            List Your Restaurant
          </h2>
          <p className="text-sm text-center text-gray-500 mb-6">
            Note: Fill out the form only if you want to register your
            restaurant.
          </p>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Restaurant Name */}
            <div className="w-full">
              <label
                htmlFor="name"
                className="block font-medium text-gray-500 mb-1"
              >
                Restaurant Name
              </label>
              <input
                type="text"
                id="name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Type Here"
                className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="w-full">
              <label
                htmlFor="phone"
                className="block font-medium text-gray-500 mb-1"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                onChange={(e) => setContact(e.target.value)}
                value={contact}
                placeholder="+1234567890"
                className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
                required
              />
            </div>

            {/* Working Hours */}
            <div className="w-full">
              <label
                htmlFor="openingHours"
                className="block font-medium text-gray-500 mb-1"
              >
                Working Hours
              </label>
              <input
                type="text"
                id="openingHours"
                onChange={(e) => setOpeningHours(e.target.value)}
                value={openingHours}
                placeholder="12:00 AM - 10:00 PM"
                className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
                required
              />
            </div>

            {/* Address */}
            <div className="w-full">
              <label
                htmlFor="address"
                className="block font-medium text-gray-500 mb-1"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                onChange={(e) => setAddress(e.target.value)}
                value={address}
                placeholder="Enter your Restaurant Address"
                className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
                required
              />
            </div>

            {/* City */}
            <div className="w-full">
              <label
                htmlFor="city"
                className="block font-medium text-gray-500 mb-1"
              >
                City
              </label>
              <select
                id="city"
                onChange={(e) => setCity(e.target.value)}
                value={city}
                className="border border-gray-200 rounded w-full px-3 py-2.5 mt-1 outline-indigo-500 font-light"
              >
                <option value="">Select City</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors mt-4 hover:cursor-pointer"
            >
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RestaurantRegister;
