const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
  description: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
  pricing: {
    hourly: { type: Number, min: 0, default: null },
    daily: { type: Number, min: 0, default: null },
    monthly: { type: Number, min: 0, default: null }
  },
  pricePerDay: { type: Number, min: 0, default: null }, // deprecated
  location: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['vehicles','electronics','clothing','home','property','sports','services'], lowercase: true },
  image: { type: String, default: null },
  owner: { type: String, required: true, trim: true },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

listingSchema.pre('save', function(next){ this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('Listing', listingSchema);
