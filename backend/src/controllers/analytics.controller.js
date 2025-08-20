const userService = require('../services/user.service');
const listingService = require('../services/listing.service');
const bookingService = require('../services/booking.service');

// Get comprehensive analytics for admin panel
exports.getAnalytics = async (req, res) => {
  // Verify admin access
  if (req.body.adminUsername !== 'admin') {
    return res.status(403).json('Access denied. Admin privileges required.');
  }

  try {
    // Get all users
    const allUsers = await userService.findAll();
    const customers = allUsers.filter(user => user.userType === 'customer');
    const renters = allUsers.filter(user => user.userType === 'renter');

    // Get all listings
    const allListings = await listingService.findAll();
    
    // Get all bookings
    const allBookings = await bookingService.findAll();
    
    // Calculate total views
    const totalViews = allListings.reduce((sum, listing) => sum + (listing.views || 0), 0);
    
    // Calculate transactions and money exchanged
    const completedBookings = allBookings.filter(booking => booking.status === 'Completed');
    const paidBookings = allBookings.filter(booking => booking.paymentStatus === 'Paid' || booking.paymentStatus === 'Settled');
    const totalTransactions = paidBookings.length;
    const totalMoneyExchanged = paidBookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    // Group listings by category
    const listingsByCategory = {};
    allListings.forEach(listing => {
      const category = listing.category || 'uncategorized';
      listingsByCategory[category] = (listingsByCategory[category] || 0) + 1;
    });

    // Calculate booking statistics
    const totalBookings = allBookings.length;
    const pendingBookings = allBookings.filter(booking => booking.status === 'Pending').length;
    const confirmedBookings = allBookings.filter(booking => booking.status === 'Confirmed').length;
    const cancelledBookings = allBookings.filter(booking => booking.status === 'Cancelled').length;

    // Calculate active vs inactive listings
    const activeListings = allListings.filter(listing => listing.isActive).length;
    const inactiveListings = allListings.filter(listing => !listing.isActive).length;

    const analytics = {
      // User statistics
      users: {
        total: allUsers.length,
        customers: customers.length,
        renters: renters.length,
        pendingRenters: renters.filter(renter => renter.approvalStatus === 'pending').length
      },
      
      // Listing statistics
      listings: {
        total: allListings.length,
        active: activeListings,
        inactive: inactiveListings,
        byCategory: listingsByCategory
      },
      
      // View statistics
      views: {
        total: totalViews
      },
      
      // Booking and transaction statistics
      transactions: {
        totalBookings: totalBookings,
        pendingBookings: pendingBookings,
        confirmedBookings: confirmedBookings,
        completedBookings: completedBookings.length,
        cancelledBookings: cancelledBookings,
        totalTransactions: totalTransactions,
        totalMoneyExchanged: totalMoneyExchanged
      }
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json('Error fetching analytics: ' + error.message);
  }
};
