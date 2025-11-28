const express = require("express");
const ReservationRouter = express.Router();

const ReservationModel = require("../model/reservation.model");
const DiningModel = require("../model/dining.model");
const { verifyToken } = require("../middleware/auth.middleware");
const RestaurantModel = require("../model/restaurant.model");
const sendEmail = require("../config/resend"); // Changed from nodemailer to resend
const stripe = require("../config/stripe");

// Create Stripe payment session
ReservationRouter.post("/stripe-payment", verifyToken, async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user._id;

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

    if (booking.isPaid) {
      return res.status(400).json({
        message: "Booking is already paid",
        success: false,
      });
    }

    if (booking.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending bookings can be paid",
        success: false,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      locale: "en",
      success_url: `${process.env.FRONTEND_URL}/my-bookings?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/my-bookings?payment_cancelled=true`,
      customer_email: req.user.email,
      client_reference_id: bookingId,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Table Reservation - ${booking.restaurant.name}`,
              description: `Dining: ${
                booking.dining.cuisineType
              } | Date: ${new Date(
                booking.reservationDateTime
              ).toLocaleDateString()} | Guests: ${booking.guests}`,
              images:
                booking.dining.images?.length > 0
                  ? [booking.dining.images[0]]
                  : undefined,
            },
            unit_amount: Math.round(booking.totalPrice * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId: bookingId.toString(),
        userId: userId.toString(),
        restaurantName: booking.restaurant.name,
        diningName: booking.dining.cuisineType,
        guests: booking.guests.toString(),
      },
      ui_mode: "hosted",
      allow_promotion_codes: false,
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
ReservationRouter.post("/stripe-webhook", async (req, res) => {
  console.log("Webhook received at:", new Date().toISOString());

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  if (!sig) {
    console.error("Missing Stripe-Signature header");
    return res.status(400).json({ error: "Missing signature header" });
  }

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

  try {
    switch (event.type) {
      case "checkout.session.completed":
        console.log("Processing checkout.session.completed event...");
        const session = event.data.object;

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

        if (booking.isPaid && booking.stripeSessionId === session.id) {
          console.log("Booking already processed for this session");
          return res.json({ received: true, message: "Already processed" });
        }

        booking.isPaid = true;
        booking.status = "Confirmed";
        booking.paymentMethod = "stripe";
        booking.paymentDate = new Date();
        booking.stripeSessionId = session.id;
        await booking.save();

        console.log("Booking updated successfully:", booking._id);

        try {
          const populatedBooking = await ReservationModel.findById(bookingId)
            .populate({
              path: "dining",
              populate: { path: "restaurant" },
            })
            .populate("user", "name email");

          if (populatedBooking?.user?.email) {
            await sendEmail({
              from: "DineArea <onboarding@resend.dev>", // Updated for Resend format
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
        }
        break;

      case "payment_intent.succeeded":
        console.log("Payment intent succeeded:", event.data.object.id);
        break;

      default:
        console.log("Unhandled event type:", event.type);
    }

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
});

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

    const userRestaurants = await RestaurantModel.find({ owner: user });

    if (userRestaurants.length > 0) {
      return res.status(403).json({
        message: "Restaurant owners cannot make reservations at any restaurant",
        success: false,
      });
    }

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
      isPaid: false,
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
        from: "DineArea <onboarding@resend.dev>", // Updated for Resend format
        to: recipientEmail,
        subject: `Booking Confirmation - ${diningData.restaurant.name}`,
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

    const allReservations = await ReservationModel.find({
      restaurant: { $in: restaurantIds },
    })
      .populate("user", "name email")
      .populate("restaurant", "name address city")
      .populate("dining", "name")
      .sort({ createdAt: -1 });

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

// Update a reservation
ReservationRouter.put("/:reservationId", verifyToken, async (req, res) => {
  try {
    const { reservationId } = req.params;
    const userId = req.user._id;
    const { reservationDateTime, guests, specialRequests } = req.body;

    const userRestaurants = await RestaurantModel.find({ owner: userId });

    if (userRestaurants.length > 0) {
      return res.status(403).json({
        message:
          "Restaurant owners cannot modify reservations at any restaurant",
        success: false,
      });
    }

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

    if (
      reservationDateTime &&
      new Date(reservationDateTime).getTime() !==
        currentReservationDateTime.getTime()
    ) {
      const startTime = new Date(reservationDateTime);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      const existingReservations = await ReservationModel.find({
        dining: reservation.dining,
        _id: { $ne: reservationId },
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

    const updates = {};
    if (reservationDateTime)
      updates.reservationDateTime = new Date(reservationDateTime);
    if (guests && guests !== reservation.guests) {
      updates.guests = parseInt(guests);
      const diningData = await DiningModel.findById(reservation.dining);
      if (diningData) {
        updates.totalPrice = diningData.priceRange * parseInt(guests);
      }
    }
    if (specialRequests !== undefined)
      updates.specialRequests = specialRequests;

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

    const selectedDate = new Date(date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot select a past date",
      });
    }

    const dining = await DiningModel.findById(diningId);
    if (!dining) {
      return res.status(404).json({
        success: false,
        message: "Dining area not found",
      });
    }

    const restaurant = await RestaurantModel.findById(dining.restaurant);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const [openTime, closeTime] = restaurant.openingHours.split(" - ");

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

      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute -= 60;
      }
    }

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

module.exports = ReservationRouter;
