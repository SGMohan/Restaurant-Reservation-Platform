const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, ref: "users" },
    dining: { type: String, required: true, ref: "dinings" },
    restaurant: { type: String, required: true, ref: "restaurants" },
    reservationDateTime: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    guests: { type: Number, required: true },
    specialRequests: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["pay at restaurant", "stripe"],
      default: "pay at restaurant", // POINT 1: Default remains "pay at restaurant"
    },
    isPaid: {
      type: Boolean,
      default: false, // POINT 2: Default remains false
    },
    paymentDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const ReservationModel = mongoose.model("reservations", ReservationSchema);
console.log("Reservation Created Successfully", ReservationModel);
module.exports = ReservationModel;
