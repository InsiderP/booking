// seatPricing.js

const mongoose = require('mongoose');

const seatPricingSchema = new mongoose.Schema({
  seat_class: {
    type: String,
    required: true,
    unique: true,
  },
  min_price: {
    type: String,
  },
  normal_price: {
    type: String,
  },
  max_price: {
    type: String,
  },
});

const SeatPricing = mongoose.model('SeatPricing', seatPricingSchema);

module.exports = SeatPricing;
