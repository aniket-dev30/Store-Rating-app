const pool = require('../config/database');

// GET /api/stores - List all stores with user's rating
const getStores = async (req, res) => {
  try {
    const { name, address, sortBy = 'name', order = 'ASC' } = req.query;
    const userId = req.user.id;

    const allowedSortFields = ['name', 'address', 'avg_rating'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT
        s.id, s.name, s.address, s.email,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as avg_rating,
        ur.rating as user_rating
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = $1
      WHERE 1=1
    `;
    const params = [userId];
    let idx = 2;

    if (name) { query += ` AND LOWER(s.name) LIKE LOWER($${idx++})`; params.push(`%${name}%`); }
    if (address) { query += ` AND LOWER(s.address) LIKE LOWER($${idx++})`; params.push(`%${address}%`); }

    query += ` GROUP BY s.id, ur.rating ORDER BY ${sortField === 'avg_rating' ? 'avg_rating' : 's.' + sortField} ${sortOrder}`;

    const result = await pool.query(query, params);
    res.json({ stores: result.rows });
  } catch (err) {
    console.error('Get stores error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/stores/:id/ratings
const submitRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [id]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const existing = await pool.query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [userId, id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE ratings SET rating = $1 WHERE user_id = $2 AND store_id = $3',
        [rating, userId, id]
      );
      return res.json({ message: 'Rating updated successfully' });
    }

    await pool.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
      [userId, id, rating]
    );

    res.status(201).json({ message: 'Rating submitted successfully' });
  } catch (err) {
    console.error('Submit rating error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getStores, submitRating };
