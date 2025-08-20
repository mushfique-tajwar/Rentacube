const bookingService = require('../services/booking.service');
const listingService = require('../services/listing.service');

// Helper to compute total price using listing.pricing based on bookingType
function computePrice(listing, startDate, endDate, bookingType = 'daily') {
  const pricing = listing.pricing || {};
  const msPerHour = 1000 * 60 * 60;
  const msPerDay = 1000 * 60 * 60 * 24;
  if (bookingType === 'hourly') {
    const hours = Math.max(1, Math.ceil((endDate - startDate) / msPerHour));
    if (pricing.hourly) return pricing.hourly * hours;
    // fallbacks
    if (pricing.daily) return pricing.daily * Math.ceil(hours / 24);
    if (pricing.monthly) return pricing.monthly * Math.ceil(hours / (24 * 30));
  } else if (bookingType === 'daily') {
    const days = Math.max(1, Math.ceil((endDate - startDate) / msPerDay));
    if (pricing.daily) return pricing.daily * days;
    if (pricing.hourly) return pricing.hourly * 24 * days;
    if (pricing.monthly) return pricing.monthly * Math.ceil(days / 30);
    if (listing.pricePerDay) return listing.pricePerDay * days;
  } else if (bookingType === 'monthly') {
    // count months inclusively based on year and month boundaries
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1);
    if (pricing.monthly) return pricing.monthly * months;
    if (pricing.daily) return pricing.daily * 30 * months; // rough
    if (pricing.hourly) return pricing.hourly * 24 * 30 * months; // rough
  }
  return 0;
}

exports.create = async (req, res) => {
  try {
  const { listingId, customerUsername, startDate, endDate, bookingType } = req.body;
  if (!listingId || !customerUsername || !startDate || !endDate) return res.status(400).json('Missing required fields');
    const listing = await listingService.findById(listingId);
  if (!listing || !listing.isActive) return res.status(404).json('Listing not available');
  if (listing.status && listing.status !== 'available') return res.status(400).json('Listing is not available for booking');
  // Prevent booking own listing
  if (String(listing.owner) === String(customerUsername)) return res.status(400).json('You cannot book your own listing');
    // Ensure listing owner (renter) is approved
    const userService = require('../services/user.service');
    const renter = await userService.findByUsername(listing.owner);
    if (!renter || renter.userType !== 'renter' || renter.approvalStatus !== 'approved') {
      return res.status(403).json('Renter is not approved yet');
    }
    const s = new Date(startDate); const e = new Date(endDate);
    if (s > e) return res.status(400).json('Invalid date range');
    const overlap = await bookingService.overlappingExists(listingId, s, e);
    if (overlap) return res.status(400).json('Listing already booked for selected dates');
  // Normalize by bookingType
  const type = ['hourly','daily','monthly'].includes(bookingType) ? bookingType : 'daily';
  // Adjust end date for monthly mode if needed (we expect start at 1st of month and end at last day, but accept any dates)
  const totalPrice = computePrice(listing, s, e, type);
  const booking = await bookingService.create({ listing: listingId, renterUsername: listing.owner, customerUsername, bookingType: type, startDate: s, endDate: e, totalPrice });
    res.json({ message: 'Booking created', booking });
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.forUser = async (req, res) => {
  try { const bookings = await bookingService.findForUserWithNames(req.params.username); res.json(bookings); }
  catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending','Confirmed','Cancelled','Completed'].includes(status)) return res.status(400).json('Invalid status');
    // Fetch current booking to detect transitions
    const existing = await bookingService.findById(req.params.id);
    const updated = await bookingService.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json('Booking not found');
    // Reflect booking status to listing availability
    try {
      const listingId = updated.listing && updated.listing._id ? updated.listing._id : updated.listing;
      const listing = await listingService.findById(listingId);
      if (listing) {
        const uStart = new Date(updated.startDate);
        const uEnd = new Date(updated.endDate);
        if (status === 'Confirmed') {
          listing.status = 'booked';
          listing.bookedFrom = uStart;
          listing.bookedUntil = uEnd;
          // Increment total bookings counter when transitioning to Confirmed
          if (existing && existing.status !== 'Confirmed') {
            listing.bookingsCount = (listing.bookingsCount || 0) + 1;
          }
        } else if (status === 'Cancelled') {
          // If the current booked window matches this booking, free it
          if (listing.bookedFrom && listing.bookedUntil &&
              listing.bookedFrom.getTime() === uStart.getTime() &&
              listing.bookedUntil.getTime() === uEnd.getTime()) {
            listing.status = 'available';
            listing.bookedFrom = undefined;
            listing.bookedUntil = undefined;
          }
        } else if (status === 'Completed') {
          // If completed booking is the current one, free it
          if (listing.bookedUntil && new Date(listing.bookedUntil).getTime() === uEnd.getTime()) {
            listing.status = 'available';
            listing.bookedFrom = undefined;
            listing.bookedUntil = undefined;
          }
        }
        await listing.save();
      }
    } catch (e) { /* non-blocking */ }
    res.json({ message: 'Status updated', booking: updated });
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.markPaid = async (req, res) => {
  try {
    const { method, ref } = req.body;
    const updated = await bookingService.markPaid(req.params.id, { method, ref });
    if (!updated) return res.status(404).json('Booking not found');
    res.json({ message: 'Payment marked as paid', booking: updated });
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.markSettled = async (req, res) => {
  try {
    const updated = await bookingService.markSettled(req.params.id);
    if (!updated) return res.status(404).json('Booking not found');
    res.json({ message: 'Payment marked as settled', booking: updated });
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.autoComplete = async (_req, res) => {
  try {
  const count = await bookingService.autoCompleteDue();
  // Optionally, we could also free listings whose bookings completed in this run.
    res.json({ message: `Auto-completed ${count} bookings` });
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};
