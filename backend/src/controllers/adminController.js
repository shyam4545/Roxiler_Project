const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// ─── Helper: build sort / filter options ──────────────────────────────────────
const buildUserWhere = (query) => {
  const { name, email, address, role } = query;
  const where = {};
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (address) where.address = { contains: address, mode: 'insensitive' };
  if (role) where.role = role;
  return where;
};

const buildStoreWhere = (query) => {
  const { name, email, address } = query;
  const where = {};
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (address) where.address = { contains: address, mode: 'insensitive' };
  return where;
};

const buildOrderBy = (sortBy, sortOrder) => {
  const validOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'asc';
  if (!sortBy) return [{ id: 'asc' }];
  return [{ [sortBy]: validOrder }];
};

// ─── GET /api/admin/dashboard ─────────────────────────────────────────────────
const getDashboard = async (_req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);
    return res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
  }
};

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const { sortBy = 'name', sortOrder = 'asc' } = req.query;
    const where = buildUserWhere(req.query);
    const orderBy = buildOrderBy(sortBy, sortOrder);

    const users = await prisma.user.findMany({
      where,
      orderBy,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });
    return res.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ message: 'Failed to fetch users.' });
  }
};

// ─── POST /api/admin/users ────────────────────────────────────────────────────
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, address, role },
      select: { id: true, name: true, email: true, address: true, role: true },
    });

    return res.status(201).json({ message: 'User created successfully.', user });
  } catch (err) {
    console.error('Create user error:', err);
    return res.status(500).json({ message: 'Failed to create user.' });
  }
};

// ─── GET /api/admin/users/:id ─────────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        store: {
          select: {
            id: true,
            name: true,
            ratings: { select: { value: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Compute avg rating if store owner
    let avgRating = null;
    if (user.role === 'STORE_OWNER' && user.store) {
      const ratings = user.store.ratings;
      if (ratings.length > 0) {
        avgRating = ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length;
        avgRating = Math.round(avgRating * 10) / 10;
      } else {
        avgRating = 0;
      }
    }

    const { store, ...userData } = user;
    return res.json({
      user: {
        ...userData,
        store: store ? { id: store.id, name: store.name, avgRating } : null,
      },
    });
  } catch (err) {
    console.error('Get user by ID error:', err);
    return res.status(500).json({ message: 'Failed to fetch user.' });
  }
};

// ─── GET /api/admin/stores ────────────────────────────────────────────────────
const getStores = async (req, res) => {
  try {
    const { sortBy = 'name', sortOrder = 'asc' } = req.query;
    const where = buildStoreWhere(req.query);
    const orderBy = buildOrderBy(sortBy, sortOrder);

    const stores = await prisma.store.findMany({
      where,
      orderBy,
      include: {
        ratings: { select: { value: true } },
        owner: { select: { name: true, email: true } },
      },
    });

    const result = stores.map((store) => {
      const ratings = store.ratings;
      const avgRating =
        ratings.length > 0
          ? Math.round((ratings.reduce((s, r) => s + r.value, 0) / ratings.length) * 10) / 10
          : 0;
      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        avgRating,
        ratingCount: ratings.length,
        owner: store.owner,
      };
    });

    return res.json({ stores: result });
  } catch (err) {
    console.error('Get stores error:', err);
    return res.status(500).json({ message: 'Failed to fetch stores.' });
  }
};

// ─── POST /api/admin/stores ───────────────────────────────────────────────────
const createStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    const existing = await prisma.store.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'A store with this email already exists.' });
    }

    // Validate owner if provided
    if (ownerId) {
      const owner = await prisma.user.findUnique({ where: { id: ownerId } });
      if (!owner || owner.role !== 'STORE_OWNER') {
        return res.status(400).json({ message: 'Invalid owner: must be a STORE_OWNER.' });
      }
      const existingStore = await prisma.store.findFirst({ where: { ownerId } });
      if (existingStore) {
        return res.status(400).json({ message: 'This owner already manages a store.' });
      }
    }

    const store = await prisma.store.create({
      data: { name, email, address, ownerId: ownerId || null },
      select: { id: true, name: true, email: true, address: true, ownerId: true },
    });

    return res.status(201).json({ message: 'Store created successfully.', store });
  } catch (err) {
    console.error('Create store error:', err);
    return res.status(500).json({ message: 'Failed to create store.' });
  }
};

module.exports = { getDashboard, getUsers, createUser, getUserById, getStores, createStore };
