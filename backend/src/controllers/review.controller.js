const reviewService = require('../services/review.service');
const bookingService = require('../services/booking.service');

exports.create = async (req, res) => {
  try {
    const { bookingId, rating, comment, customerUsername } = req.body;
    if (!bookingId || !rating || !customerUsername) return res.status(400).json('Missing required fields');
    const booking = await bookingService.findById(bookingId);
    if (!booking) return res.status(404).json('Booking not found');
    if (booking.customerUsername !== customerUsername) return res.status(403).json('Not your booking');
    if (booking.status !== 'Completed') return res.status(400).json('Can only review completed bookings');
    if (await reviewService.byCustomerForBooking(bookingId, customerUsername)) return res.status(400).json('Already reviewed');
    const review = await reviewService.create({ booking: bookingId, listing: booking.listing._id || booking.listing, renterUsername: booking.renterUsername, customerUsername, rating: Number(rating), comment });
    res.json({ message: 'Review added', review });
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

const User = require('../models/User');
exports.forListing = async (req, res) => {
  try {
    const reviews = await reviewService.forListing(req.params.listingId);
    // Attach full name for each reviewer
    const usernames = [...new Set(reviews.map(r => r.customerUsername))];
    const users = await User.find({ username: { $in: usernames } }, { username: 1, fullName: 1 });
    const nameMap = {};
    users.forEach(u => { nameMap[u.username] = u.fullName; });
    const reviewsWithName = reviews.map(r => ({
      ...r.toObject(),
      customerFullName: nameMap[r.customerUsername] || r.customerUsername
    }));
    res.json(reviewsWithName);
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.forUser = async (req, res) => {
  try { const reviews = await reviewService.forUser(req.params.username); res.json(reviews); }
  catch (e) { res.status(400).json('Error: ' + e.message); }
};
