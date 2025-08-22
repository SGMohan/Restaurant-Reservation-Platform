import { useState, useEffect } from "react";
import { FiUsers } from "react-icons/fi";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { useApp } from "../../Context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import Star from "../../Components/Star";

/**
 * Manage Component - Allows restaurant owners to manage their dining areas and reviews
 */
const Manage = () => {
  const [activeTab, setActiveTab] = useState("dinings");
  const [diningList, setDiningList] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { BACKEND_URL, isOwner, token, loadingUser, CURRENCY } = useApp();

  // Fetch dinings of restaurant Owner
  const fetchDinings = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`${BACKEND_URL}/dinings/owner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setDiningList(data.dinings);
      } else {
        toast.error(data.message);
        setDiningList([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setDiningList([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews for the owner's restaurant
  const fetchReviews = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.get(`${BACKEND_URL}/reviews/owner`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setReviews(data.reviews);
      } else {
        toast.error(data.message);
        setReviews([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Toggle availability of dining
  const toggleDiningAvailability = async (diningId) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${BACKEND_URL}/dinings/${diningId}/toggle-availability`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchDinings();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle review approval status (using isApproved field)
  const toggleReviewApproval = async (reviewId) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${BACKEND_URL}/reviews/${reviewId}/toggle-approval`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data based on active tab
  useEffect(() => {
    if (loadingUser) return;

    if (isOwner && token) {
      if (activeTab === "dinings") {
        fetchDinings();
      } else if (activeTab === "reviews") {
        fetchReviews();
      }
    } else {
      setDiningList([]);
      setReviews([]);
    }
  }, [isOwner, token, activeTab, loadingUser]);

  return (
    <div className="px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl text-gray-900 mb-2">
          Manage Restaurant
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm max-w-3xl">
          Keep track of your restaurant and review listings and their
          availability. Approve or reject reviews to maintain quality standards.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4">
          <button
            onClick={() => setActiveTab("dinings")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "dinings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Dining Areas
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "reviews"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            User Reviews
          </button>
        </nav>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
        </div>
      )}

      {/* Content based on active tab */}
      {!loading &&
        (activeTab === "dinings" ? (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  All Dinings
                </h2>
              </div>
            </div>

            {/* Dining Areas Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm my-6">
              <div className="overflow-x-auto">
                <div className="max-h-[70vh] overflow-y-auto">
                  {diningList.length > 0 ? (
                    <table className="w-full hover:cursor-pointer">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                            Dining Type
                          </th>
                          <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                            Cuisine
                          </th>
                          <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                            Capacity
                          </th>
                          <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                            Price Range
                          </th>
                          <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {diningList.map((dine) => (
                          <tr
                            key={dine._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 my-2">
                                    {dine.diningType}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {dine.features?.join(", ") || "No features"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-gray-900 my-2">
                                {dine.cuisineType}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {dine.dietaryOptions?.join(", ") ||
                                  "No dietary options"}
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center text-sm text-gray-900">
                                <FiUsers className="mr-1" />
                                {dine.guestCapacity}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center text-sm text-gray-900">
                                <FaIndianRupeeSign className="mr-1" />
                                {dine.priceRange}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div
                                onClick={() =>
                                  toggleDiningAvailability(dine._id)
                                }
                                className={`relative inline-flex items-center w-9 h-5 rounded-full cursor-pointer transition-colors duration-300 ${
                                  dine.isAvailable
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                }`}
                                title={`Click to ${
                                  dine.isAvailable ? "disable" : "enable"
                                }`}
                              >
                                <div
                                  className={`absolute top-0.5 left-[2px] bg-white border border-gray-300 rounded-full h-4 w-4 shadow-md transition-transform duration-300 transform ${
                                    dine.isAvailable
                                      ? "translate-x-4"
                                      : "translate-x-0"
                                  }`}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      No dining areas found
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  All Reviews
                </h2>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm my-6">
                <div className="overflow-x-auto">
                  <div className="max-h-[70vh] overflow-y-auto">
                    {reviews.length > 0 ? (
                      <table className="w-full hover:cursor-pointer">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                              User
                            </th>
                            <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                              Dining
                            </th>
                            <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                              Rating
                            </th>
                            <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                              Comment
                            </th>
                            <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                              Response
                            </th>
                            <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                              Date
                            </th>
                            <th className="py-3 px-4 text-left text-xs sm:text-sm font-semibold uppercase text-gray-500">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {reviews.map((review) => (
                            <tr
                              key={review._id}
                              className="hover:bg-gray-50 transition-colors duration-150"
                            >
                              <td className="py-3 px-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {review.user?.name || "Anonymous"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {review.user?.email || "N/A"}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm text-gray-900">
                                  {review.dining?.diningType || "N/A"}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Star
                                  rating={review.rating}
                                  starSize="w-4 h-4"
                                />
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm text-gray-500 max-w-xs ">
                                  <div title={review.comment}>
                                    {review.comment || "N/A"}
                                  </div>
                                  {review.dishesTried &&
                                    review.dishesTried.length > 0 && (
                                      <div className="text-xs text-gray-400 mt-1">
                                        Dishes: {review.dishesTried.join(", ")}
                                      </div>
                                    )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm text-gray-500 max-w-xs ">
                                  <div title={review.ownerReply}>
                                    {review.ownerReply || "N/A"}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500 whitespace-nowrap">
                                {new Date(review.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  }
                                )}
                              </td>
                              <td className="py-3 px-4">
                                {/* Toggle switch for approval (similar to dining availability) */}
                                <div
                                  onClick={() =>
                                    toggleReviewApproval(review._id)
                                  }
                                  className={`relative inline-flex items-center w-9 h-5 rounded-full cursor-pointer transition-colors duration-300 ${
                                    review.isApproved
                                      ? "bg-green-500"
                                      : "bg-gray-300"
                                  }`}
                                  title={`Click to ${
                                    review.isApproved ? "reject" : "approve"
                                  }`}
                                >
                                  <div
                                    className={`absolute top-0.5 left-[2px] bg-white border border-gray-300 rounded-full h-4 w-4 shadow-md transition-transform duration-300 transform ${
                                      review.isApproved
                                        ? "translate-x-4"
                                        : "translate-x-0"
                                    }`}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <div className="text-lg mb-2">No reviews found</div>
                        <div className="text-sm">
                          Reviews for your dining areas will appear here
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ))}
    </div>
  );
};

export default Manage;
