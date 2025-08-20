const router = require('express').Router();
const controller = require('../controllers/listing.controller');
const upload = require('../middleware/upload');

// Public reads
router.get('/', controller.getAll);
router.get('/category/:category', controller.byCategory);
router.get('/location/:location', controller.byLocation);
router.get('/owner/:owner', controller.byOwner);
router.get('/admin/all', controller.adminAll);
router.get('/:id', controller.getOne);

// Create/Update/Delete - now supports multiple images
router.post('/create', upload.multiple, controller.create);
router.post('/add', controller.addLegacy);
router.put('/update/:id', upload.multiple, controller.update);
router.put('/toggle/:id', controller.toggleActive);
router.delete('/:id', controller.softDelete);

// Admin maintenance
router.put('/admin/update/:id', controller.adminUpdate);
router.delete('/admin/delete/:id', controller.adminDelete);

module.exports = router;
