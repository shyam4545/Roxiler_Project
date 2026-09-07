const express = require('express');
const router = express.Router();

const { getDashboard } = require('../controllers/ownerController');
const { authenticate, authorize } = require('../middleware/auth');

// Owner dashboard — STORE_OWNER role only
router.get('/dashboard', authenticate, authorize('STORE_OWNER'), getDashboard);

module.exports = router;
