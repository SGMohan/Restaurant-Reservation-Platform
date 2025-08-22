const ReviewRouter = require("express").Router();
const ReviewModel = require("../model/review.model");
const RestaurantModel = require("../model/restaurant.model");
const DiningModel = require("../model/dining.model");
const ReservationModel = require("../model/reservation.model");
const cloudinary = require("cloudinary").v2;
const upload = require("../middleware/upload.middleware");
const { verifyToken, verifyRole } = require("../middleware/auth.middleware");
const UserModel = require("../model/user.model");

// Helper function: Upload multiple images to Cloudinary
const uploadImages = async (files) => {
  const uploads = files.map(async (file) => {
    const response = await cloudinary.uploader.upload(file.path, {
      folder: "reviews",
      format: "png",
      transformation: [{ format: "png" }],
    });
    return response.secure_url;
  });
  return Promise.all(uploads);
};

// Create a review (User only - requires completed reservation)
ReviewRouter.post(
  "/create",
  verifyToken,
  verifyRole("user"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { dining, comment, dishesTried, rating } = req.body;

      // Basic validation
      if (!dining || !comment || !rating) {
        return res.status(400).json({
          success: false,
          message: "Dining, comment, and rating are required fields",
        });
      }

      // Check if user has any completed reservations for this dining
      const hasReservation = await ReservationModel.findOne({
        user: req.user._id,
        dining: dining,
        status: "Completed",
      });

      if (!hasReservation) {
        return res.status(403).json({
          success: false,
          message:
            "You can only review dining areas you've actually visited (must have a completed reservation)",
        });
      }

      // Check if user already reviewed this dining
      const existingReview = await ReviewModel.findOne({
        dining: dining,
        user: req.user._id,
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: "You have already reviewed this dining area",
        });
      }

      // Check if dining exists
      const diningExists = await DiningModel.findById(dining);
      if (!diningExists) {
        return res.status(404).json({
          success: false,
          message: "Dining area not found",
        });
      }

      // Upload images if any
      const imageUrls =
        req.files?.length > 0 ? await uploadImages(req.files) : [];

      // Create new review document
      const newReview = await ReviewModel.create({
        user: req.user._id,
        dining,
        comment,
        dishesTried: Array.isArray(dishesTried)
          ? dishesTried
          : JSON.parse(dishesTried || "[]"),
        rating: parseInt(rating),
        images: imageUrls,
        isActive: true,
        isApproved: true,
        reservation: hasReservation._id, // Store the reservation ID
      });

      return res.status(201).json({
        message: "Review Submitted Successfully",
        success: true,
        review: {
          _id: newReview._id,
          user: { _id: req.user._id },
          dining: { _id: dining },
          comment,
          rating: newReview.rating,
        },
      });
    } catch (error) {
      console.error("Create review error:", error);
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  }
);

// Update a review (User can only update their own review - maximum once)
ReviewRouter.put(
  "/update/:reviewId",
  verifyToken,
  verifyRole("user"),
  upload.array("images", 5),
  async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { comment, dishesTried, rating } = req.body;

      // Basic validation
      if (!comment || !rating) {
        return res.status(400).json({
          success: false,
          message: "Comment and rating are required fields",
        });
      }

      // Find the existing review
      const existingReview = await ReviewModel.findById(reviewId);
      if (!existingReview) {
        return res.status(404).json({
          success: false,
          message: "Review not found",
        });
      }

      // Verify ownership
      if (existingReview.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only edit your own reviews",
        });
      }

      // Check edit allowance (max 1 edit)
      if (existingReview.editCount >= 1) {
        return res.status(403).json({
          success: false,
          message: "You can only edit your review once",
        });
      }

      // Handle image updates
      let imageUrls = existingReview.images;
      if (req.files && req.files.length > 0) {
        // Upload new images
        const newImages = await uploadImages(req.files);
        imageUrls = [...existingReview.images, ...newImages].slice(0, 5); // Keep max 5 images
      }

      // Parse dishes tried if provided
      const parsedDishesTried = dishesTried
        ? Array.isArray(dishesTried)
          ? dishesTried
          : JSON.parse(dishesTried || "[]")
        : existingReview.dishesTried;

      // Update the review document
      const updatedReview = await ReviewModel.findByIdAndUpdate(
        reviewId,
        {
          comment,
          dishesTried: parsedDishesTried,
          rating: parseInt(rating),
          images: imageUrls,
          editCount: existingReview.editCount + 1,
          lastEditedAt: new Date(),
          isEdited: true, // Flag to indicate this review was edited
        },
        { new: true }
      ).populate("user", "name email avatar");

      return res.status(200).json({
        success: true,
        message: "Review Updated",
        review: updatedReview,
      });
    } catch (error) {
      console.error("Update review error:", error);

      // Handle JSON parse errors specifically
      if (error instanceof SyntaxError && error.message.includes("JSON")) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid dishesTried format. Please provide valid JSON array.",
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update review",
      });
    }
  }
);

// Delete a review (User can only delete their own review)
ReviewRouter.delete(
  "/delete/:reviewId",
  verifyToken,
  verifyRole("user"),
  async (req, res) => {
    try {
      const { reviewId } = req.params;

      // Check if the review belongs to the current user
      const review = await ReviewModel.findById(reviewId);
      if (!review) {
        return res
          .status(404)
          .json({ message: "Review not found", success: false });
      }

      if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: "You can only delete your own reviews",
          success: false,
        });
      }

      // Delete the review
      await ReviewModel.findByIdAndDelete(reviewId);

      return res.status(200).json({
        message: "Review Deleted ",
        success: true,
        deletedReviewId: reviewId, // Return the deleted review ID
      });
    } catch (error) {
      console.error("Delete review error:", error);
      return res.status(500).json({ message: error.message, success: false });
    }
  }
);

