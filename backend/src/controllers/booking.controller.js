const bookingService = require('../services/booking.service');
const listingService = require('../services/listing.service');

// Helper to compute total price using listing.pricing (simple daily rate * days fallback)
function computePrice(listing, startDate, endDate) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.ceil((endDate - startDate) / msPerDay) || 1;
  const pricing = listing.pricing || {};
  if (pricing.daily) return pricing.daily * days;
  if (pricing.hourly) return pricing.hourly * 24 * days; // rough
  if (pricing.monthly) return (pricing.monthly / 30) * days; // rough
  if (listing.pricePerDay) return listing.pricePerDay * days;
  return 0;
}

exports.create = async (req, res) => {
  try {
    const { listingId, customerUsername, startDate, endDate } = req.body;
    if (!listingId || !customerUsername || !startDate || !endDate) return res.status(400).json('Missing required fields');
    const listing = await listingService.findById(listingId);
    if (!listing || !listing.isActive) return res.status(404).json('Listing not available');
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
    const totalPrice = computePrice(listing, s, e);
    const booking = await bookingService.create({ listing: listingId, renterUsername: listing.owner, customerUsername, startDate: s, endDate: e, totalPrice });
    res.json({ message: 'Booking created', booking });
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.forUser = async (req, res) => {
  try { const bookings = await bookingService.findForUser(req.params.username); res.json(bookings); }
  catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending','Confirmed','Cancelled','Completed'].includes(status)) return res.status(400).json('Invalid status');
    const updated = await bookingService.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json('Booking not found');
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
    res.json({ message: `Auto-completed ${count} bookings` });
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};
