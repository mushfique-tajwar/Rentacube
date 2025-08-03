const mongoose = require('mongoose');
const Listing = require('./models/listing.model');

mongoose.connect(process.env.ATLAS_URI);

async function updateImages() {
  try {
    const updates = [
      { name: 'Modern Electric Car', image: 'modern-electric-car.jpg' },
      { name: 'Professional Camera Kit', image: 'professional-camera-kit.jpg' },
      { name: 'Designer Wedding Dress', image: 'designer-wedding-dress.jpg' },
      { name: 'Luxury Apartment Downtown', image: 'luxury-apartment-downtown.jpg' },
      { name: 'Mountain Bike', image: 'mountain-bike.jpg' },
      { name: 'Wedding Photography Service', image: 'wedding-photography-service.jpg' },
      { name: 'Vintage Home Decor Set', image: 'vintage-home-decor-set.jpg' },
      { name: 'Gaming Laptop', image: 'gaming-laptop.jpg' }
    ];

    for (const update of updates) {
      const result = await Listing.updateOne(
        { name: update.name },
        { $set: { image: update.image } }
      );
      console.log(`Updated ${update.name} with image: ${update.image} (${result.modifiedCount} modified)`);
    }
    
    console.log('All listings updated with image filenames!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating listings:', error);
    process.exit(1);
  }
}

updateImages();