// Reply to a review (Restaurant owner only)
ReviewRouter.post(
  "/reply/:reviewId",
  verifyToken,
  verifyRole("owner"),
  async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { reply } = req.body;

      if (!reply) {
        return res
          .status(400)
          .json({ message: "Reply text must be provided", success: false });
      }

      // Find the review and populate the necessary fields
      const review = await ReviewModel.findById(reviewId).populate({
        path: "dining",
        populate: {
          path: "restaurant",
          select: "_id owner name", // Include owner field
        },
      });

      if (!review) {
        return res
          .status(404)
          .json({ message: "Review not found", success: false });
      }

      // Check if the review belongs to a dining area
      if (!review.dining || !review.dining.restaurant) {
        return res.status(404).json({
          success: false,
          message: "Dining area or restaurant not found for this review",
        });
      }

      // STRICT VERIFICATION: Check if the restaurant owner matches the current user
      if (
        review.dining.restaurant.owner.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only reply to reviews of your own restaurant's dining areas",
        });
      }

      // Check if a reply already exists
      if (review.ownerReply) {
        return res.status(400).json({
          success: false,
          message: "You have already replied to this review",
        });
      }

      // Add owner reply to the review
      const updatedReview = await ReviewModel.findByIdAndUpdate(
        reviewId,
        {
          ownerReply: reply,
          replyDate: new Date(),
        },
        { new: true }
      ).populate("user", "name email avatar");

      return res.status(200).json({
        message: "Reply Added",
        success: true,
        review: updatedReview,
      });
    } catch (error) {
      console.error("Reply to review error:", error);
      return res.status(500).json({ message: error.message, success: false });
    }
  }
);

// Get reviews for owner's restaurant (Owner only)
ReviewRouter.get("/owner", verifyToken, async (req, res) => {
  try {
    // Find restaurant owned by the authenticated user
    const restaurantData = await RestaurantModel.findOne({
      owner: req.user._id,
    });

    if (!restaurantData) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Find all reviews for the owner's restaurant
    const reviews = await ReviewModel.find()
      .populate({
        path: "dining",
        match: { restaurant: restaurantData._id },
        populate: {
          path: "restaurant",
          select: "name owner",
        },
      })
      .populate("user", "name email ")
      .sort({ createdAt: -1 })
      .exec();

    // Filter out reviews that don't belong to the owner's restaurant
    const ownerReviews = reviews.filter((review) => review.dining);

    return res.status(200).json({
      message: "Data fetched successfully",
      success: true,
      reviews: ownerReviews,
    });
  } catch (error) {
    console.error("Get owner reviews error:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
});

// Toggle review approval status (Owner only)
ReviewRouter.post("/:id/toggle-approval", verifyToken, async (req, res) => {
  try {
    const reviewId = req.params.id;

    // Find restaurant owned by the authenticated user
    const restaurantData = await RestaurantModel.findOne({
      owner: req.user._id,
    });

    if (!restaurantData) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Find the review and verify it belongs to the owner's restaurant
    const review = await ReviewModel.findById(reviewId).populate({
      path: "dining",
      populate: {
        path: "restaurant",
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (
      !review.dining ||
      !review.dining.restaurant ||
      !review.dining.restaurant._id.equals(restaurantData._id)
    ) {
      return res.status(404).json({
        success: false,
        message: "Review not found or you don't have permission",
      });
    }

    // Toggle approval status
    review.isApproved = !review.isApproved;
    await review.save();

    return res.status(200).json({
      message: `Review ${review.isApproved ? "approved" : "disapproved"}`,
      success: true,
      review,
    });
  } catch (error) {
    console.error("Toggle approval error:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
});

// GET all reviews for a dining area (Public endpoint)
ReviewRouter.get("/dining/:id", async (req, res) => {
  try {
    const diningId = req.params.id;

    // Get dining info with restaurant owner details
    const diningInfo = await DiningModel.findById(diningId).populate({
      path: "restaurant",
      select: "name owner", // Include owner info
    });

    if (!diningInfo) {
      return res.status(404).json({
        success: false,
        message: "Dining area not found",
      });
    }

    // Find only approved and active reviews
    const reviews = await ReviewModel.find({
      dining: diningId,
      isActive: true,
      isApproved: true,
    })
      .populate("user", "name email")
      .populate({
        path: "dining",
        populate: {
          path: "restaurant",
          select: "name owner", // Include owner info
        },
      })
      .sort({ createdAt: -1 }); // Sort by newest first

    // Return empty array if no reviews found
    if (!reviews.length) {
      return res.status(200).json({
        reviews: [],
        diningInfo, // Include dining info with owner details
        statistics: {
          total: 0,
          average: 0,
          ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        },
      });
    }

    // Calculate review statistics
    const totalReviews = reviews.length;
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    reviews.forEach((review) => {
      sum += review.rating;
      ratingCounts[review.rating] += 1;
    });

    const average = sum / totalReviews;

    const statistics = {
      total: totalReviews,
      average: parseFloat(average.toFixed(1)),
      ratings: ratingCounts,
      // Add these for frontend compatibility
      totalReviews: totalReviews,
      averageRating: parseFloat(average.toFixed(1)),
      ratingDistribution: ratingCounts,
    };

    res.status(200).json({
      reviews,
      diningInfo, // Include dining info with restaurant owner
      statistics,
    });
  } catch (error) {
    console.error("Error fetching dining reviews:", error);
    res.status(500).json({
      message: "Error fetching dining reviews",
      error: error.message,
    });
  }
});


module.exports = ReviewRouter;
