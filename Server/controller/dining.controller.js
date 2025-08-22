const DiningRouter = require("express").Router();
const cloudinary = require("cloudinary").v2;
const { verifyToken } = require("../middleware/auth.middleware");
const RestaurantModel = require("../model/restaurant.model");
const upload = require("../middleware/upload.middleware");
const DiningModel = require("../model/dining.model");

// Create a new dining for the restaurant
DiningRouter.post(
  "/dinings",
  upload.array("images", 4),
  verifyToken,
  async (req, res) => {
    try {
      const { cuisineType, priceRange, features, dietaryOptions, ambiance, guestCapacity, diningType } =
        req.body;
      const restaurant = await RestaurantModel.findOne({ owner: req.user._id });
      if (!restaurant) {
        return res.status(400).json({
          message: "Restaurant not found",
          success: false,
        });
      }
      //upload images to cloudinary
      const uploadImages = req.files.map(async (file) => {
        const response = await cloudinary.uploader.upload(file.path, {
          folder: "dining_images",
          format: "png",
          transformation: [{ format: "png" }],
        });
        return response.secure_url;
      });
      //wait for all images upload
      const images = await Promise.all(uploadImages);

      const newDining = await DiningModel.create({
        restaurant: restaurant._id,
        cuisineType,
        priceRange,
        guestCapacity,
        diningType,
        features: JSON.parse(features),
        dietaryOptions: JSON.parse(dietaryOptions),
        ambiance: JSON.parse(ambiance),
        images,
      });
      return res.status(200).json({
        message: "Dining Created Successfully",
        success: true,
        data: newDining,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  }
);

// Get all dinings
DiningRouter.get("/", async (_, res) => {
  try {
    const dinings = await DiningModel.find({ isAvailable: true })
      .populate(
        {
          path: "restaurant", 
          populate: {
            path: "owner",
            select: "name email"
          }
      }
      )
      .sort({ createdAt: -1 });
    return res.status(200).json({
      message: "Dinings fetched successfully",
      success: true,
      dinings,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
});


// Get all dinings for a specific restaurant
DiningRouter.get("/owner", verifyToken, async (req, res) => {
  try {
    const restaurantData = await RestaurantModel.findOne({
      owner: req.user._id,
    });
    
    if (!restaurantData) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }
    
    const dinings = await DiningModel.find({ 
      restaurant: restaurantData._id 
    }).populate("restaurant");
    
    return res.status(200).json({
      message: "Data fetched successfully",
      success: true,
      dinings,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
});

// Toggle dining availability

DiningRouter.post("/:id/toggle-availability", verifyToken, async (req, res) => {
  try {
    const diningId = req.params.id; // Get from URL parameter, not body
    
    // Verify the dining belongs to the user's restaurant
    const dining = await DiningModel.findById(diningId).populate({
      path: "restaurant",
      match: { owner: req.user._id }
    });
    
    if (!dining || !dining.restaurant) {
      return res.status(404).json({
        success: false,
        message: "Dining not found or you don't have permission"
      });
    }
    
    dining.isAvailable = !dining.isAvailable;
    await dining.save();
    
    return res.status(200).json({
      message: `Dining ${
        dining.isAvailable ? "is" : "is not"
      } Available`,
      success: true,
      dining,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
});

module.exports = DiningRouter;