const express = require('express');
const router = express.Router();
const { getStores, submitRating } = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateRating } = require('../middleware/validate');

router.use(authenticate);
router.get('/', authorize('user', 'admin'), getStores);
router.post('/:id/ratings', authorize('user'), validateRating, submitRating);

module.exports = router;
