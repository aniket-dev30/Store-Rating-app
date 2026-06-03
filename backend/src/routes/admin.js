const express = require('express');
const router = express.Router();
const { getDashboard, getUsers, getUserById, createUser, getStores, createStore } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRegister, validateStore } = require('../middleware/validate');
const { body } = require('express-validator');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.post('/users', [
  ...validateRegister,
  body('role').optional().isIn(['admin', 'user', 'store_owner']).withMessage('Invalid role'),
], createUser);
router.get('/stores', getStores);
router.post('/stores', validateStore, createStore);

module.exports = router;
