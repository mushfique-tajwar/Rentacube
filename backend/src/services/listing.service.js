const Listing = require('../models/Listing');
const User = require('../models/User');

module.exports = {
  findAll: () => Listing.find(),
  search: (filter = {}) => Listing.find(filter).sort({ createdAt: -1 }),
  searchWithOwnerDetails: async (filter = {}) => {
    const listings = await Listing.find(filter).sort({ createdAt: -1 });
    
    // Get all unique owners
    const ownerUsernames = [...new Set(listings.map(listing => listing.owner))];
    const owners = await User.find({ username: { $in: ownerUsernames } }, 'username fullName');
    
    // Create a map for quick lookup
    const ownerMap = {};
    owners.forEach(owner => {
      ownerMap[owner.username] = owner.fullName;
    });
    
    // Add ownerFullName to each listing
    return listings.map(listing => {
      const listingObj = listing.toObject();
      listingObj.ownerFullName = ownerMap[listing.owner] || listing.owner;
      return listingObj;
    });
  },
  findById: (id) => Listing.findById(id),
  create: (data) => new Listing(data).save(),
  update: (id, updates) => Listing.findByIdAndUpdate(id, updates, { new: true }),
  delete: (id) => Listing.findByIdAndDelete(id),
  softDelete: async (id) => {
    const listing = await Listing.findById(id);
    if (!listing) return null;
    listing.isActive = false;
    return listing.save();
  },
  freeExpired: async (now = new Date()) => {
    // Set status back to available for listings whose booking window has passed
    const res = await Listing.updateMany(
      { status: 'booked', bookedUntil: { $lt: now } },
      { status: 'available', $unset: { bookedFrom: "", bookedUntil: "" } }
    );
    return res.modifiedCount || res.nModified || 0;
  },
};
