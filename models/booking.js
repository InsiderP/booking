// booking.js

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  seatIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat',
    required: true,
  }],
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
