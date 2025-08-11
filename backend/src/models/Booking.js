const mongoose = require('mongoose');

// Booking: represents a request by a customer to rent a listing for a given date range.
// Status flow: Pending -> Confirmed -> (Cancelled|Completed)
// Prevent overlapping Confirmed or Pending bookings on same listing + overlapping date ranges.

const bookingSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  renterUsername: { type: String, required: true, trim: true }, // owner of listing (for quick access)
  customerUsername: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending','Confirmed','Cancelled','Completed'], default: 'Pending' },
  totalPrice: { type: Number, min: 0, default: 0 },
  // Payment tracking: customer pays, renter marks as settled
  paymentStatus: { type: String, enum: ['Unpaid','Paid','Settled'], default: 'Unpaid' },
  paymentMethod: { type: String, trim: true, default: '' },
  paymentRef: { type: String, trim: true, default: '' },
  paidAt: { type: Date },
  settledAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bookingSchema.pre('save', function(next){ this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Booking', bookingSchema);
