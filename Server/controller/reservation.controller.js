const express = require("express")
const ReservationRouter = express.Router();

const ReservationModel = require("../model/reservation.model");
const DiningModel = require("../model/dining.model");
const { verifyToken } = require("../middleware/auth.middleware");
const RestaurantModel = require("../model/restaurant.model");
const sendEmail = require("../config/nodemailer");
const stripe = require("../config/stripe");

// Create Stripe payment session
ReservationRouter.post("/stripe-payment", verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user._id;

    // Find the booking
    const booking = await ReservationModel.findOne({
      _id: bookingId,
      user: userId,
    })
      .populate("restaurant")
      .populate("dining");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
        success: false,
      });
    }

    // Check if booking is already paid
    if (booking.isPaid) {
      return res.status(400).json({
        message: "Booking is already paid",
        success: false,
      });
    }

    // Check if booking status allows payment
    if (booking.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending bookings can be paid",
        success: false,
      });
    }

    // Create Stripe checkout session with improved configuration
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      // SOLUTION: Specify locale explicitly to avoid translation errors
      locale: "en", // or "auto" for automatic detection

      success_url: `${process.env.FRONTEND_URL}/my-bookings?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/my-bookings?payment_cancelled=true`,

      customer_email: req.user.email,
      client_reference_id: bookingId,

      // IMPROVED: Better line item configuration
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Table Reservation - ${booking.restaurant.name}`,
              description: `Dining: ${booking.dining.cuisineType} | Date: ${new Date(
                booking.reservationDateTime
              ).toLocaleDateString()} | Guests: ${booking.guests}`,
              // Optional: Add images
              images:
                booking.dining.images?.length > 0
                  ? [booking.dining.images[0]]
                  : undefined,
            },
            unit_amount: Math.round(booking.totalPrice * 100), // Ensure integer
          },
          quantity: 1,
        },
      ],

      //ENHANCED: Better metadata
      metadata: {
        bookingId: bookingId.toString(),
        userId: userId.toString(),
        restaurantName: booking.restaurant.name,
        diningName: booking.dining.cuisineType,
        guests: booking.guests.toString(),
      },

      // OPTIONAL: Custom checkout appearance
      ui_mode: "hosted", // Explicitly set to hosted mode

      // OPTIONAL: Automatic tax calculation (if needed)
      // automatic_tax: { enabled: false },

      // ENHANCED: Better success/cancel handling
      allow_promotion_codes: false, // Disable promo codes if not needed
    });

    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Stripe payment error:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
});


// Stripe webhook handler for payment confirmation
ReservationRouter.post(
  "/stripe-webhook",
  //REMOVED express.raw here since it's handled in app.js
  async (req, res) => {
    console.log("Webhook received at:", new Date().toISOString());

    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Debug logging
    // console.log("Stripe-Signature header:", sig ? "Present" : "MISSING");
    // console.log("Webhook secret exists:", !!webhookSecret);
    // console.log("Raw body type:", typeof req.body);
    // console.log("Raw body length:", req.body?.length || 0);
    // console.log("Raw body is Buffer:", Buffer.isBuffer(req.body));

    // ENHANCED ERROR HANDLING
    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET not configured");
      return res.status(500).json({ error: "Webhook secret not configured" });
    }

    if (!sig) {
      console.error("Missing Stripe-Signature header");
      return res.status(400).json({ error: "Missing signature header" });
    }

    // STRICT BODY VALIDATION
    if (!req.body || !Buffer.isBuffer(req.body)) {
      console.error(
        "Invalid body type for webhook. Expected Buffer, got:",
        typeof req.body
      );
      return res
        .status(400)
        .json({ error: "Invalid webhook payload - body must be raw buffer" });
    }

    if (req.body.length === 0) {
      console.error("Empty webhook body");
      return res.status(400).json({ error: "Empty webhook payload" });
    }

    let event;
    try {
      //IMPROVED: Construct event with explicit verification
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      console.log("Webhook verified successfully:", event.type, event.id);
    } catch (err) {
      console.error("Webhook verification failed:", err.message);
      console.error("Error details:", {
        name: err.name,
        type: err.type,
        message: err.message,
      });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case "checkout.session.completed":
          console.log("Processing checkout.session.completed event...");
          const session = event.data.object;

          // Extract booking ID from metadata or client_reference_id
          const bookingId =
            session.metadata?.bookingId || session.client_reference_id;

          if (!bookingId) {
            console.error("No booking ID found in session metadata");
            return res
              .status(400)
              .json({ error: "No booking ID found in session" });
          }

          console.log("Processing booking ID:", bookingId);

          const booking = await ReservationModel.findById(bookingId);
          if (!booking) {
            console.error("Booking not found:", bookingId);
            return res.status(404).json({ error: "Booking not found" });
          }

          //PREVENT DOUBLE PROCESSING
          if (booking.isPaid && booking.stripeSessionId === session.id) {
            console.log("Booking already processed for this session");
            return res.json({ received: true, message: "Already processed" });
          }

          // Update booking
          booking.isPaid = true;
          booking.status = "Confirmed";
          booking.paymentMethod = "stripe";
          booking.paymentDate = new Date();
          booking.stripeSessionId = session.id;
          await booking.save();

          console.log("Booking updated successfully:", booking._id);

          // Optional: Send confirmation email
          try {
            const populatedBooking = await ReservationModel.findById(bookingId)
              .populate({
                path: "dining",
                populate: { path: "restaurant" },
              })
              .populate("user", "name email");

            if (populatedBooking?.user?.email) {
              await sendEmail({
                from: {
                  name: "DineArea",
                  address: process.env.EMAIL_USER,
                },
                to: populatedBooking.user.email,
                subject: `Payment Confirmed - ${populatedBooking.dining.restaurant.name}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Payment Confirmed!</h2>
                    <p>Hi ${populatedBooking.user.name},</p>
                    <p>Your payment has been successfully processed and your booking is now confirmed!</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                      <h3 style="margin-top: 0;">Booking Details:</h3>
                      <p><strong>Restaurant:</strong> ${
                        populatedBooking.dining.restaurant.name
                      }</p>
                      <p><strong>Date & Time:</strong> ${new Date(
                        populatedBooking.reservationDateTime
                      ).toLocaleString()}</p>
                      <p><strong>Guests:</strong> ${populatedBooking.guests}</p>
                      <p><strong>Total Paid:</strong> ₹${
                        populatedBooking.totalPrice
                      }</p>
                      <p><strong>Status:</strong> Confirmed</p>
                    </div>
                    
                    <p>Thank you for choosing us!</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                  </div>
                `,
              });
            }
          } catch (emailError) {
            console.error(
              "Failed to send payment confirmation email:",
              emailError.message
            );
            // Don't fail the webhook for email errors
          }
          break;

        case "payment_intent.succeeded":
          console.log("Payment intent succeeded:", event.data.object.id);
          // Handle if needed
          break;

        default:
          console.log("Unhandled event type:", event.type);
      }

      //ALWAYS respond with success to acknowledge receipt
      res.json({
        received: true,
        processed: true,
        eventType: event.type,
        eventId: event.id,
      });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error.message,
      });
    }
  }
);



// Verify payment status
ReservationRouter.get(
  "/verify-payment/:bookingId",
  verifyToken,
  async (req, res) => {
    try {
      const { bookingId } = req.params;
      const userId = req.user._id;

      const booking = await ReservationModel.findOne({
        _id: bookingId,
        user: userId,
      });

      if (!booking) {
        return res.status(404).json({
          message: "Booking not found",
          success: false,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          isPaid: booking.isPaid,
          status: booking.status,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  }
);

// Check availability of a dining slot
ReservationRouter.post("/check-availability", async (req, res) => {
  try {
    const { reservationDateTime, dining, excludeReservationId } = req.body;

    const startTime = new Date(reservationDateTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const query = {
      dining,
      reservationDateTime: {
        $gte: startTime,
        $lt: endTime,
      },
      status: { $ne: "cancelled" },
    };

    // If modifying existing reservation, exclude it from availability check
    if (excludeReservationId) {
      query._id = { $ne: excludeReservationId };
    }

    const existingReservations = await ReservationModel.find(query);

    const isAvailable = existingReservations.length === 0;
    return res.status(200).json({
      success: true,
      data: isAvailable,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

// Create a new reservation
ReservationRouter.post("/reserve", verifyToken, async (req, res) => {
  try {
    const {
      dining,
      reservationDateTime,
      guests,
      specialRequests,
      paymentMethod = "pay at restaurant",
      userEmail,
      userName,
    } = req.body;
    const user = req.user._id;

    // Check if user is an owner of ANY restaurant
    const userRestaurants = await RestaurantModel.find({ owner: user });

    if (userRestaurants.length > 0) {
      return res.status(403).json({
        message: "Restaurant owners cannot make reservations at any restaurant",
        success: false,
      });
    }

    // Get dining data first to check restaurant ownership
    const diningData = await DiningModel.findById(dining).populate(
      "restaurant"
    );

    if (!diningData) {
      return res.status(404).json({
        message: "Dining area not found",
        success: false,
      });
    }

    const startTime = new Date(reservationDateTime);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    // Check availability before booking
    const existing = await ReservationModel.find({
      dining,
      reservationDateTime: {
        $gte: startTime,
        $lt: endTime,
      },
      status: { $ne: "cancelled" },
    });

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Slot is not available",
        success: false,
      });
    }

    let totalPrice = diningData.priceRange;

    // Calculate total price for guests
    if (guests > 1) {
      totalPrice = totalPrice * guests;
    }

    const reservation = await ReservationModel.create({
      user,
      dining,
      restaurant: diningData.restaurant._id,
      reservationDateTime,
      guests,
      totalPrice,
      specialRequests,
      paymentMethod,
      status: "Pending",
      isPaid: false, // Always false initially
    });

    const populatedReservation = await ReservationModel.findById(
      reservation._id
    )
      .populate({
        path: "dining",
        populate: {
          path: "restaurant",
        },
      })
      .populate("restaurant")
      .populate("user", "name email");

    // Email sending logic
    const recipientEmail = userEmail || req.user.email;
    const recipientName = userName || req.user.name;

    if (!recipientEmail) {
      console.error("No email recipient defined");
      return res.status(201).json({
        message: "Booking created successfully, but no email sent",
        success: true,
        data: populatedReservation,
      });
    }

    try {
      await sendEmail({
        from: {
          name: "DineArea",
          address: process.env.EMAIL_USER,
        },
        to: recipientEmail,
        subject: `Booking Confirmation - ${diningData.restaurant.name}`,
        text: `Hi ${recipientName},\n\nYour booking for ${diningData.restaurant.name} on ${reservationDateTime} has been confirmed.\n\nGuests: ${guests}\nTotal Price: ${totalPrice}\n\nThank you for choosing us!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">Booking Confirmation</h2>
              <p>Hi ${recipientName},</p>
              <p>Your booking has been confirmed successfully!</p>

              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Booking Details:</h3>
                <p><strong>Dining Area:</strong> ${
                  diningData.restaurant.name
                }, (${diningData.cuisineType})</p>
                <p><strong>Date & Time:</strong> ${new Date(
                  reservationDateTime
                ).toLocaleString()}</p>
                <p><strong>Guests:</strong> ${guests}</p>
                <p><strong>Total Price:</strong> ₹${totalPrice}</p>
                <p><strong>Status:</strong> Confirmed</p>
                ${
                  specialRequests
                    ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>`
                    : ""
                }
              </div>
              
              <p>If you have any questions or need to modify your reservation, please contact us.</p>
              <p>Thank you for choosing us!</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #666; font-size: 12px;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          `,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError.message);
    }

    return res.status(201).json({
      message: "Booking Created Successfully",
      success: true,
      data: populatedReservation,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
});

