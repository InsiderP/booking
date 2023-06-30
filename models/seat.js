// seat.js

const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seat_identifier: {
    type: String,
    required: true,
    unique: true,
  },
  seat_class: {
    type: String,
    required: true,
  },
});

const Seat = mongoose.model('Seat', seatSchema);

module.exports = Seat;


// is_booked: { type: Boolean, default: false }