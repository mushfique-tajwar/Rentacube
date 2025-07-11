const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'electronics',
      'vehicles',
      'tools',
      'furniture',
      'sports',
      'photography',
      'outdoor',
      'home-garden',
      'clothing',
      'books',
      'music',
      'party-events',
      'others'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true
    },
    alt: String
  }],
  price: {
    daily: {
      type: Number,
      required: [true, 'Daily price is required'],
      min: [0, 'Price cannot be negative']
    },
    weekly: {
      type: Number,
      min: [0, 'Price cannot be negative']
    },
    monthly: {
      type: Number,
      min: [0, 'Price cannot be negative']
    }
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  availability: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    unavailableDates: [{
      type: Date
    }],
    minimumRentalDays: {
      type: Number,
      default: 1,
      min: 1
    },
    maximumRentalDays: {
      type: Number,
      default: 30,
      min: 1
    }
  },
  specifications: {
    brand: String,
    model: String,
    year: Number,
    condition: {
      type: String,
      enum: ['new', 'like-new', 'good', 'fair', 'poor'],
      default: 'good'
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number
    },
    features: [String]
  },
  policies: {
    deliveryAvailable: {
      type: Boolean,
      default: false
    },
    deliveryFee: {
      type: Number,
      default: 0
    },
    pickupRequired: {
      type: Boolean,
      default: true
    },
    securityDeposit: {
      type: Number,
      default: 0
    },
    cancellationPolicy: {
      type: String,
      enum: ['flexible', 'moderate', 'strict'],
      default: 'moderate'
    },
    lateReturnFee: {
      type: Number,
      default: 0
    },
    damageFee: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deleted'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  // Ratings and reviews
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  // SEO
  slug: {
    type: String,
    unique: true
  },
  metaDescription: String,
  keywords: [String],
  // Featured listing
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: Date
}, {
  timestamps: true
});

// Create slug from title
listingSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-') + '-' + Date.now();
  }
  next();
});

// Validate availability dates
listingSchema.pre('save', function(next) {
  if (this.availability.startDate >= this.availability.endDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Text search index
listingSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  'location.city': 'text',
  'location.state': 'text'
});

// Location index for geospatial queries
listingSchema.index({ 'location.coordinates': '2dsphere' });

// Compound indexes for efficient queries
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ owner: 1, status: 1 });
listingSchema.index({ 'price.daily': 1, status: 1 });
listingSchema.index({ averageRating: -1, status: 1 });
listingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Listing', listingSchema);
