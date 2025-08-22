import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiCalendar,
  FiUsers,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiClock as FiPending,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { useApp } from "../Context/AppContext";
import toast from "react-hot-toast";

const MyBookings = () => {
  const { token, BACKEND_URL } = useApp();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const navigate = useNavigate();

  // Fetch bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/reservation/my-bookings`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setBookings(response.data.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBookings();
    } else {
      setLoading(false);
    }
  }, [token, BACKEND_URL]);

  // Handle payment success redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get("payment_success");
    const sessionId = urlParams.get("session_id");

    if (paymentSuccess === "true" && sessionId) {
      toast.success("Payment successful! Your booking is confirmed.");

      const fetchBookings = async () => {
        try {
          const response = await axios.get(
            `${BACKEND_URL}/reservation/my-bookings`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setBookings(response.data.data);
        } catch (error) {
          console.error("Error refreshing bookings:", error);
        }
      };

      fetchBookings();
      window.history.replaceState({}, document.title, "/my-bookings");
    }
  }, [token, BACKEND_URL]);

  const toggleDetails = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getDisplayStatus = (booking) => {
    return booking.status?.toLowerCase() || "pending";
  };

  const getDisplayPaymentMethod = (booking) => {
    return booking.paymentMethod || "pay at restaurant";
  };

  const getStatusIcon = (booking) => {
    const displayStatus = getDisplayStatus(booking);

    switch (displayStatus) {
      case "completed":
        return <FiCheckCircle className="text-green-500" />;
      case "confirmed":
        return <FiCheckCircle className="text-green-500" />;
      case "pending":
        return <FiPending className="text-yellow-500" />;
      case "cancelled":
        return <FiXCircle className="text-red-500" />;
      default:
        return <FiPending className="text-yellow-500" />;
    }
  };

  const canModifyBooking = (booking) => {
    const now = new Date();
    const bookingDateTime = new Date(booking.reservationDateTime);
    const displayStatus = getDisplayStatus(booking);

    if (booking.isPaid) {
      return false;
    }

    return displayStatus === "pending" && bookingDateTime > now;
  };

  const canCancelBooking = (booking) => {
    const now = new Date();
    const bookingDateTime = new Date(booking.reservationDateTime);
    const displayStatus = getDisplayStatus(booking);

    return (
      bookingDateTime > now &&
      displayStatus !== "cancelled" &&
      displayStatus !== "completed"
    );
  };

  const shouldShowPayButton = (booking) => {
    return booking.status?.toLowerCase() === "pending" && !booking.isPaid;
  };

  const handleModifyBooking = (booking) => {
    // Format the reservationDateTime to be compatible with datetime-local input
    const reservationDateTime = new Date(booking.reservationDateTime);
    const formattedDateTime = reservationDateTime.toISOString().slice(0, 16);

    navigate(`/dinings/${booking.dining?._id || booking.dining}`, {
      state: {
        bookingId: booking._id,
        bookingDetails: {
          ...booking,
          reservationDateTime: formattedDateTime,
          guests: booking.guests || 1,
        },
      },
    });
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/reservation/cancel/${bookingId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setBookings(
          bookings.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: "cancelled" }
              : booking
          )
        );
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handlePayment = async (bookingId) => {
    try {
      const loadingToast = toast.loading("Preparing payment...");

      const { data } = await axios.post(
        `${BACKEND_URL}/reservation/stripe-payment`,
        { bookingId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.dismiss(loadingToast);

      if (data.success && data.url) {
        toast.success("Redirecting to payment...");
        window.location.href = data.url;
      } else {
        toast.error(data.message || "Payment initialization failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || "Payment failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
        <div className="text-center max-w-md p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            To Access Your Bookings Details..!
          </h2>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Sign in to view and manage your upcoming bookings, and access your
            dining history all in one place.
            <p className="text-gray-800">Thank you...</p>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-32 px-4 md:px-8 lg:px-16 xl:px-24 pb-8 bg-white">
        <div className="w-full lg:w-3/4">
          <div className="flex flex-col items-start text-left">
            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900">
              My Bookings
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-3 max-w-2xl">
              Easily manage your past, current, and upcoming table bookings in
              one place. Plan your dining seamlessly with just a few clicks.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 pb-16">
        <div className="hidden md:grid grid-cols-12 gap-4 w-full border-b border-gray-200 font-medium text-gray-700 py-4 px-4">
          <div className="col-span-6">Dinings</div>
          <div className="col-span-4">Date & Time</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {bookings.length > 0 ? (
          bookings.map((booking) => {
            const diningArea = booking.dining || {};
            const restaurant =
              booking.restaurant || diningArea.restaurant || {};
            const displayStatus = getDisplayStatus(booking);

            return (
              <div
                key={booking._id}
                className="border-b border-gray-200 bg-white"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full py-6 px-4 hover:cursor-pointer transition-colors">
                  <div className="md:hidden flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-playfair text-lg font-semibold">
                          {diningArea.name || restaurant.name || "N/A"}
                        </h3>
                        <span className="font-inter text-xs text-gray-500">
                          ({diningArea.cuisineType || "N/A"})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking)}
                        <span className="capitalize text-sm">
                          {displayStatus}
                        </span>
                      </div>
                    </div>
                    <img
                      src={
                        diningArea.images?.[0] ||
                        restaurant.images?.[0] ||
                        "/placeholder-dining.jpg"
                      }
                      alt="dining area"
                      className="w-full h-40 rounded-lg object-cover shadow-sm"
                    />
                  </div>

                  <div className="hidden md:flex col-span-6 gap-4">
                    <img
                      src={
                        diningArea.images?.[0] ||
                        restaurant.images?.[0] ||
                        "/placeholder-dining.jpg"
                      }
                      alt="dining area"
                      className="w-32 h-24 rounded-lg object-cover shadow-sm"
                    />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline flex-wrap">
                        <h3 className="font-playfair text-lg font-semibold">
                          {diningArea.name || restaurant.name || "N/A"}
                        </h3>
                        <span className="font-inter text-xs text-gray-500 ml-2">
                          ({diningArea.cuisineType || "N/A"})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FiMapPin className="text-gray-400" />
                        <span className="truncate">
                          {restaurant.address || "N/A"}
                          {", "}
                          {restaurant.city || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FiUsers className="text-gray-400" />
                        <span>Guests: {booking.guests || "N/A"}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FaIndianRupeeSign className="text-gray-400" />
                        <span>Total: {booking.totalPrice || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:hidden flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FiCalendar className="text-gray-400" />
                      <span>{formatDate(booking.reservationDateTime)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      {shouldShowPayButton(booking) && (
                        <button
                          onClick={() => handlePayment(booking._id)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded hover:cursor-pointer"
                        >
                          Pay Now
                        </button>
                      )}
                      <button
                        onClick={() => toggleDetails(booking._id)}
                        className="flex items-center gap-1 text-xs border border-gray-300 hover:bg-gray-100 px-3 py-1 rounded hover:cursor-pointer"
                      >
                        Details{" "}
                        {expandedBooking === booking._id ? (
                          <FiChevronUp />
                        ) : (
                          <FiChevronDown />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="hidden md:flex col-span-4 flex-col justify-center">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FiCalendar className="text-gray-400" />
                      <span>{formatDate(booking.reservationDateTime)}</span>
                    </div>
                  </div>

                  <div className="hidden md:flex col-span-2 flex-col justify-center items-end gap-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(booking)}
                      <span className="capitalize text-sm">
                        {displayStatus}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {shouldShowPayButton(booking) && (
                        <button
                          onClick={() => handlePayment(booking._id)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded hover:cursor-pointer"
                        >
                          Pay Now
                        </button>
                      )}
                      <button
                        onClick={() => toggleDetails(booking._id)}
                        className="flex items-center gap-1 text-xs border border-gray-300 hover:bg-gray-100 px-3 py-1 rounded hover:cursor-pointer"
                      >
                        Details{" "}
                        {expandedBooking === booking._id ? (
                          <FiChevronUp />
                        ) : (
                          <FiChevronDown />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {expandedBooking === booking._id && (
                  <div className="px-4 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-3 md:space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2 text-sm md:text-base">
                            Booking Details
                          </h4>
                          <div className="space-y-2 text-xs md:text-sm text-gray-600">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Booking ID:</span>
                              <span className="truncate ml-2">
                                {booking._id}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Booked On:</span>
                              <span>{formatDate(booking.createdAt)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Payment Method:
                              </span>
                              <span className="capitalize">
                                {getDisplayPaymentMethod(booking)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">
                                Payment Status:
                              </span>
                              <span className="capitalize">
                                {booking.isPaid ? "Paid" : "Pending"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {booking.specialRequests && (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2 text-sm md:text-base">
                              Special Requests
                            </h4>
                            <p className="text-xs md:text-sm text-gray-600">
                              {booking.specialRequests}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 md:space-y-4">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2 text-sm md:text-base">
                            Dining Area Features
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {diningArea.features?.map((feature, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                              >
                                {feature}
                              </span>
                            )) || (
                              <span className="text-xs text-gray-500">
                                No features listed
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-700 mb-2 text-sm md:text-base">
                            Ambiance
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {diningArea.ambiance?.map((ambiance, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                              >
                                {ambiance}
                              </span>
                            )) || (
                              <span className="text-xs text-gray-500">
                                No ambiance details
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {canModifyBooking(booking) && (
                            <button
                              onClick={() => handleModifyBooking(booking)}
                              className="text-xs md:text-sm border border-gray-300 hover:bg-gray-100 px-3 py-1 md:px-4 md:py-2 rounded hover:cursor-pointer"
                            >
                              Modify Booking
                            </button>
                          )}
                          {canCancelBooking(booking) ? (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="text-xs md:text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 md:px-4 md:py-2 rounded hover:cursor-pointer"
                            >
                              Cancel Booking
                            </button>
                          ) : (
                            <button
                              disabled
                              className="text-xs md:text-sm bg-gray-100 text-gray-400 px-3 py-1 md:px-4 md:py-2 rounded cursor-not-allowed"
                              title={
                                displayStatus === "cancelled"
                                  ? "This booking is already cancelled"
                                  : displayStatus === "completed"
                                  ? "This booking is already completed"
                                  : new Date(booking.reservationDateTime) <
                                    new Date()
                                  ? "Booking time has passed"
                                  : "Cannot cancel this booking"
                              }
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 text-gray-500 bg-white rounded-lg shadow-sm">
            <p className="text-lg truncate">
              No bookings found & make your first booking{" "}
            </p>
            <button
              onClick={() => navigate("/restaurants")}
              className="mt-4 text-blue-500 underline hover:cursor-pointer text-sm md:text-base"
            >
              Book a Table
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
