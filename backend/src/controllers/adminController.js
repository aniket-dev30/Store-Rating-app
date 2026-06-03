const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [usersCount, storesCount, ratingsCount] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE role != 'admin'"),
      pool.query('SELECT COUNT(*) FROM stores'),
      pool.query('SELECT COUNT(*) FROM ratings'),
    ]);

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalStores: parseInt(storesCount.rows[0].count),
      totalRatings: parseInt(ratingsCount.rows[0].count),
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'name', order = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'role', 'created_at'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
    const params = [];
    let idx = 1;

    if (name) { query += ` AND LOWER(name) LIKE LOWER($${idx++})`; params.push(`%${name}%`); }
    if (email) { query += ` AND LOWER(email) LIKE LOWER($${idx++})`; params.push(`%${email}%`); }
    if (address) { query += ` AND LOWER(address) LIKE LOWER($${idx++})`; params.push(`%${address}%`); }
    if (role) { query += ` AND role = $${idx++}`; params.push(role); }

    query += ` ORDER BY ${sortField} ${sortOrder}`;

    const result = await pool.query(query, params);
    res.json({ users: result.rows });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, email, address, role, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];

    if (user.role === 'store_owner') {
      const storeResult = await pool.query(
        `SELECT s.id, s.name, s.address,
          COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as avg_rating
         FROM stores s
         LEFT JOIN ratings r ON r.store_id = s.id
         WHERE s.owner_id = $1
         GROUP BY s.id`,
        [id]
      );
      user.stores = storeResult.rows;
    }

    res.json({ user });
  } catch (err) {
    console.error('Get user by id error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/users
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const allowedRoles = ['admin', 'user', 'store_owner'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, address, role`,
      [name, email, hashedPassword, address, userRole]
    );

    res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/admin/stores
const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'name', order = 'ASC' } = req.query;

    const allowedSortFields = ['name', 'email', 'address', 'avg_rating'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
    const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
        COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as avg_rating,
        u.name as owner_name
      FROM stores s
      LEFT JOIN ratings r ON r.store_id = s.id
      LEFT JOIN users u ON u.id = s.owner_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (name) { query += ` AND LOWER(s.name) LIKE LOWER($${idx++})`; params.push(`%${name}%`); }
    if (email) { query += ` AND LOWER(s.email) LIKE LOWER($${idx++})`; params.push(`%${email}%`); }
    if (address) { query += ` AND LOWER(s.address) LIKE LOWER($${idx++})`; params.push(`%${address}%`); }

    query += ` GROUP BY s.id, u.name ORDER BY ${sortField === 'avg_rating' ? 'avg_rating' : 's.' + sortField} ${sortOrder}`;

    const result = await pool.query(query, params);
    res.json({ stores: result.rows });
  } catch (err) {
    console.error('Get stores error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/admin/stores
const createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;

    const existing = await pool.query('SELECT id FROM stores WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Store email already registered' });
    }

    if (owner_id) {
      const ownerCheck = await pool.query("SELECT id FROM users WHERE id = $1 AND role = 'store_owner'", [owner_id]);
      if (ownerCheck.rows.length === 0) {
        return res.status(400).json({ message: 'Owner must be a user with store_owner role' });
      }
    }

    const result = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, address, owner_id`,
      [name, email, address, owner_id || null]
    );

    res.status(201).json({ message: 'Store created successfully', store: result.rows[0] });
  } catch (err) {
    console.error('Create store error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard, getUsers, getUserById, createUser, getStores, createStore };
