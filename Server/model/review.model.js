const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    dining: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "dinings",
    },
    editCount: {
    type: Number,
    default: 0,
    min: 0,
    max: 1 // Maximum one edit allowed
  },
    comment: { type: String, required: true },
    dishesTried: [{ type: String }],
    rating: { type: Number, required: true, min: 1, max: 5 },
    ownerReply: { type: String, default: "" },
    images: [{ type: String }],
    isApproved: {
      type: Boolean,
      default: true, 
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


const ReviewModel = mongoose.model("reviews", ReviewSchema);
module.exports = ReviewModel;
