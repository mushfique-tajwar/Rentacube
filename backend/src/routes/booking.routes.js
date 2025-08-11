const router = require('express').Router();
const controller = require('../controllers/booking.controller');

router.post('/create', controller.create);
router.get('/user/:username', controller.forUser);
router.put('/status/:id', controller.updateStatus);
router.put('/pay/:id', controller.markPaid);
router.put('/settle/:id', controller.markSettled);
router.post('/auto-complete', controller.autoComplete);

module.exports = router;
