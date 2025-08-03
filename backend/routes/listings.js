const router = require('express').Router();
const Listing = require('../models/listing.model');

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

// POST - Add new listing
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
    if (!name || !description || !pricePerDay || !location || !category || !owner) {
        return res.status(400).json('All required fields must be provided');
    }

    if (pricePerDay <= 0) {
        return res.status(400).json('Price per day must be greater than 0');
    }

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
            listing.pricePerDay = req.body.pricePerDay || listing.pricePerDay;
            listing.location = req.body.location || listing.location;
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

// POST - Add sample data (for testing purposes)
router.route('/seed').post((req, res) => {
    const sampleListings = [
        {
            name: 'Modern Electric Car',
            description: 'Clean and efficient electric vehicle perfect for city driving. Features autopilot and premium sound system.',
            pricePerDay: 50,
            location: 'New York',
            category: 'vehicles',
            owner: 'testuser'
        },
        {
            name: 'Professional Camera Kit',
            description: 'High-end DSLR camera with multiple lenses and accessories. Perfect for professional photography.',
            pricePerDay: 30,
            location: 'Los Angeles',
            category: 'electronics',
            owner: 'testuser'
        },
        {
            name: 'Designer Wedding Dress',
            description: 'Elegant designer wedding dress, size 8. Dry cleaned and ready for your special day.',
            pricePerDay: 200,
            location: 'Chicago',
            category: 'clothing',
            owner: 'testuser'
        },
        {
            name: 'Luxury Apartment Downtown',
            description: 'Beautiful 2-bedroom apartment with ocean view. Full kitchen, WiFi, and parking included.',
            pricePerDay: 150,
            location: 'Miami',
            category: 'property',
            owner: 'testuser'
        },
        {
            name: 'Mountain Bike',
            description: 'High-quality mountain bike perfect for trails and city riding. Helmet included.',
            pricePerDay: 25,
            location: 'Denver',
            category: 'sports',
            owner: 'testuser'
        },
        {
            name: 'Wedding Photography Service',
            description: 'Professional wedding photography with edited photos delivered within 2 weeks.',
            pricePerDay: 500,
            location: 'San Francisco',
            category: 'services',
            owner: 'testuser'
        },
        {
            name: 'Vintage Home Decor Set',
            description: 'Beautiful vintage furniture and decor pieces perfect for events and staging.',
            pricePerDay: 40,
            location: 'Boston',
            category: 'home',
            owner: 'testuser'
        },
        {
            name: 'Gaming Laptop',
            description: 'High-performance gaming laptop with latest graphics card. Perfect for work or gaming.',
            pricePerDay: 45,
            location: 'Seattle',
            category: 'electronics',
            owner: 'testuser'
        }
    ];

    Listing.insertMany(sampleListings)
        .then(() => res.json('Sample listings added successfully!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;
