const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── GET /api/stores ──────────────────────────────────────────────────────────
const getStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const userId = req.user.id;

    const where = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (address) where.address = { contains: address, mode: 'insensitive' };

    const validOrder = ['asc', 'desc'].includes(sortOrder) ? sortOrder : 'asc';
    const validSortBy = ['name', 'address'].includes(sortBy) ? sortBy : 'name';

    const stores = await prisma.store.findMany({
      where,
      orderBy: { [validSortBy]: validOrder },
      include: {
        ratings: { select: { value: true, userId: true } },
      },
    });

    const result = stores.map((store) => {
      const allRatings = store.ratings;
      const avgRating =
        allRatings.length > 0
          ? Math.round((allRatings.reduce((s, r) => s + r.value, 0) / allRatings.length) * 10) / 10
          : 0;
      const userRating = allRatings.find((r) => r.userId === userId);

      return {
        id: store.id,
        name: store.name,
        address: store.address,
        email: store.email,
        avgRating,
        ratingCount: allRatings.length,
        userRating: userRating ? userRating.value : null,
      };
    });

    return res.json({ stores: result });
  } catch (err) {
    console.error('Get stores error:', err);
    return res.status(500).json({ message: 'Failed to fetch stores.' });
  }
};

// ─── POST /api/stores/:id/ratings ─────────────────────────────────────────────
const submitRating = async (req, res) => {
  try {
    const storeId = parseInt(req.params.id);
    const userId = req.user.id;
    const { value } = req.body;

    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store) {
      return res.status(404).json({ message: 'Store not found.' });
    }

    const existing = await prisma.rating.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });

    if (existing) {
      return res.status(409).json({ message: 'You have already rated this store. Use PUT to modify.' });
    }

    const rating = await prisma.rating.create({
      data: { value, userId, storeId },
    });

    return res.status(201).json({ message: 'Rating submitted successfully.', rating });
  } catch (err) {
    console.error('Submit rating error:', err);
    return res.status(500).json({ message: 'Failed to submit rating.' });
  }
};

// ─── PUT /api/stores/:id/ratings ──────────────────────────────────────────────
const modifyRating = async (req, res) => {
  try {
    const storeId = parseInt(req.params.id);
    const userId = req.user.id;
    const { value } = req.body;

    const existing = await prisma.rating.findUnique({
      where: { userId_storeId: { userId, storeId } },
    });

    if (!existing) {
      return res.status(404).json({ message: 'No existing rating found. Submit a rating first.' });
    }

    const rating = await prisma.rating.update({
      where: { userId_storeId: { userId, storeId } },
      data: { value },
    });

    return res.json({ message: 'Rating updated successfully.', rating });
  } catch (err) {
    console.error('Modify rating error:', err);
    return res.status(500).json({ message: 'Failed to update rating.' });
  }
};

module.exports = { getStores, submitRating, modifyRating };
