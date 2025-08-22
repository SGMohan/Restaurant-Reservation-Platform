import { useParams } from "react-router-dom";
import Star from "../Components/Star";
import {
  FaEdit,
  FaTrash,
  FaReply,
  FaTimes,
  FaThumbsUp,
  FaCamera,
  FaChartBar,
  FaUsers,
  FaStar,
  FaUtensils,
} from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from "axios";
import { useApp } from "../Context/AppContext";
import toast from "react-hot-toast";

const AllReviews = () => {
  // Get dining ID from URL parameters
  const { id } = useParams();

  // Get app context values
  const { BACKEND_URL, token, user, isOwner, loadingUser } = useApp();

  // Data states
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [diningInfo, setDiningInfo] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    comment: "",
    rating: 0,
    dishesTried: "",
    images: [],
  });
  const [ratingHover, setRatingHover] = useState(0);

  // Edit/Reply states
  const [editingReview, setEditingReview] = useState(null);
  const [replyingToReviewId, setReplyingToReviewId] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Delete confirmation
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  // Check if user has already reviewed
  const userHasReviewed =
    user && reviews.some((review) => review.user?._id === user._id);
  const userReview = reviews.find((review) => review.user?._id === user?._id);

  // Check if user can still edit (hasn't used their edit allowance)
  const canUserEdit = userReview && (userReview.editCount || 0) < 1;

  // Check if current user is the owner of this dining
  const isDiningOwner = () => {
    if (!user || !diningInfo || !diningInfo.restaurant) return false;
    return diningInfo.restaurant.owner === user._id;
  };

  // Fetch reviews for this dining
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/reviews/dining/${id}`);
      setReviews(res.data.reviews || []);
      setStatistics(res.data.statistics || null);

      // Store dining info with owner details for verification
      if (res.data.diningInfo) {
        setDiningInfo(res.data.diningInfo);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
      setReviews([]);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews when component mounts or ID changes
  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id, BACKEND_URL]);

  // Handle form submission for new or edited reviews
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Please login to write a review");
      return;
    }

    if (!formData.comment.trim() || formData.rating === 0) {
      toast.error("Please provide a rating and review text");
      return;
    }

    try {
      const data = new FormData();
      data.append("comment", formData.comment);
      data.append("rating", formData.rating);

      // Only append dining for new reviews, not for edits
      if (!editingReview) {
        data.append("dining", id);
      }

      if (formData.dishesTried) {
        const dishesArray = formData.dishesTried
          .split(",")
          .map((dish) => dish.trim())
          .filter((dish) => dish);
        data.append("dishesTried", JSON.stringify(dishesArray));
      }

      formData.images.forEach((file) => {
        data.append("images", file);
      });

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      let response;
      if (editingReview) {
        // Make PUT request for editing
        response = await axios.put(
          `${BACKEND_URL}/reviews/update/${editingReview._id}`,
          data,
          config
        );
      } else {
        // Make POST request for new review
        response = await axios.post(
          `${BACKEND_URL}/reviews/create`,
          data,
          config
        );
      }

      if (response.data.success) {
        toast.success(editingReview ? "Review updated!" : "Review submitted!");
        fetchReviews();
        resetForm();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to submit review");
      }
    }
  };

  // Handle submitting a reply to a review
  const handleReplySubmit = async (e, reviewId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      // Check if review already has a reply (just in case)
      const review = reviews.find((r) => r._id === reviewId);
      if (review?.ownerReply) {
        toast.error("You can only reply once to a review");
        return;
      }

      const { data } = await axios.post(
        `${BACKEND_URL}/reviews/reply/${reviewId}`,
        { reply: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Reply added!");
        fetchReviews();
        setReplyingToReviewId(null);
        setReplyText("");
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error(error.response?.data?.message || "Failed to add reply");
    }
  };

  // Handle editing a review
  const handleEdit = (review) => {
    if (!review) return;

    // Check if user can still edit
    if ((review.editCount || 0) >= 1) {
      toast.error("You have already used your one-time edit allowance");
      return;
    }

    setEditingReview(review);
    setFormData({
      comment: review.comment,
      rating: review.rating,
      dishesTried: review.dishesTried?.join(", ") || "",
      images: [],
    });
    setShowCreateForm(false);
  };

  // Handle clicking delete button
  const handleDeleteClick = (reviewId) => {
    setReviewToDelete(reviewId);
    setShowDeleteConfirmation(true);
  };

  // Handle confirming review deletion
  const handleDeleteConfirm = async () => {
    if (!reviewToDelete) return;

    try {
      const { data } = await axios.delete(
        `${BACKEND_URL}/reviews/delete/${reviewToDelete}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        toast.success("Review deleted");
        // Update the state without refreshing
        setReviews(reviews.filter((review) => review._id !== reviewToDelete));

        // Update statistics if needed
        if (statistics) {
          const deletedReview = reviews.find((r) => r._id === reviewToDelete);
          if (deletedReview) {
            const newTotal = statistics.totalReviews - 1;
            const newRatingSum =
              statistics.averageRating * statistics.totalReviews -
              deletedReview.rating;
            const newAverage = newTotal > 0 ? newRatingSum / newTotal : 0;

            setStatistics({
              ...statistics,
              totalReviews: newTotal,
              averageRating: parseFloat(newAverage.toFixed(1)),
              ratingDistribution: {
                ...statistics.ratingDistribution,
                [deletedReview.rating]:
                  statistics.ratingDistribution[deletedReview.rating] - 1,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error(error.response?.data?.message || "Failed to delete review");
    } finally {
      setShowDeleteConfirmation(false);
      setReviewToDelete(null);
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.images.length + files.length > 5) {
      toast.error("Max 5 images allowed");
      return;
    }
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  // Remove an uploaded image
  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      comment: "",
      rating: 0,
      dishesTried: "",
      images: [],
    });
    setEditingReview(null);
    setShowCreateForm(false);
  };

  // Generate a hue value for avatar background based on user name
  const getHue = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash % 360;
  };

  // Check if current user can modify a review
  const canModifyReview = (review) => {
    if (loadingUser) return false;
    if (!token || !review.user?._id) return false;
    return review.user._id === user?._id;
  };

  // Toggle reply form visibility
  const toggleReplyForm = (reviewId) => {
    if (replyingToReviewId === reviewId) {
      setReplyingToReviewId(null);
    } else {
      setReplyingToReviewId(reviewId);
      setReplyText("");
    }
  };

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  // Rating labels for display
  const ratingLabels = {
    1: "Terrible",
    2: "Poor",
    3: "Average",
    4: "Good",
    5: "Excellent",
  };

  // Reusable JSX for the review form to keep it DRY
  const reviewFormContent = (isEditing = false) => (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-2xl shadow-lg border mb-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          {isEditing ? "Edit Your Review" : "Write a Review"}
        </h2>
        {isEditing && (
          <button
            type="button"
            onClick={resetForm}
            className="text-gray-500 hover:text-gray-700 hover:cursor-pointer"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Interactive Star Rating */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-3">
          Your Rating *
        </label>
        <div
          className="flex items-center gap-3"
          onMouseLeave={() => setRatingHover(0)}
        >
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onMouseEnter={() => setRatingHover(num)}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, rating: num }))
                }
                className={`text-3xl transition-all duration-200 ease-in-out hover:scale-125 transform ${
                  num <= (ratingHover || formData.rating)
                    ? "text-yellow-400 drop-shadow-sm"
                    : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <div className="ml-2">
            <span className="text-lg font-semibold font-playfair text-orange-500">
              {ratingHover
                ? ratingLabels[ratingHover]
                : formData.rating
                ? ratingLabels[formData.rating]
                : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Review Text */}
      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-semibold text-gray-800 mb-2"
        >
          Your Review *
        </label>
        <textarea
          id="comment"
          className="w-full p-4 border-2 border-gray-200 rounded-xl shadow-sm resize-none text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          rows={6}
          placeholder="What did you like or dislike? Share your experience in detail..."
          value={formData.comment}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, comment: e.target.value }))
          }
          required
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            Share your honest thoughts and help others make informed decisions.
          </p>
          <span className="text-xs text-gray-400">
            {formData.comment.length}/500
          </span>
        </div>
      </div>

      {/* Dishes Tried */}
      <div>
        <label
          htmlFor="dishesTried"
          className="block text-sm font-semibold text-gray-800 mb-2"
        >
          Dishes You Tried{" "}
          <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <input
          id="dishesTried"
          type="text"
          className="w-full p-4 border-2 border-gray-200 rounded-xl shadow-sm text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
          placeholder="e.g., Margherita Pizza, Caesar Salad, Tiramisu"
          value={formData.dishesTried}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, dishesTried: e.target.value }))
          }
        />
        <p className="text-xs text-gray-500 mt-1">
          Help others by mentioning specific dishes. Separate with commas.
        </p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Add Photos <span className="text-gray-500 font-normal">(Max 5)</span>
        </label>
        {formData.images.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {formData.images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`Preview ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                  aria-label="Remove image"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        )}
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          multiple
          disabled={formData.images.length >= 5}
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center justify-center border-3 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 bg-gray-50"
        >
          <FaCamera className="w-10 h-10 mb-3 text-gray-400" />
          <p className="text-sm font-semibold text-gray-700 mb-1">
            {formData.images.length > 0
              ? `${formData.images.length}/5 images selected`
              : "Click to upload or drag & drop"}
          </p>
          <p className="text-xs text-gray-500">
            Showcase your dining experience with photos!
          </p>
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={resetForm}
          className="w-full py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!formData.comment || !formData.rating}
        >
          {isEditing ? "Update" : "Submit"}
        </button>
      </div>
    </form>
  );

  return (
    <div className="py-10 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-7xl mx-auto pt-28">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        {/* Left Section */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold font-playfair bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Customer Reviews
          </h1>

          {/* Quote */}
          <p className="text-lg font-playfair font-semibold text-gray-500 mt-1">
            "Reviews are the compass that guides both businesses and customers
            to better experiences."
          </p>
        </div>

        {/* Add Review Button (only show if user hasn't reviewed and not owner) */}
        {!userHasReviewed && !isOwner && !editingReview && (
          <span
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 font-medium text-blue-500 underline hover:cursor-pointer"
          >
            {showCreateForm ? "Cancel" : "Write a Review"}
          </span>
        )}
      </div>

      {/* Enhanced Statistics Section - Always show at top */}
      {statistics && statistics.totalReviews > 0 && (
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm mb-8">
          <h2 className="text-xl font-semibold font-playfair text-gray-800 mb-6 text-center">
            Review Summary
          </h2>

          <div className="flex flex-wrap gap-6 justify-center">
            {/* Overall Rating */}
            <div className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 min-w-[200px]">
              <div className="relative mb-3">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-2xl font-bold text-white">
                    {statistics.averageRating.toFixed(1)}
                  </span>
                </div>
                <FaStar className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Average Rating
              </h3>
              <div className="mb-1">
                <Star rating={statistics.averageRating} size="small" />
              </div>
              <p className="text-xs text-gray-500">100+ reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-grow min-w-[300px] p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                <FaChartBar className="mr-2 text-indigo-500" />
                Rating Distribution
              </h3>
              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = statistics.ratingDistribution[rating] || 0;
                  const percentage = (count / statistics.totalReviews) * 100;

                  return (
                    <div key={rating} className="flex items-center">
                      <span className="text-xs font-medium w-6 text-gray-600">
                        {rating}★
                      </span>
                      <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 w-10 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recommendation Rate */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-center">
              <FaThumbsUp className="text-green-500 mr-2" />
              <span className="text-sm font-medium text-green-700">
                {(
                  (((statistics.ratingDistribution[5] || 0) +
                    (statistics.ratingDistribution[4] || 0)) /
                    statistics.totalReviews) *
                  100
                ).toFixed(0)}
                % of customers recommend this place
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Show edit form when editing a review */}
      {editingReview && reviewFormContent(true)}

      {/* Show new review form when showCreateForm is true */}
      {showCreateForm && !editingReview && reviewFormContent(false)}

      {/* Reviews List - Changed from grid to flexbox */}
      <div className="flex flex-wrap gap-6">
        {reviews.length === 0 ? (
          <div className="w-full bg-white p-12 rounded-2xl shadow-sm text-center border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUsers className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-xl font-semibold">
              No reviews yet
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Be the first to share your dining experience!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="w-full bg-white p-5 rounded-2xl shadow-md transition-all duration-300"
            >
              {/* Header section */}
              <div className="select-none">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, hsl(${getHue(
                        review.user?.name || "A"
                      )}, 70%, 50%), hsl(${
                        getHue(review.user?.name || "A") + 40
                      }, 70%, 50%))`,
                    }}
                  >
                    {review.user?.name
                      ? review.user.name.charAt(0).toUpperCase()
                      : "A"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-gray-900 truncate text-sm">
                        {review.user?.name || "Anonymous User"}
                      </p>
                      {/* Action buttons */}
                      <div
                        className="flex gap-1 min-h-[20px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!loadingUser && (
                          <>
                            {canModifyReview(review) && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEdit(review);
                                  }}
                                  className={`text-gray-500 hover:text-blue-500 p-1 hover:cursor-pointer rounded transition ${
                                    (review.editCount || 0) >= 1
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }`}
                                  title={
                                    (review.editCount || 0) >= 1
                                      ? "You can only edit your review once"
                                      : "Edit review"
                                  }
                                  disabled={(review.editCount || 0) >= 1}
                                >
                                  <FaEdit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteClick(review._id);
                                  }}
                                  className="text-gray-500 hover:text-red-500 p-1 rounded transition hover:cursor-pointer"
                                  title="Delete review"
                                >
                                  <FaTrash className="w-3 h-3" />
                                </button>
                              </>
                            )}
                            {isDiningOwner() && !review.ownerReply && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleReplyForm(review._id);
                                }}
                                className="text-gray-500 hover:text-green-500 p-1 rounded transition hover:cursor-pointer"
                                title="Reply to review"
                              >
                                <FaReply className="w-3 h-3" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-x-2 gap-y-1 mt-1">
                      <Star rating={review.rating} size="small" />
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Review comment */}
                <div className="mb-3 ">
                  <p className="text-gray-700 text-sm leading-relaxed border-b border-gray-300 py-2 ">
                    {review.comment}
                  </p>
                </div>
              </div>

              {/* Dishes Tried */}
              {review.dishesTried?.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FaUtensils className="text-indigo-500 w-3 h-3" />
                    <p className="text-xs font-bold text-gray-800">
                      Dishes Tried:
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {review.dishesTried.map((dish, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-slate-50 text-indigo-800 text-xs font-medium rounded-md"
                      >
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {review.images?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-bold text-gray-800 mb-2">
                    Photos:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {review.images.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt="Review"
                        className="w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition shadow-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.open(photo, "_blank");
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Owner Reply */}
              {review.ownerReply && (
                <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-l-4 border-indigo-400">
                  <div className="flex items-center gap-2 mb-2">
                    <FaReply className="w-3 h-3 text-indigo-600" />
                    <p className="text-xs font-bold text-indigo-800">
                      Owner's Response
                    </p>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {review.ownerReply}
                  </p>
                </div>
              )}

              {/* Reply form */}
              {replyingToReviewId === review._id && (
                <div
                  className="p-3 bg-gray-50 rounded-lg mt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xs font-semibold mb-2">Your Reply</h3>
                  <form
                    onSubmit={(e) => handleReplySubmit(e, review._id)}
                    className="space-y-2"
                  >
                    <textarea
                      className="w-full p-2 border border-gray-200 rounded-lg resize-none text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your response..."
                      required
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setReplyingToReviewId(null);
                        }}
                        className="px-3 py-1 text-xs rounded-md text-gray-600 hover:bg-gray-100 font-medium hover:cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium hover:cursor-pointer"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Delete Review</h3>
            <p className="mb-6">
              Are you sure you want to permanently delete this review?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllReviews;
