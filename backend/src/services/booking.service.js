const Booking = require('../models/Booking');
const User = require('../models/User');

module.exports = {
  findAll: () => Booking.find(),
  create: (data) => new Booking(data).save(),
  findById: (id) => Booking.findById(id).populate('listing'),
  findForListing: (listingId) => Booking.find({ listing: listingId }).sort({ startDate: 1 }),
  findForUser: (username) => Booking.find({ $or: [ { customerUsername: username }, { renterUsername: username } ] }).sort({ createdAt: -1 }).populate('listing'),
  findForUserWithNames: async (username) => {
    const bookings = await Booking.find({ $or: [ { customerUsername: username }, { renterUsername: username } ] }).sort({ createdAt: -1 }).populate('listing');
    
    // Get all unique usernames
    const usernames = [...new Set([
      ...bookings.map(b => b.customerUsername),
      ...bookings.map(b => b.renterUsername)
    ])];
    
    const users = await User.find({ username: { $in: usernames } }, 'username fullName');
    
    // Create a map for quick lookup
    const userMap = {};
    users.forEach(user => {
      userMap[user.username] = user.fullName;
    });
    
    // Add full names to each booking
    return bookings.map(booking => {
      const bookingObj = booking.toObject();
      bookingObj.customerFullName = userMap[booking.customerUsername] || booking.customerUsername;
      bookingObj.renterFullName = userMap[booking.renterUsername] || booking.renterUsername;
      return bookingObj;
    });
  },
  updateStatus: (id, status) => Booking.findByIdAndUpdate(id, { status }, { new: true }),
  markPaid: (id, { method, ref }) => Booking.findByIdAndUpdate(id, { paymentStatus: 'Paid', paymentMethod: method || 'manual', paymentRef: ref || '', paidAt: new Date() }, { new: true }),
  markSettled: (id) => Booking.findByIdAndUpdate(id, { paymentStatus: 'Settled', settledAt: new Date() }, { new: true }),
  autoCompleteDue: async (now = new Date()) => {
    // Complete bookings with endDate < now and currently Confirmed
    const res = await Booking.updateMany({ status: 'Confirmed', endDate: { $lt: now } }, { status: 'Completed' });
    return res.modifiedCount || res.nModified || 0;
  },
  overlappingExists: async (listingId, startDate, endDate) => {
    return await Booking.exists({
      listing: listingId,
      status: { $in: ['Pending','Confirmed'] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate }
    });
  }
};
