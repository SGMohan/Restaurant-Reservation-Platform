require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const AuthRouter = require("./controller/auth.controller");
const RestaurantRouter = require("./controller/restaurant.controller");
const DiningRouter = require("./controller/dining.controller");
const connectCloudinary = require("./config/cloudinary");
const ReservationRouter = require("./controller/reservation.controller");
const ReviewRouter = require("./controller/review.controller");

const app = express();
connectDB();
connectCloudinary();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// ⚠️ IMPORTANT: Webhook route MUST come BEFORE express.json() middleware
// This ensures the raw body is preserved for Stripe signature verification
app.use(
  "/reservation/stripe-webhook",
  express.raw({
    type: "application/json",
    limit: "10mb", // Increase limit if needed
  }),
  (req, res, next) => {
    // Ensure the body is preserved as raw bytes
    if (req.body && req.body.constructor === Buffer) {
      console.log("✅ Raw body preserved correctly for webhook");
    } else {
      console.error("❌ Body is not a Buffer:", typeof req.body);
    }
    next();
  }
);


// Regular JSON middleware for all other routes
app.use(express.json());

// Routes
app.use("/auth", AuthRouter);
app.use("/restaurants", RestaurantRouter);
app.use("/dinings", DiningRouter);
app.use("/reservation", ReservationRouter);
app.use("/reviews", ReviewRouter);

app.get("/", (_, res) => {
  return res.status(200).json({
    message: "Welcome to the API",
  });
});

app.listen(process.env.PORT, process.env.HOSTNAME, () => {
  console.log(`http://${process.env.HOSTNAME}:${process.env.PORT}`);
});
