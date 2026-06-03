const pool = require('../config/database');

// GET /api/owner/dashboard
const getDashboard = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const storeResult = await pool.query(
      `SELECT s.id, s.name, s.address, s.email,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as avg_rating,
        COUNT(r.id) as total_ratings
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
       WHERE s.owner_id = $1
       GROUP BY s.id`,
      [ownerId]
    );

    if (storeResult.rows.length === 0) {
      return res.json({ store: null, ratings: [], avgRating: 0 });
    }

    const store = storeResult.rows[0];

    const ratingsResult = await pool.query(
      `SELECT u.id, u.name, u.email, r.rating, r.created_at, r.updated_at
       FROM ratings r
       JOIN users u ON u.id = r.user_id
       WHERE r.store_id = $1
       ORDER BY r.updated_at DESC`,
      [store.id]
    );

    res.json({
      store,
      ratings: ratingsResult.rows,
    });
  } catch (err) {
    console.error('Owner dashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard };
