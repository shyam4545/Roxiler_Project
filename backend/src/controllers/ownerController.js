const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── GET /api/owner/dashboard ─────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Find the store owned by this user
    const store = await prisma.store.findUnique({
      where: { ownerId },
      include: {
        ratings: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ message: 'No store found for this owner.' });
    }

    const ratings = store.ratings;
    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((s, r) => s + r.value, 0) / ratings.length) * 10) / 10
        : 0;

    const ratersList = ratings.map((r) => ({
      id: r.id,
      user: r.user,
      value: r.value,
      ratedAt: r.updatedAt,
    }));

    return res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        avgRating,
        totalRatings: ratings.length,
      },
      raters: ratersList,
    });
  } catch (err) {
    console.error('Owner dashboard error:', err);
    return res.status(500).json({ message: 'Failed to fetch owner dashboard.' });
  }
};

module.exports = { getDashboard };
