const router = require('express').Router();
const controller = require('../controllers/listing.controller');
const upload = require('../middleware/upload');

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/create', upload.single('image'), controller.create);
router.post('/add', controller.addLegacy);
router.put('/update/:id', controller.update);
router.delete('/:id', controller.softDelete);
router.get('/category/:category', controller.byCategory);
router.get('/location/:location', controller.byLocation);
router.get('/owner/:owner', controller.byOwner);
router.put('/admin/update/:id', controller.adminUpdate);
router.delete('/admin/delete/:id', controller.adminDelete);
router.get('/admin/all', controller.adminAll);

module.exports = router;
