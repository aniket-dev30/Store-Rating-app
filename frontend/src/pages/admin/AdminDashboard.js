import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Platform overview and statistics</p>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat-card accent">
          <div className="stat-label">Total Users</div>
          <div className="stat-value">{stats?.totalUsers ?? 0}</div>
          <div className="stat-icon">👥</div>
        </div>
        <div className="stat-card gold">
          <div className="stat-label">Total Stores</div>
          <div className="stat-value">{stats?.totalStores ?? 0}</div>
          <div className="stat-icon">🏪</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Total Ratings</div>
          <div className="stat-value">{stats?.totalRatings ?? 0}</div>
          <div className="stat-icon">⭐</div>
        </div>
      </div>
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2 className="card-title">Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/admin/users" className="btn btn-primary">👥 Manage Users</a>
          <a href="/admin/stores" className="btn btn-secondary">🏪 Manage Stores</a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
