const router = require('express').Router();
const controller = require('../controllers/user.controller');

router.get('/', controller.getUsers);
router.post('/add', controller.register);
router.post('/login', controller.login);
router.put('/profile', controller.updateProfile);
router.put('/password', controller.changePassword);
router.post('/request-renter', controller.requestRenter);
router.get('/admin/pending-renters', controller.pendingRenters);
router.put('/admin/approve/:id', controller.setApproval);
router.put('/admin/update/:id', controller.adminUpdate);
router.delete('/admin/delete/:id', controller.adminDelete);

module.exports = router;
