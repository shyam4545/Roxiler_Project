const express = require('express');
const router = express.Router();

const { getStores, submitRating, modifyRating } = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, ratingSchema } = require('../validators/schemas');

// List stores — accessible by all authenticated users
router.get('/', authenticate, getStores);

// Ratings — USER role only
router.post('/:id/ratings', authenticate, authorize('USER'), validate(ratingSchema), submitRating);
router.put('/:id/ratings', authenticate, authorize('USER'), validate(ratingSchema), modifyRating);

module.exports = router;
