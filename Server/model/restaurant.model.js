const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    contact: { type: String, required: true },
    openingHours: { type: String, required: true },
    owner: { type: String, required: true, ref: "users" },
  },
  {
    timestamps: true,
  }
);

const RestaurantModel = mongoose.model("restaurants", RestaurantSchema);
console.log("Restaurant created successfully", RestaurantModel);
module.exports = RestaurantModel;
