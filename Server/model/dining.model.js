const mongoose = require("mongoose");

const DiningSchema = new mongoose.Schema(
  {
    restaurant: { type: String, required: true, ref: "restaurants" },
    cuisineType: { type: String, required: true },
    priceRange: { type: Number, required: true },
    diningType: { type: String, required: true },
    guestCapacity: { type: Number, required: true },
    features: { type: Array, required: true },
    dietaryOptions: { type: Array, required: true },
    ambiance: { type: Array, required: true },
    images: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const DiningModel = mongoose.model("dinings", DiningSchema);
module.exports = DiningModel;