// Get all reservations for a user
ReservationRouter.get("/my-bookings", verifyToken, async (req, res) => {
  try {
    const user = req.user._id;
    const reservations = await ReservationModel.find({ user })
      .populate({
        path: "dining",
        populate: {
          path: "restaurant",
        },
      })
      .populate("restaurant")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Bookings fetched successfully",
      success: true,
      data: reservations,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

// Get restaurant bookings for dashboard (Owner only)
ReservationRouter.get("/restaurant-bookings", verifyToken, async (req, res) => {
  try {
    const ownerId = req.user._id;

    // First, find all restaurants owned by this user
    const ownerRestaurants = await RestaurantModel.find({ owner: ownerId });
    const restaurantIds = ownerRestaurants.map((restaurant) => restaurant._id);

    if (restaurantIds.length === 0) {
      return res.status(200).json({
        success: true,
        dashboardData: {
          reservations: [],
          totalReservations: 0,
          totalRevenue: 0,
          cancellationRate: 0,
          averageGuests: 0,
        },
      });
    }

    // Get all reservations for owner's restaurants
    const allReservations = await ReservationModel.find({
      restaurant: { $in: restaurantIds },
    })
      .populate("user", "name email")
      .populate("restaurant", "name address city")
      .populate("dining", "name")
      .sort({ createdAt: -1 });

    // Calculate dashboard statistics
    const totalReservations = allReservations.length;
    const totalRevenue = allReservations
      .filter((reservation) => reservation.status !== "Cancelled")
      .reduce((sum, reservation) => sum + (reservation.totalPrice || 0), 0);

    const cancelledReservations = allReservations.filter(
      (reservation) => reservation.status === "Cancelled"
    ).length;
    const cancellationRate =
      totalReservations > 0
        ? Math.round((cancelledReservations / totalReservations) * 100)
        : 0;

    const totalGuests = allReservations
      .filter((reservation) => reservation.status !== "Cancelled")
      .reduce((sum, reservation) => sum + (reservation.guests || 0), 0);
    const confirmedReservations = allReservations.filter(
      (reservation) => reservation.status !== "Cancelled"
    ).length;
    const averageGuests =
      confirmedReservations > 0
        ? Math.round(totalGuests / confirmedReservations)
        : 0;

    // Get recent reservations (last 10)
    const recentReservations = allReservations.slice(0, 10);

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      dashboardData: {
        reservations: recentReservations,
        totalReservations,
        totalRevenue,
        cancellationRate,
        averageGuests,
      },
    });
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
});

// Cancel a reservation
ReservationRouter.post(
  "/cancel/:reservationId",
  verifyToken,
  async (req, res) => {
    try {
      const { reservationId } = req.params;
      const userId = req.user._id;

      // Find the reservation and verify it belongs to the user
      const reservation = await ReservationModel.findOne({
        _id: reservationId,
        user: userId,
      });

      if (!reservation) {
        return res.status(404).json({
          message: "Reservation not found",
          success: false,
        });
      }

      // Check if reservation can be cancelled
      const now = new Date();
      const reservationDateTime = new Date(reservation.reservationDateTime);

      if (reservationDateTime <= now) {
        return res.status(400).json({
          message: "Cannot cancel past reservations",
          success: false,
        });
      }

      if (reservation.status === "Cancelled") {
        return res.status(400).json({
          message: "Booking is already cancelled",
          success: false,
        });
      }

      // Update reservation status
      reservation.status = "Cancelled";
      await reservation.save();

      return res.status(200).json({
        message: "Booking Cancelled",
        success: true,
        data: reservation,
      });
    } catch (error) {
      return res.status(500).json({ message: error.message, success: false });
    }
  }
);

// Get a specific reservation
ReservationRouter.get("/:reservationId", verifyToken, async (req, res) => {
  try {
    const { reservationId } = req.params;
    const userId = req.user._id;

    const reservation = await ReservationModel.findOne({
      _id: reservationId,
      user: userId,
    })
      .populate({
        path: "dining",
        populate: {
          path: "restaurant",
        },
      })
      .populate("restaurant");

    if (!reservation) {
      return res.status(404).json({
        message: "Reservation not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Reservation fetched successfully",
      success: true,
      data: reservation,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, success: false });
  }
});

// Update a reservation - POINT 5: Only allow modification if not paid
ReservationRouter.put("/:reservationId", verifyToken, async (req, res) => {
  try {
    const { reservationId } = req.params;
    const userId = req.user._id;
    const { reservationDateTime, guests, specialRequests } = req.body;

    // Check if user is an owner of ANY restaurant
    const userRestaurants = await RestaurantModel.find({ owner: userId });

    if (userRestaurants.length > 0) {
      return res.status(403).json({
        message:
          "Restaurant owners cannot modify reservations at any restaurant",
        success: false,
      });
    }

    // Find the reservation and verify it belongs to the user
    const reservation = await ReservationModel.findOne({
      _id: reservationId,
      user: userId,
    }).populate("restaurant");

    if (!reservation) {
      return res.status(404).json({
        message: "Reservation not found",
        success: false,
      });
    }

    const now = new Date();
    const currentReservationDateTime = new Date(
      reservation.reservationDateTime
    );

    if (currentReservationDateTime <= now) {
      return res.status(400).json({
        message: "Cannot modify past reservations",
        success: false,
      });
    }

    // POINT 5: If payment is completed, user cannot modify
    if (reservation.isPaid) {
      return res.status(400).json({
        message: "Cannot modify paid reservations. You can only cancel them.",
        success: false,
      });
    }

    if (reservation.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending reservations can be modified",
        success: false,
      });
    }

    // If changing the date/time, check availability (exclude current reservation)
    if (
      reservationDateTime &&
      new Date(reservationDateTime).getTime() !==
        currentReservationDateTime.getTime()
    ) {
      const startTime = new Date(reservationDateTime);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      const existingReservations = await ReservationModel.find({
        dining: reservation.dining,
        _id: { $ne: reservationId }, // Exclude current reservation
        reservationDateTime: {
          $gte: startTime,
          $lt: endTime,
        },
        status: { $ne: "Cancelled" },
      });

      if (existingReservations.length > 0) {
        return res.status(400).json({
          message: "Selected time slot is not available",
          success: false,
        });
      }
    }

    // Prepare updates
    const updates = {};
    if (reservationDateTime)
      updates.reservationDateTime = new Date(reservationDateTime);
    if (guests && guests !== reservation.guests) {
      updates.guests = parseInt(guests);
      // Recalculate price if guests changed
      const diningData = await DiningModel.findById(reservation.dining);
      if (diningData) {
        updates.totalPrice = diningData.priceRange * parseInt(guests);
      }
    }
    if (specialRequests !== undefined)
      updates.specialRequests = specialRequests;

    // Update the reservation
    const updatedReservation = await ReservationModel.findByIdAndUpdate(
      reservationId,
      updates,
      { new: true, runValidators: true }
    )
      .populate({
        path: "dining",
        populate: {
          path: "restaurant",
        },
      })
      .populate("restaurant")
      .populate("user", "name email");

    return res.status(200).json({
      message: "Booking updated successfully",
      success: true,
      data: updatedReservation,
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return res.status(500).json({ message: error.message, success: false });
  }
});

// Get available times
ReservationRouter.get("/available-times/:diningId", async (req, res) => {
  try {
    const { diningId } = req.params;
    const { date, excludeReservationId } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    // Validate date format
    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot select a past date",
      });
    }

    // Get dining area details
    const dining = await DiningModel.findById(diningId);
    if (!dining) {
      return res.status(404).json({
        success: false,
        message: "Dining area not found",
      });
    }

    // Get restaurant opening hours
    const restaurant = await RestaurantModel.findById(dining.restaurant);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Parse opening hours (assuming format like "9:00 AM - 10:00 PM")
    const [openTime, closeTime] = restaurant.openingHours.split(" - ");

    // Convert to 24-hour format
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":");

      if (modifier === "PM" && hours !== "12") {
        hours = parseInt(hours, 10) + 12;
      } else if (modifier === "AM" && hours === "12") {
        hours = "00";
      }

      return `${hours}:${minutes}`;
    };

    const openTime24 = parseTime(openTime);
    const closeTime24 = parseTime(closeTime);

    // Generate all possible time slots (e.g., every 30 minutes)
    const timeSlots = [];
    const [openHour, openMinute] = openTime24.split(":").map(Number);
    const [closeHour, closeMinute] = closeTime24.split(":").map(Number);

    let currentHour = openHour;
    let currentMinute = openMinute;

    while (
      currentHour < closeHour ||
      (currentHour === closeHour && currentMinute < closeMinute)
    ) {
      const timeSlot = `${String(currentHour).padStart(2, "0")}:${String(
        currentMinute
      ).padStart(2, "0")}`;
      timeSlots.push(timeSlot);

      // Increment by 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
    }

    // Get existing reservations for this date and dining area
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const reservations = await ReservationModel.find({
      dining: diningId,
      reservationDateTime: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $ne: "Cancelled" },
    });

    // Filter out booked time slots
    const bookedTimeSlots = reservations
      .filter(
        (reservation) => reservation._id.toString() !== excludeReservationId
      )
      .map((reservation) => {
        const resDate = new Date(reservation.reservationDateTime);
        return `${String(resDate.getHours()).padStart(2, "0")}:${String(
          resDate.getMinutes()
        ).padStart(2, "0")}`;
      });

    // Filter available time slots
    const availableTimeSlots = timeSlots.filter(
      (timeSlot) => !bookedTimeSlots.includes(timeSlot)
    );

    res.json({
      success: true,
      data: availableTimeSlots,
    });
  } catch (error) {
    console.error("Error fetching available times:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Verify payment status
ReservationRouter.get(
  "/verify-payment/:bookingId",
  verifyToken,
  async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await ReservationModel.findById(bookingId);

      if (!booking) {
        return res.status(404).json({
          message: "Booking not found",
          success: false,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          isPaid: booking.isPaid,
          status: booking.status,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
        success: false,
      });
    }
  }
);

module.exports = ReservationRouter;
