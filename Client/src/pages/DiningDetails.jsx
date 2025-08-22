import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
  assets,
  diningCommonData,
  dummyReviews,
  featuresIcon,
} from "../assets/assets";
import Star from "../Components/Star";
import ReviewCarousel from "../Components/ReviewCarousel";
import { useApp } from "../Context/AppContext";
import toast from "react-hot-toast";

const DiningDetails = () => {
  const { _id } = useParams();
  const { state } = useLocation();
  const { dinings, token, BACKEND_URL, CURRENCY, user, isOwner, loadingUser } =
    useApp();
  const [restaurant, setRestaurant] = useState(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);
  const [mainImage, setMainImage] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [guests, setGuests] = useState(1);
  const [isAvailable, setIsAvailable] = useState(false);
  const [reviews, setReviews] = useState(dummyReviews);
  const [isModifying, setIsModifying] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [isRestaurantOwner, setIsRestaurantOwner] = useState(false);
  const [randomRating, setRandomRating] = useState(0);
  const [randomReviewCount, setRandomReviewCount] = useState(0);
  const navigate = useNavigate();

  // Function to generate random rating between 3.0 and 5.0 with 0.5 increments
  const generateRandomRating = () => {
    const baseRating = 3 + Math.random() * 2; // Random between 3.0 and 5.0
    return Math.round(baseRating * 2) / 2; // Round to nearest 0.5
  };

  // Function to generate random review count between 50 and 500
  const generateRandomReviewCount = () => {
    return Math.floor(Math.random() * 451) + 50; // Random between 50 and 500
  };

  useEffect(() => {
    if (state?.bookingId) {
      setIsModifying(true);
      setBookingId(state.bookingId);

      // Pre-fill existing booking details if modifying
      if (state.bookingDetails) {
        const bookingDateTime = new Date(
          state.bookingDetails.reservationDateTime
        );
        setSelectedDate(bookingDateTime.toISOString().split("T")[0]);

        // Format time to HH:MM format
        const hours = bookingDateTime.getHours().toString().padStart(2, "0");
        const minutes = bookingDateTime
          .getMinutes()
          .toString()
          .padStart(2, "0");
        setSelectedTime(`${hours}:${minutes}`);

        setGuests(state.bookingDetails.guests || 1);
      }
    }
  }, [state]);

  // Check if current user is the owner of this restaurant
  useEffect(() => {
    if (restaurant && user) {
      const restaurantOwnerId =
        restaurant.restaurant?.owner?._id || restaurant.restaurant?.owner;
      setIsRestaurantOwner(user._id === restaurantOwnerId);
    }
  }, [restaurant, user]);

  // Generate random rating and review count when restaurant is loaded
  useEffect(() => {
    if (restaurant) {
      setRandomRating(generateRandomRating());
      setRandomReviewCount(generateRandomReviewCount());
    }
  }, [restaurant]);

  // Check if a selected time is in the past
  const isTimeInPast = (date, time) => {
    if (!date || !time) return false;

    const selectedDateTime = new Date(`${date}T${time}:00`);
    const now = new Date();

    return selectedDateTime <= now;
  };

  // Fetch available time slots when date changes
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (!selectedDate || !_id) return;

      setLoadingTimes(true);
      try {
        const response = await axios.get(
          `${BACKEND_URL}/reservation/available-times/${_id}`,
          {
            params: {
              date: selectedDate,
              excludeReservationId: isModifying ? bookingId : undefined,
            },
          }
        );

        if (response.data.success) {
          // Filter out past times for the current date
          const now = new Date();
          const currentDate = now.toISOString().split("T")[0];
          const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

          let filteredTimeSlots = response.data.data;

          // If selected date is today, filter out past times
          if (selectedDate === currentDate) {
            filteredTimeSlots = response.data.data.filter((timeSlot) => {
              return timeSlot > currentTime;
            });
          }

          setAvailableTimeSlots(filteredTimeSlots);

          // If current selected time is no longer available, reset it
          if (selectedTime && !filteredTimeSlots.includes(selectedTime)) {
            setSelectedTime("");
          }
        }
      } catch (error) {
        console.error("Error fetching available times:", error);
        toast.error("Failed to load available times");
      } finally {
        setLoadingTimes(false);
      }
    };

    fetchAvailableTimes();
  }, [selectedDate, _id, isModifying, bookingId, BACKEND_URL]);

  // Check availability when time is selected
  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedDate || !selectedTime || !_id) {
        setIsAvailable(false);
        setAvailabilityMessage("");
        return;
      }

      // First check if the time is in the past
      if (isTimeInPast(selectedDate, selectedTime)) {
        setIsAvailable(false);
        setAvailabilityMessage("✗ This time is in the past");
        return;
      }

      setCheckingAvailability(true);
      try {
        const reservationDateTime = combineDateTime(selectedDate, selectedTime);

        const response = await axios.post(
          `${BACKEND_URL}/reservation/check-availability`,
          {
            reservationDateTime: reservationDateTime.toISOString(),
            dining: _id,
            excludeReservationId: isModifying ? bookingId : undefined,
          }
        );

        const available = response.data.success && response.data.data;
        setIsAvailable(available);
        setAvailabilityMessage(
          available
            ? "✓ This time is available"
            : "✗ This time slot is not available"
        );
      } catch (error) {
        console.error("Error checking availability:", error);
        setIsAvailable(false);
        setAvailabilityMessage("✗ Error checking availability");
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [selectedDate, selectedTime, _id, isModifying, bookingId, BACKEND_URL]);

  const combineDateTime = (date, time) => {
    if (!date || !time) return null;
    return new Date(`${date}T${time}:00`);
  };

  const handleReservationSubmit = async (e) => {
    e.preventDefault();

    // Prevent owners from booking at ANY restaurant
    if (isOwner) {
      toast.error(
        "Restaurant owners cannot make bookings at any restaurant"
      );
      return;
    }

    const reservationDateTime = combineDateTime(selectedDate, selectedTime);

    if (!reservationDateTime) {
      toast.error("Please select both date and time");
      return;
    }

    if (reservationDateTime <= new Date()) {
      toast.error("Please select a proper date and time");
      return;
    }

    if (!token) {
      toast.error("Please login to book a table");
      return;
    }

    if (!isAvailable) {
      toast.error("This time slot is not available");
      return;
    }

    try {
      if (isModifying) {
        // Update existing reservation
        const updateResponse = await axios.put(
          `${BACKEND_URL}/reservation/${bookingId}`,
          {
            reservationDateTime: reservationDateTime.toISOString(),
            guests: parseInt(guests),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (updateResponse.data.success) {
          toast.success("Reservation updated successfully!");
          setTimeout(() => {
            navigate("/my-bookings");
          }, 2000);
        }
      } else {
        // Create new reservation
        const reservationResponse = await axios.post(
          `${BACKEND_URL}/reservation/reserve`,
          {
            dining: _id,
            reservationDateTime: reservationDateTime.toISOString(),
            guests: parseInt(guests),
            userEmail: user?.email,
            userName: user?.name,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (reservationResponse.data.success) {
          toast.success(
            reservationResponse.data.message || "Booking Created Successfully!"
          );
          setTimeout(() => {
            navigate("/my-bookings");
            window.scrollTo(0, 0);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Reservation error:", error);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  // Find restaurant from dinings array or fetch individually if not found
  useEffect(() => {
    const findRestaurant = async () => {
      setLoadingRestaurant(true);

      // First try to find in the dinings array from context
      const foundDining = dinings.find((item) => item._id === _id);

      if (foundDining) {
        setRestaurant(foundDining);
        setMainImage(foundDining.images?.[0] || "");
        setLoadingRestaurant(false);
      } else if (dinings.length > 0) {
        // If dinings are loaded but this specific one isn't found
        setLoadingRestaurant(false);
      } else {
        // If dinings array is empty, try to fetch this specific dining
        try {
          const response = await axios.get(`${BACKEND_URL}/dinings/${_id}`);
          if (response.data.success) {
            setRestaurant(response.data.dining);
            setMainImage(response.data.dining.images?.[0] || "");
          }
        } catch (error) {
          console.error("Error fetching dining:", error);
        } finally {
          setLoadingRestaurant(false);
        }
      }
    };

    findRestaurant();
  }, [_id, dinings, BACKEND_URL]);

  // Show loading skeleton while data is being fetched
  if (loadingRestaurant || loadingUser || dinings.length === 0) {
    return (
      <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
        {/* Skeleton for restaurant details */}
        <div className="animate-pulse">
          {/* Title skeleton */}
          <div className="h-10 bg-gray-300 rounded w-3/4 mb-4"></div>

          {/* Rating skeleton */}
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-6"></div>

          {/* Address skeleton */}
          <div className="h-5 bg-gray-300 rounded w-1/2 mb-8"></div>

          {/* Images skeleton */}
          <div className="flex flex-col lg:flex-row gap-6 mb-10">
            <div className="lg:w-1/2 w-full aspect-[4/3] bg-gray-300 rounded-xl"></div>
            <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[4/3] bg-gray-300 rounded-2xl"
                ></div>
              ))}
            </div>
          </div>

          {/* Highlights skeleton */}
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-6"></div>
          <div className="flex flex-wrap gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-300 rounded-lg w-24"></div>
            ))}
          </div>

          {/* Reservation form skeleton */}
          <div className="h-48 bg-gray-200 rounded-xl mb-16"></div>

          {/* Specifications skeleton */}
          <div className="space-y-4 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-300 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show dining not found error only after loading is complete and no restaurant was found
  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-6">
            <svg
              className="w-24 h-24 mx-auto text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Dining Not Found
          </h2>

          <p className="text-gray-600 mb-6">
            We couldn't find the dining experience you're looking for. It might
            have been removed or the URL may be incorrect.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors hover:cursor-pointer"
            >
              Go Back
            </button>

            <button
              onClick={() => (window.location.href = "/restaurants")}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors hover:cursor-pointer"
            >
              Browse Restaurants
            </button>
          </div>
        </div>
      </div>
    );
  }

  const restaurantInfo = restaurant.restaurant || {};
  const owner = restaurant.owner || restaurantInfo?.owner || {};

  return (
    <div className="py-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Dining Details */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
        <h1 className="text-3xl md:text-4xl font-playfair">
          {restaurantInfo.name || "Restaurant Name"}{" "}
          <span className="font-inter text-sm">({restaurant.cuisineType})</span>
        </h1>
        <p className="text-xs font-inter py-1.5 px-3 text-white bg-orange-500 rounded-full">
          20% OFF
        </p>
      </div>

      {/* Dining Ratings */}
      <div className="flex items-center mt-2 gap-1">
        <Star rating={randomRating} />
        <p className="ml-2">{randomReviewCount}+ reviews</p>
      </div>

      {/* Dining Address */}
      <div className="flex items-center mt-2 gap-1 text-gray-500">
        <img src={assets.locationIcon} alt="locationIcon" />
        <p>
          {restaurantInfo.address || "Address not available"},{" "}
          {restaurantInfo.city || "City not available"}
        </p>
      </div>

      {/* Dining Images */}
      <div className="flex flex-col lg:flex-row mt-6 gap-6">
        {/* Main Image */}
        <div className="lg:w-1/2 w-full aspect-[4/3] overflow-hidden rounded-xl shadow-lg">
          <img
            src={mainImage}
            alt="Dining Area"
            className="w-full h-full object-cover cursor-pointer transition-transform duration-300"
          />
        </div>

        {/* Thumbnail Grid */}
        <div className="grid grid-cols-2 gap-4 lg:w-1/2 w-full">
          {restaurant.images?.map((image, index) => (
            <div
              key={index}
              className="aspect-[4/3] overflow-hidden rounded-2xl shadow-md cursor-pointer"
              onClick={() => setMainImage(image)}
            >
              <img
                src={image || "/api/placeholder/300/200"}
                loading="lazy"
                alt="Dining Images"
                className={`w-full h-full object-cover transition-transform duration-300 border-2 rounded-2xl ${
                  mainImage === image
                    ? "border-orange-500"
                    : "border-transparent"
                }`}
              />
            </div>
          )) || (
            <div className="col-span-2 text-center text-gray-500 py-8">
              No additional images available
            </div>
          )}
        </div>
      </div>

      {/* Dining Highlights */}
      <div className="flex flex-col md:flex-row md:justify-between mt-10">
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-playfair">
            A Table Awaits Just for You..!
          </h1>
          <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
            {restaurant.features?.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100"
              >
                <img
                  src={featuresIcon[feature] || assets.defaultFeatureIcon}
                  alt={feature}
                  loading="lazy"
                  className="w-5 h-5"
                />
                <p className="text-xs">{feature}</p>
              </div>
            )) || <p className="text-gray-500">No features listed</p>}
          </div>

          {/* Restaurant details in one line */}
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="font-medium">Dining Type:</span>
              <span>{restaurant.diningType || "Not specified"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Capacity:</span>
              <span>{restaurant.guestCapacity || "Not specified"} guests</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Hours:</span>
              <span>{restaurantInfo.openingHours || "Not specified"}</span>
            </div>
          </div>
        </div>

        {/* Dining Price */}
        <div className="flex items-center my-4 ">
          <p className="text-2xl font-medium">
            {CURRENCY} {restaurant.priceRange || "Not specified"}
          </p>
        </div>
      </div>

      {/* CheckIn Form - Only show if user is not the owner */}
      {!isOwner ? (
        <form
          onSubmit={handleReservationSubmit}
          className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 w-full max-w-6xl"
        >
          {/* Form Fields Container */}
          <div className="flex flex-col md:flex-row w-full md:w-auto flex-1 gap-4 sm:gap-6">
            {/* Reservation Date */}
            <div className="flex-1 min-w-[150px]">
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={assets.calenderIcon}
                  alt="calenderIcon"
                  loading="lazy"
                  className="w-4 h-4"
                />
                <label htmlFor="date" className="text-sm text-gray-600">
                  Date
                </label>
              </div>
              <input
                id="date"
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                onChange={(e) => setSelectedDate(e.target.value)}
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Time - IMPROVED DESIGN */}
            <div className="flex-1 min-w-[150px]">
              <div className="flex items-center gap-2 mb-1">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Z"
                  />
                </svg>
                <label htmlFor="time" className="text-sm text-gray-600">
                  Time
                </label>
              </div>
              <div className="relative">
                <select
                  id="time"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  required
                  onChange={(e) => setSelectedTime(e.target.value)}
                  value={selectedTime}
                  disabled={!selectedDate || loadingTimes}
                >
                  <option value="">Select time</option>
                  {availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((timeSlot) => (
                      <option key={timeSlot} value={timeSlot}>
                        {formatTimeForDisplay(timeSlot)}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      {loadingTimes ? "Loading times..." : "No available times"}
                    </option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Guests */}
            <div className="flex-1 min-w-[100px]">
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={assets.groupIcon}
                  alt="groupIcon"
                  className="w-6 h-6 opacity-60"
                />
                <label htmlFor="guests" className="text-sm text-gray-600">
                  Guests
                </label>
              </div>
              <input
                id="guests"
                type="number"
                min={1}
                max={restaurant.guestCapacity || 20}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit Button with Availability Status */}
          <div className="w-full md:w-auto mt-2 md:mt-0 flex flex-col items-center">
            {selectedTime && (
              <div
                className={`text-sm mb-2 ${
                  checkingAvailability
                    ? "text-gray-600"
                    : isAvailable
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {checkingAvailability
                  ? "Checking availability..."
                  : availabilityMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={
                !isAvailable ||
                !selectedDate ||
                !selectedTime ||
                checkingAvailability
              }
              className={`w-full md:w-auto rounded-lg px-6 py-3 text-sm sm:text-base transition-all shadow-md hover:shadow-lg ${
                isAvailable &&
                selectedDate &&
                selectedTime &&
                !checkingAvailability
                  ? "bg-blue-500 hover:bg-blue-600 active:scale-95 text-white hover:cursor-pointer"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
              }`}
            >
              {isModifying ? "Update" : "Book Now"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-yellow-100 border border-amber-200 p-6 rounded-xl mx-auto mt-16 w-full max-w-6xl">
          <h3 className="text-xl font-semibold text-yellow-900/90 mb-2">
            Note...!
          </h3>
          <p className="text-yellow-700">
            As a restaurant owner, you cannot make reservations at any
            restaurant.
          </p>
        </div>
      )}

      {/* Dining Specifications */}
      <div className="mt-25 space-y-4">
        {diningCommonData.map((spec, index) => (
          <div key={index} className="flex items-start gap-2">
            <img src={spec.icon} alt={`${spec.title}-icon`} className="w-5" />
            <div>
              <p className="text-base">{spec.title}</p>
              <p className="text-gray-500">{spec.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-3xl border-y border-gray-300 my-15 py-10 text-gray-500">
        <p>
          Guests will be seated based on availability and restaurant capacity of{" "}
          {restaurant.guestCapacity || "multiple"} guests. You'll enjoy a
          comfortable dining experience with {restaurant.cuisineType} cuisine.
          The price mentioned is per person — for larger groups, please select
          the number of guests at the time of reservation to view accurate
          pricing.
        </p>
      </div>

      {/* Review Session */}
      <div className="mt-20 border-b border-gray-300 overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
          <h1 className="text-2xl md:text-3xl font-bold font-playfair">
            Customer Reviews
          </h1>
        </div>

        <div className="flex items-center mt-4 gap-2">
          <Star rating={randomRating} />
          <p className="ml-2 text-gray-600">{randomReviewCount}+ reviews</p>
        </div>

        {/* Review Carousel */}
        <div className="mt-8">
          <ReviewCarousel reviews={reviews} />
        </div>

        <div className="flex items-center justify-center my-10">
          <Link
            to={`/reviews/dinings/${_id}`}
            onClick={() => window.scrollTo(0, 0)}
            className="hover:text-gray-700 text-gray-600 underline hover:cursor-pointer transition-colors"
          >
            See more reviews
          </Link>
        </div>
      </div>

      {/* Hosted by */}
      <div className="flex flex-col items-start gap-4 mt-24">
        <div className="flex gap-4 items-center">
          {owner && (owner.name || owner.firstName || owner.username) ? (
            <>
              <div className="flex items-center justify-center h-14 w-14 md:h-18 md:w-18 rounded-full bg-slate-100 text-black text-2xl font-medium font-playfair">
                {(owner.name || owner.firstName || owner.username || "?")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <p className="text-lg">
                  Hosted by {"  "}{" "}
                  <span className="text-3xl font-playfair font-bold">
                    {owner.name || owner.firstName || owner.username}
                  </span>{" "}
                  <sup className="text-sm ">(Founder)</sup>
                </p>
                <div className="flex items-center mt-1">
                  <Star rating={randomRating} />
                  <p className="ml-2">{randomReviewCount}+ reviews</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center h-14 w-14 md:h-18 md:w-18 rounded-full bg-slate-100 text-black text-2xl font-medium font-playfair">
                {(restaurantInfo.name || "Restaurant").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg">
                  Hosted by{" "}
                  <span className="text-3xl font-playfair font-bold">
                    {restaurantInfo.name || "Restaurant Owner"}
                  </span>
                </p>
                <div className="flex items-center mt-1">
                  <Star rating={randomRating} />
                  <p className="ml-2">{randomReviewCount}+ reviews</p>
                </div>
              </div>
            </>
          )}
        </div>

        <button className="px-6 py-2.5 mt-4 rounded text-white bg-blue-500 hover:bg-blue-600 transition-all hover:cursor-pointer">
          Contact Now
        </button>
      </div>
    </div>
  );
};

const formatTimeForDisplay = (timeString) => {
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${period}`;
};

export default DiningDetails;
