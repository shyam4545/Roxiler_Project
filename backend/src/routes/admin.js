const express = require('express');
const router = express.Router();

const {
  getDashboard,
  getUsers,
  createUser,
  getUserById,
  getStores,
  createStore,
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, createUserSchema, createStoreSchema } = require('../validators/schemas');

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);
router.post('/users', validate(createUserSchema), createUser);
router.get('/users/:id', getUserById);
router.get('/stores', getStores);
router.post('/stores', validate(createStoreSchema), createStore);

module.exports = router;
