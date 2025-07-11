const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  renter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  totalDays: {
    type: Number,
    required: true
  },
  pricing: {
    dailyRate: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    serviceFee: {
      type: Number,
      default: 0
    },
    taxes: {
      type: Number,
      default: 0
    },
    securityDeposit: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'in-progress', 'overdue'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially-refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank-transfer', 'cash'],
    default: 'card'
  },
  paymentIntent: {
    type: String // Stripe payment intent ID
  },
  // Delivery/Pickup details
  delivery: {
    required: {
      type: Boolean,
      default: false
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    scheduledDate: Date,
    actualDate: Date,
    status: {
      type: String,
      enum: ['scheduled', 'in-transit', 'delivered', 'failed'],
      default: 'scheduled'
    }
  },
  pickup: {
    required: {
      type: Boolean,
      default: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    scheduledDate: Date,
    actualDate: Date,
    status: {
      type: String,
      enum: ['scheduled', 'picked-up', 'failed'],
      default: 'scheduled'
    }
  },
  // Communication
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  // Special instructions
  customerInstructions: String,
  renterInstructions: String,
  // Cancellation
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    refundAmount: {
      type: Number,
      default: 0
    },
    cancelledAt: Date
  },
  // Damage/Issues
  issues: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    description: {
      type: String,
      required: true
    },
    images: [{
      url: String,
      public_id: String
    }],
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    resolved: {
      type: Boolean,
      default: false
    },
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Extensions
  extensions: [{
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    newEndDate: {
      type: Date,
      required: true
    },
    additionalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Review tracking
  customerReviewed: {
    type: Boolean,
    default: false
  },
  renterReviewed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Validate booking dates
bookingSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    next(new Error('End date must be after start date'));
  }
  
  // Calculate total days
  const timeDiff = this.endDate.getTime() - this.startDate.getTime();
  this.totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  next();
});

// Calculate total amount
bookingSchema.pre('save', function(next) {
  if (this.isModified('pricing')) {
    this.pricing.totalAmount = 
      this.pricing.subtotal + 
      this.pricing.deliveryFee + 
      this.pricing.serviceFee + 
      this.pricing.taxes + 
      this.pricing.securityDeposit;
  }
  next();
});

// Indexes for efficient queries
bookingSchema.index({ customer: 1, status: 1 });
bookingSchema.index({ renter: 1, status: 1 });
bookingSchema.index({ listing: 1, status: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
