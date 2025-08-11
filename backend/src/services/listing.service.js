const Listing = require('../models/Listing');

module.exports = {
  search: (filter = {}) => Listing.find(filter).sort({ createdAt: -1 }),
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
};
