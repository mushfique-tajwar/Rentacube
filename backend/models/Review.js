const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewType: {
    type: String,
    enum: ['listing', 'customer', 'renter'],
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  // Detailed ratings for listings
  detailedRatings: {
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    condition: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    location: {
      type: Number,
      min: 1,
      max: 5
    },
    value: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  title: {
    type: String,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
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
  // Pros and cons
  pros: [String],
  cons: [String],
  // Review helpfulness
  helpfulVotes: {
    type: Number,
    default: 0
  },
  unhelpfulVotes: {
    type: Number,
    default: 0
  },
  votedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['helpful', 'unhelpful']
    }
  }],
  // Moderation
  isVerified: {
    type: Boolean,
    default: false
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  moderationNotes: String,
  // Response from reviewee
  response: {
    comment: String,
    respondedAt: Date
  },
  // Flags and reports
  flags: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['inappropriate', 'spam', 'fake', 'offensive', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Ensure one review per booking per user
reviewSchema.index({ booking: 1, reviewer: 1 }, { unique: true });

// Indexes for efficient queries
reviewSchema.index({ listing: 1, isHidden: 1 });
reviewSchema.index({ reviewee: 1, reviewType: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate overall rating from detailed ratings
reviewSchema.pre('save', function(next) {
  if (this.detailedRatings && this.reviewType === 'listing') {
    const ratings = this.detailedRatings;
    const validRatings = Object.values(ratings).filter(rating => rating && rating > 0);
    
    if (validRatings.length > 0) {
      this.rating = validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;
    }
  }
  next();
});

// Method to check if user has voted on this review
reviewSchema.methods.hasUserVoted = function(userId) {
  return this.votedBy.some(vote => vote.user.toString() === userId.toString());
};

module.exports = mongoose.model('Review', reviewSchema);
