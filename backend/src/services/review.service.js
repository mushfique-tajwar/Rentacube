const Review = require('../models/Review');
const Listing = require('../models/Listing');

module.exports = {
  create: async (data) => {
    const review = await new Review(data).save();
    // Recompute aggregates
    const agg = await Review.aggregate([
      { $match: { listing: review.listing } },
      { $group: { _id: '$listing', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    if (agg.length) {
      await Listing.findByIdAndUpdate(review.listing, { avgRating: agg[0].avg, reviewCount: agg[0].count });
    }
    return review;
  },
  forListing: (listingId) => Review.find({ listing: listingId }).sort({ createdAt: -1 }).populate({ path: 'booking', select: 'customerUsername' }).populate({ path: 'listing', select: '_id' }),
  forUser: (username) => Review.find({ renterUsername: username }).sort({ createdAt: -1 }),
  byCustomerForBooking: (bookingId, customerUsername) => Review.findOne({ booking: bookingId, customerUsername })
};
