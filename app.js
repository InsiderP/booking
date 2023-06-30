// app.js

const express = require("express");
const mongoose = require("mongoose");
const Seat = require("./models/seat.js");
const SeatPricing = require("./models/seatPricing.js");
const Booking = require("./models/booking.js");
const dotenv = require("dotenv");
const {seat,seatPricing}=require("./data/data.js")
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 9000;

/* ADD DATA ONE TIME ONLY OR AS NEEDED*/
  //  await mongoose.connection.db.dropDatabase();
  //  Seat.insertMany(seat)
  // SeatPricing.insertMany(seatPricing )

// Get all seats, ordered by seat class, with is_booked property
app.get("/seats", async (req, res) => {
  try {
    const seats = await Seat.find().sort({ seat_class: 1 });

    // Retrieve the seat pricing based on bookings
    const seatBookings = await Seat.aggregate([
      {
        $lookup: {
          from: "bookings",
          localField: "seat_class",
          foreignField: "seat_class",
          as: "bookings",
        },
      },
    ]);

    const updatedSeats = seats.map((seat) => {
      const bookings = seatBookings.find(
        (booking) => booking._id.toString() === seat._id.toString()
      );
      const isBooked = bookings && bookings.bookings.length > 0;
      return { ...seat.toObject(), is_booked: isBooked };
    });

    res.json(updatedSeats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get seat details with pricing based on seat class and bookings
app.get("/seats/:id", async (req, res) => {
  try {
    const seat = await Seat.findById(req.params.id);
    if (!seat) {
      return res.status(404).json({ error: "Seat not found" });
    }

    const bookings = await Seat.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: "bookings",
          localField: "seat_class",
          foreignField: "seat_class",
          as: "bookings",
        },
      },
    ]);

    const bookingCount = bookings[0].bookings.length;
    const seatPricing = await SeatPricing.findOne({ seat_class: seat.seat_class });

    let price;
    if (bookingCount < 0.4 * seat.capacity) {
      price = seatPricing.min_price || seatPricing.normal_price;
    } else if (bookingCount >= 0.4 * seat.capacity && bookingCount <= 0.6 * seat.capacity) {
      price = seatPricing.normal_price || seatPricing.max_price;
    } else {
      price = seatPricing.max_price || seatPricing.normal_price;
    }

    const seatDetails = { ...seat.toObject(), price };
    res.json(seatDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create a booking for selected seats
app.post("/booking", async (req, res) => {
  try {
    const { seatIds, name, phoneNumber, totalAmount } = req.body;

    // Check if seats are already booked
    const bookedSeats = await Seat.find({ _id: { $in: seatIds }, is_booked: true });
    if (bookedSeats.length > 0) {
      return res.status(400).json({ error: "Some seats are already booked" });
    }

    // Create the booking
    const booking = await Booking.create({ seatIds, name, phoneNumber, totalAmount });

    res.json({ bookingId: booking._id, totalAmount: booking.totalAmount });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all bookings for a user
app.get("/bookings", async (req, res) => {
  try {
    const userIdentifier = req.query.userIdentifier;

    if (!userIdentifier) {
      return res.status(400).json({ error: "User identifier not provided" });
    }

    const bookings = await Booking.find({ $or: [{ email: userIdentifier }, { phoneNumber: userIdentifier }] });

    res.json(bookings);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));
