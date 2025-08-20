const router = require('express').Router();
const analyticsController = require('../controllers/analytics.controller');

// Admin analytics endpoint
router.post('/admin', analyticsController.getAnalytics);

module.exports = router;
