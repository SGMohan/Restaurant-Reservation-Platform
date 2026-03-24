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
const AiRouter = require("./controller/ai.controller");

// Setup HTTP Server and Socket.io
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

connectDB();
connectCloudinary();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// IMPORTANT: Webhook route MUST come BEFORE express.json() middleware
app.use(
  "/reservation/stripe-webhook",
  express.raw({
    type: "application/json",
    limit: "10mb",
  }),
  (req, _, next) => {
    if (req.body && req.body.constructor === Buffer) {
      console.log("Raw body preserved correctly for webhook");
    } else {
      console.error("Body is not a Buffer:", typeof req.body);
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
app.use("/chat", AiRouter); // Mount AI Assistant route

// Socket.io Handlers for AI Assistant
io.on("connection", (socket) => {
  console.log("A user connected to DineArea AI:", socket.id);

  // Broadcast AI online status
  socket.emit("ai_online", { status: "ready" });

  // Handle typing indicator
  socket.on("user_typing", (data) => {
    // Notify about AI thinking/typing if it's a simulated or real flow
    socket.emit("ai_typing", { typing: true });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (_, res) => {
  return res.status(200).json({
    message: "DineArea API is live and healthy",
  });
});

server.listen(process.env.PORT, process.env.HOSTNAME, () => {
  console.log(`Server running at http://${process.env.HOSTNAME}:${process.env.PORT}`);
});



