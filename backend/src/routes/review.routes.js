const router = require('express').Router();
const controller = require('../controllers/review.controller');

router.post('/create', controller.create);
router.get('/listing/:listingId', controller.forListing);
router.get('/renter/:username', controller.forUser);

module.exports = router;
