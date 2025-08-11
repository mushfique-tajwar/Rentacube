const path = require('path');
const fs = require('fs');
const listingService = require('../services/listing.service');
const Listing = require('../models/Listing');

exports.getAll = async (req, res) => {
  const { category, location, owner } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category.toLowerCase();
  if (location) filter.location = new RegExp(location, 'i');
  if (owner) filter.owner = owner;
  try { const listings = await listingService.search(filter); res.json(listings); }
  catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.getOne = async (req, res) => {
  try {
    const listing = await listingService.findById(req.params.id);
    if (!listing) return res.status(404).json('Listing not found');
    listing.views += 1; await listing.save();
    res.json(listing);
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.create = async (req, res) => {
  const { name, description, pricingHourly, pricingDaily, pricingMonthly, district, city, category, owner } = req.body;
  if (!name || !name.trim() || !description || !description.trim() || !district || !city || !category || !owner || !owner.trim()) return res.status(400).json('All required fields must be provided');
  if (!req.file) return res.status(400).json('Image is required for all listings');
  if (!pricingHourly && !pricingDaily && !pricingMonthly) return res.status(400).json('At least one pricing option (hourly, daily, or monthly) must be provided');
  const pricing = {};
  if (pricingHourly) { const v = Number(pricingHourly); if (isNaN(v) || v <= 0) return res.status(400).json('Hourly price must be a valid number greater than 0'); pricing.hourly = v; }
  if (pricingDaily) { const v = Number(pricingDaily); if (isNaN(v) || v <= 0) return res.status(400).json('Daily price must be a valid number greater than 0'); pricing.daily = v; }
  if (pricingMonthly) { const v = Number(pricingMonthly); if (isNaN(v) || v <= 0) return res.status(400).json('Monthly price must be a valid number greater than 0'); pricing.monthly = v; }
  const validCategories = ['vehicles','electronics','clothing','home','property','sports','services'];
  if (!validCategories.includes(category.toLowerCase())) return res.status(400).json('Invalid category');
  const imageFilename = req.file.filename;
  const location = `${city.trim()}, ${district.trim()}`;
  try {
    const newListing = await listingService.create({ name: name.trim(), description: description.trim(), pricing, location, district: district.trim(), city: city.trim(), category: category.toLowerCase(), image: imageFilename, owner: owner.trim() });
    res.json({ message: 'Listing created successfully!', listing: newListing });
  } catch (e) {
    if (req.file) fs.unlink(req.file.path, ()=>{});
    res.status(400).json('Error: ' + e.message);
  }
};

exports.addLegacy = async (req, res) => {
  const { name, description, pricePerDay, location, category, image, owner } = req.body;
  if (!name || !description || !location || !category || !owner) return res.status(400).json('All required fields must be provided!!!');
  const validCategories = ['vehicles','electronics','clothing','home','property','sports','services'];
  if (!validCategories.includes(category.toLowerCase())) return res.status(400).json('Invalid category');
  try { await listingService.create({ name: name.trim(), description: description.trim(), pricePerDay: Number(pricePerDay), location: location.trim(), category: category.toLowerCase(), image: image || null, owner: owner.trim() }); res.json('Listing added successfully!'); }
  catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.update = async (req, res) => {
  try {
    const listing = await listingService.findById(req.params.id);
    if (!listing) return res.status(404).json('Listing not found');
    if (listing.owner !== req.body.owner) return res.status(403).json('You can only edit your own listings');
    if (req.body.pricingHourly !== undefined || req.body.pricingDaily !== undefined || req.body.pricingMonthly !== undefined) {
      listing.pricing = listing.pricing || {};
      if (req.body.pricingHourly !== undefined) listing.pricing.hourly = req.body.pricingHourly ? Number(req.body.pricingHourly) : null;
      if (req.body.pricingDaily !== undefined) listing.pricing.daily = req.body.pricingDaily ? Number(req.body.pricingDaily) : null;
      if (req.body.pricingMonthly !== undefined) listing.pricing.monthly = req.body.pricingMonthly ? Number(req.body.pricingMonthly) : null;
    }
    if (req.body.district || req.body.city) {
      const newDistrict = req.body.district || listing.district;
      const newCity = req.body.city || listing.city;
      listing.location = `${newCity}, ${newDistrict}`;
      listing.district = newDistrict;
      listing.city = newCity;
    }
    listing.name = req.body.name || listing.name;
    listing.description = req.body.description || listing.description;
    listing.category = req.body.category || listing.category;
    listing.image = req.body.image !== undefined ? req.body.image : listing.image;
    listing.isActive = req.body.isActive !== undefined ? req.body.isActive : listing.isActive;
    await listing.save();
    res.json('Listing updated successfully!');
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.softDelete = async (req, res) => {
  try {
    const listing = await listingService.findById(req.params.id);
    if (!listing) return res.status(404).json('Listing not found');
    if (listing.owner !== req.body.owner) return res.status(403).json('You can only delete your own listings');
    listing.isActive = false; await listing.save();
    res.json('Listing deleted successfully!');
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.byCategory = async (req, res) => {
  const category = req.params.category.toLowerCase();
  const validCategories = ['vehicles','electronics','clothing','home','property','sports','services'];
  if (!validCategories.includes(category)) return res.status(400).json('Invalid category');
  try { const listings = await listingService.search({ category, isActive: true }); res.json(listings); }
  catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.byLocation = async (req, res) => {
  const location = req.params.location;
  try { const listings = await listingService.search({ location: new RegExp(location, 'i'), isActive: true }); res.json(listings); }
  catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.byOwner = async (req, res) => {
  const owner = req.params.owner;
  try { const listings = await listingService.search({ owner }); res.json(listings); }
  catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.adminUpdate = async (req, res) => {
  if (req.body.adminUsername !== 'admin') return res.status(403).json('Access denied. Admin privileges required.');
  try {
    const listing = await listingService.findById(req.params.id);
    if (!listing) return res.status(404).json('Listing not found');
    if (req.body.pricingHourly !== undefined || req.body.pricingDaily !== undefined || req.body.pricingMonthly !== undefined) {
      listing.pricing = listing.pricing || {};
      if (req.body.pricingHourly !== undefined) listing.pricing.hourly = req.body.pricingHourly ? Number(req.body.pricingHourly) : null;
      if (req.body.pricingDaily !== undefined) listing.pricing.daily = req.body.pricingDaily ? Number(req.body.pricingDaily) : null;
      if (req.body.pricingMonthly !== undefined) listing.pricing.monthly = req.body.pricingMonthly ? Number(req.body.pricingMonthly) : null;
    }
    if (req.body.district || req.body.city) {
      const newDistrict = req.body.district || listing.district;
      const newCity = req.body.city || listing.city;
      listing.location = `${newCity}, ${newDistrict}`;
      listing.district = newDistrict;
      listing.city = newCity;
    }
    listing.name = req.body.name || listing.name;
    listing.description = req.body.description || listing.description;
    listing.category = req.body.category || listing.category;
    listing.isActive = req.body.isActive !== undefined ? req.body.isActive : listing.isActive;
    await listing.save();
    res.json('Listing updated successfully!');
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.adminDelete = async (req, res) => {
  if (req.body.adminUsername !== 'admin') return res.status(403).json('Access denied. Admin privileges required.');
  try {
    const listing = await listingService.delete(req.params.id);
    if (!listing) return res.status(404).json('Listing not found');
    if (listing.image) {
      const imagePath = path.join(__dirname, '../../../frontend/public/images/listings', listing.image);
      fs.unlink(imagePath, ()=>{});
    }
    res.json('Listing deleted successfully!');
  } catch (e) { res.status(400).json('Error: ' + e.message); }
};

exports.adminAll = async (req, res) => {
  if (req.query.adminUsername !== 'admin') return res.status(403).json('Access denied. Admin privileges required.');
  try { const listings = await listingService.search({}); res.json(listings); }
  catch (e) { res.status(400).json('Error: ' + e.message); }
};
