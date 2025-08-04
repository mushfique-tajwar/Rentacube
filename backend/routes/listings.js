const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Listing = require('../models/listing.model');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../frontend/public/images/listings');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure multer with file size limit and file type validation
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 150 * 1024 // 150KB limit
    },
    fileFilter: function (req, file, cb) {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// GET all listings
router.route('/').get((req, res) => {
    const { category, location, owner } = req.query;
    
    // Build filter object
    let filter = { isActive: true };
    
    if (category) {
        filter.category = category.toLowerCase();
    }
    
    if (location) {
        filter.location = new RegExp(location, 'i'); // Case-insensitive search
    }
    
    if (owner) {
        filter.owner = owner;
    }
    
    Listing.find(filter)
        .sort({ createdAt: -1 }) // Sort by newest first
        .then(listings => res.json(listings))
        .catch(err => res.status(400).json('Error: ' + err));
});

// GET single listing by ID
router.route('/:id').get((req, res) => {
    Listing.findById(req.params.id)
        .then(listing => {
            if (!listing) {
                return res.status(404).json('Listing not found');
            }
            
            // Increment view count
            listing.views += 1;
            listing.save();
            
            res.json(listing);
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

// POST - Add new listing with image upload
router.route('/create').post(upload.single('image'), (req, res) => {
    console.log('=== Backend Debug ===');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file ? { filename: req.file.filename, size: req.file.size } : 'No file');
    
    const {
        name,
        description,
        pricingHourly,
        pricingDaily,
        pricingMonthly,
        district,
        city,
        category,
        owner
    } = req.body;

    console.log('Extracted fields:');
    console.log('name:', JSON.stringify(name));
    console.log('description:', JSON.stringify(description));
    console.log('district:', JSON.stringify(district));
    console.log('city:', JSON.stringify(city));
    console.log('category:', JSON.stringify(category));
    console.log('owner:', JSON.stringify(owner));
    console.log('pricingHourly:', JSON.stringify(pricingHourly));
    console.log('pricingDaily:', JSON.stringify(pricingDaily));
    console.log('pricingMonthly:', JSON.stringify(pricingMonthly));
    console.log('=== End Debug ===');

    // Validation - check for empty strings and undefined values
    if (!name || !name.trim() || !description || !description.trim() || 
        !district || !city || !category || !owner || !owner.trim()) {
        console.log('Validation failed - missing required fields');
        return res.status(400).json('All required fields must be provided');
    }

    // Image is now mandatory
    if (!req.file) {
        return res.status(400).json('Image is required for all listings');
    }

    // At least one pricing option must be provided
    if (!pricingHourly && !pricingDaily && !pricingMonthly) {
        return res.status(400).json('At least one pricing option (hourly, daily, or monthly) must be provided');
    }

    // Validate pricing values - build pricing object
    const pricing = {};
    if (pricingHourly) {
        const hourly = Number(pricingHourly);
        if (isNaN(hourly) || hourly <= 0) {
            return res.status(400).json('Hourly price must be a valid number greater than 0');
        }
        pricing.hourly = hourly;
    }
    if (pricingDaily) {
        const daily = Number(pricingDaily);
        if (isNaN(daily) || daily <= 0) {
            return res.status(400).json('Daily price must be a valid number greater than 0');
        }
        pricing.daily = daily;
    }
    if (pricingMonthly) {
        const monthly = Number(pricingMonthly);
        if (isNaN(monthly) || monthly <= 0) {
            return res.status(400).json('Monthly price must be a valid number greater than 0');
        }
        pricing.monthly = monthly;
    }

    // Validate category
    const validCategories = ['vehicles', 'electronics', 'clothing', 'home', 'property', 'sports', 'services'];
    if (!validCategories.includes(category.toLowerCase())) {
        return res.status(400).json('Invalid category');
    }

    // Handle image - now mandatory
    const imageFilename = req.file.filename;

    // Create location string for database requirement
    const location = `${city.trim()}, ${district.trim()}`;

    const newListing = new Listing({
        name: name.trim(),
        description: description.trim(),
        pricing: pricing,
        location: location,
        district: district.trim(),
        city: city.trim(),
        category: category.toLowerCase(),
        image: imageFilename,
        owner: owner.trim()
    });

    newListing.save()
        .then(() => res.json({
            message: 'Listing created successfully!',
            listing: newListing
        }))
        .catch(err => {
            console.error('Database save error:', err);
            // If there was an error saving to database, delete the uploaded file
            if (req.file) {
                fs.unlink(req.file.path, (unlinkErr) => {
                    if (unlinkErr) console.error('Error deleting file:', unlinkErr);
                });
            }
            res.status(400).json('Error: ' + err);
        });
});

// POST - Add new listing (existing route for backward compatibility)
router.route('/add').post((req, res) => {
    const {
        name,
        description,
        pricePerDay,
        location,
        category,
        image,
        owner
    } = req.body;

    // Validation
    if (!name || !description || !location || !category || !owner) {
        return res.status(400).json('All required fields must be provided!!!');
    }

    // if (pricePerDay <= 0) {
    //     return res.status(400).json('Price per day must be greater than 0');
    // }

    // if (pricePerHour <= 0) {
    //     return res.status(400).json('Price per hour must be greater than 0');
    // }

    // if (pricePerMonth <= 0) {
    //     return res.status(400).json('Price per month must be greater than 0');
    // }

    const validCategories = ['vehicles', 'electronics', 'clothing', 'home', 'property', 'sports', 'services'];
    if (!validCategories.includes(category.toLowerCase())) {
        return res.status(400).json('Invalid category');
    }

    const newListing = new Listing({
        name: name.trim(),
        description: description.trim(),
        pricePerDay: Number(pricePerDay),
        location: location.trim(),
        category: category.toLowerCase(),
        image: image || null,
        owner: owner.trim()
    });

    newListing.save()
        .then(() => res.json('Listing added successfully!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

// PUT - Update listing
router.route('/update/:id').put((req, res) => {
    Listing.findById(req.params.id)
        .then(listing => {
            if (!listing) {
                return res.status(404).json('Listing not found');
            }

            // Check if the user is the owner (you might want to add proper authentication here)
            if (listing.owner !== req.body.owner) {
                return res.status(403).json('You can only edit your own listings');
            }

            // Update fields
            listing.name = req.body.name || listing.name;
            listing.description = req.body.description || listing.description;
            
            // Update pricing structure
            if (req.body.pricingHourly !== undefined || req.body.pricingDaily !== undefined || req.body.pricingMonthly !== undefined) {
                listing.pricing = listing.pricing || {};
                
                if (req.body.pricingHourly !== undefined) {
                    listing.pricing.hourly = req.body.pricingHourly ? Number(req.body.pricingHourly) : null;
                }
                if (req.body.pricingDaily !== undefined) {
                    listing.pricing.daily = req.body.pricingDaily ? Number(req.body.pricingDaily) : null;
                }
                if (req.body.pricingMonthly !== undefined) {
                    listing.pricing.monthly = req.body.pricingMonthly ? Number(req.body.pricingMonthly) : null;
                }
            }
            
            // Update location if district or city changed
            if (req.body.district || req.body.city) {
                const newDistrict = req.body.district || listing.district;
                const newCity = req.body.city || listing.city;
                listing.location = `${newCity}, ${newDistrict}`;
                listing.district = newDistrict;
                listing.city = newCity;
            }
            
            listing.category = req.body.category || listing.category;
            listing.image = req.body.image !== undefined ? req.body.image : listing.image;
            listing.isActive = req.body.isActive !== undefined ? req.body.isActive : listing.isActive;

            listing.save()
                .then(() => res.json('Listing updated successfully!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

// DELETE - Delete listing (soft delete by setting isActive to false)
router.route('/:id').delete((req, res) => {
    Listing.findById(req.params.id)
        .then(listing => {
            if (!listing) {
                return res.status(404).json('Listing not found');
            }

            // Check if the user is the owner (you might want to add proper authentication here)
            if (listing.owner !== req.body.owner) {
                return res.status(403).json('You can only delete your own listings');
            }

            listing.isActive = false;
            listing.save()
                .then(() => res.json('Listing deleted successfully!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

// GET listings by category
router.route('/category/:category').get((req, res) => {
    const category = req.params.category.toLowerCase();
    const validCategories = ['vehicles', 'electronics', 'clothing', 'home', 'property', 'sports', 'services'];
    
    if (!validCategories.includes(category)) {
        return res.status(400).json('Invalid category');
    }
    
    Listing.find({ category: category, isActive: true })
        .sort({ createdAt: -1 })
        .then(listings => res.json(listings))
        .catch(err => res.status(400).json('Error: ' + err));
});

// GET listings by location
router.route('/location/:location').get((req, res) => {
    const location = req.params.location;
    
    Listing.find({ 
        location: new RegExp(location, 'i'), // Case-insensitive search
        isActive: true 
    })
        .sort({ createdAt: -1 })
        .then(listings => res.json(listings))
        .catch(err => res.status(400).json('Error: ' + err));
});

// GET listings by owner
router.route('/owner/:owner').get((req, res) => {
    const owner = req.params.owner;
    
    Listing.find({ owner: owner })
        .sort({ createdAt: -1 })
        .then(listings => res.json(listings))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Admin routes - Update any listing
router.route('/admin/update/:id').put((req, res) => {
    // Simple admin check (in production, use proper JWT authentication)
    if (req.body.adminUsername !== 'admin') {
        return res.status(403).json('Access denied. Admin privileges required.');
    }
    
    Listing.findById(req.params.id)
        .then(listing => {
            if (!listing) {
                return res.status(404).json('Listing not found');
            }
            
            // Update fields
            listing.name = req.body.name || listing.name;
            listing.description = req.body.description || listing.description;
            
            // Update pricing structure
            if (req.body.pricingHourly !== undefined || req.body.pricingDaily !== undefined || req.body.pricingMonthly !== undefined) {
                listing.pricing = listing.pricing || {};
                
                if (req.body.pricingHourly !== undefined) {
                    listing.pricing.hourly = req.body.pricingHourly ? Number(req.body.pricingHourly) : null;
                }
                if (req.body.pricingDaily !== undefined) {
                    listing.pricing.daily = req.body.pricingDaily ? Number(req.body.pricingDaily) : null;
                }
                if (req.body.pricingMonthly !== undefined) {
                    listing.pricing.monthly = req.body.pricingMonthly ? Number(req.body.pricingMonthly) : null;
                }
            }
            
            // Update location if district or city changed
            if (req.body.district || req.body.city) {
                const newDistrict = req.body.district || listing.district;
                const newCity = req.body.city || listing.city;
                listing.location = `${newCity}, ${newDistrict}`;
                listing.district = newDistrict;
                listing.city = newCity;
            }
            
            listing.category = req.body.category || listing.category;
            listing.isActive = req.body.isActive !== undefined ? req.body.isActive : listing.isActive;
            
            return listing.save();
        })
        .then(() => res.json('Listing updated successfully!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

// Admin routes - Delete any listing (hard delete)
router.route('/admin/delete/:id').delete((req, res) => {
    // Simple admin check (in production, use proper JWT authentication)
    if (req.body.adminUsername !== 'admin') {
        return res.status(403).json('Access denied. Admin privileges required.');
    }
    
    Listing.findByIdAndDelete(req.params.id)
        .then(listing => {
            if (!listing) {
                return res.status(404).json('Listing not found');
            }
            
            // Delete associated image file if it exists
            if (listing.image) {
                const imagePath = path.join(__dirname, '../../frontend/public/images/listings', listing.image);
                fs.unlink(imagePath, (err) => {
                    if (err) console.error('Error deleting image file:', err);
                });
            }
            
            res.json('Listing deleted successfully!');
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

// Admin routes - Get all listings (including inactive)
router.route('/admin/all').get((req, res) => {
    // Simple admin check via query parameter
    if (req.query.adminUsername !== 'admin') {
        return res.status(403).json('Access denied. Admin privileges required.');
    }
    
    Listing.find({}) // Get all listings, including inactive ones
        .sort({ createdAt: -1 })
        .then(listings => res.json(listings))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
