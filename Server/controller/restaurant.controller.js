const RestaurantRouter = require("express").Router();
const RestaurantModel = require("../model/restaurant.model");
const UserModel = require("../model/user.model");
const { verifyToken } = require("../middleware/auth.middleware");

// Register a new restaurant (User to Owner conversion)
RestaurantRouter.post("/register", verifyToken, async (req, res) => {
  try {
    const { name, address, city, contact, openingHours } = req.body;
    const owner = req.user._id;

    // Check if user already has a registered restaurant
    const existingRestaurant = await RestaurantModel.findOne({ owner });
    if (existingRestaurant) {
      return res.status(400).json({
        message: "Restaurant already registered",
        success: false,
      });
    }

    // Create restaurant document
    const newRestaurant = await RestaurantModel.create({
      name,
      address,
      city,
      contact,
      openingHours,
      owner,
    });

    // Update user role from 'user' to 'owner'
    const updateUser = await UserModel.findByIdAndUpdate(
      owner,
      { role: "owner" },
      { new: true }
    );

    return res.status(200).json({
      message: "Restaurant Registered Successfully",
      success: true,
      data: newRestaurant,
      user: updateUser,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
});

module.exports = RestaurantRouter;
