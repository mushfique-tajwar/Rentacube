const mongoose = require('mongoose');
const Listing = require('./models/listing.model');

// MongoDB connection string - update this to match your configuration
const connectionString = 'mongodb://localhost:27017/rentacube';

async function migratePricing() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(connectionString);
        console.log('Connected to MongoDB');

        console.log('Starting pricing migration...');
        
        // Find all listings that have pricePerDay but no pricing structure
        const listingsToMigrate = await Listing.find({
            pricePerDay: { $exists: true, $ne: null },
            pricing: { $exists: false }
        });

        console.log(`Found ${listingsToMigrate.length} listings to migrate`);

        let migratedCount = 0;
        for (const listing of listingsToMigrate) {
            // Convert existing pricePerDay to the new pricing.daily structure
            listing.pricing = {
                daily: listing.pricePerDay,
                hourly: null,
                monthly: null
            };
            
            await listing.save();
            migratedCount++;
            
            if (migratedCount % 10 === 0) {
                console.log(`Migrated ${migratedCount}/${listingsToMigrate.length} listings...`);
            }
        }

        console.log(`Migration completed! Migrated ${migratedCount} listings.`);
        
        // Also update any listings that have pricing structure but missing pricePerDay for backward compatibility
        const listingsToBackfill = await Listing.find({
            'pricing.daily': { $exists: true, $ne: null },
            $or: [
                { pricePerDay: { $exists: false } },
                { pricePerDay: null }
            ]
        });

        console.log(`Found ${listingsToBackfill.length} listings needing pricePerDay backfill...`);

        let backfilledCount = 0;
        for (const listing of listingsToBackfill) {
            listing.pricePerDay = listing.pricing.daily;
            await listing.save();
            backfilledCount++;
        }

        console.log(`Backfilled ${backfilledCount} listings with pricePerDay for backward compatibility.`);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the migration
migratePricing();
