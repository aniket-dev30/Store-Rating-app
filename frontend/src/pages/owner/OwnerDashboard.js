import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const StarDisplay = ({ rating }) => (
  <div className="stars">
    {[1,2,3,4,5].map(s => <span key={s} className={`star star-display ${s <= Math.round(rating) ? 'filled' : ''}`}>★</span>)}
  </div>
);

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ field: 'updated_at', order: 'DESC' });

  useEffect(() => {
    api.get('/owner/dashboard')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const { store, ratings } = data || {};

  const sortedRatings = [...(ratings || [])].sort((a, b) => {
    const dir = sort.order === 'ASC' ? 1 : -1;
    if (sort.field === 'rating') return dir * (a.rating - b.rating);
    if (sort.field === 'name') return dir * a.name.localeCompare(b.name);
    if (sort.field === 'updated_at') return dir * (new Date(a.updated_at) - new Date(b.updated_at));
    return 0;
  });

  const handleSort = (field) => {
    setSort(s => ({ field, order: s.field === field && s.order === 'ASC' ? 'DESC' : 'ASC' }));
  };
  const sortIcon = (field) => sort.field === field ? (sort.order === 'ASC' ? ' ↑' : ' ↓') : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Store Dashboard</h1>
          <p className="page-subtitle">Monitor your store's performance and ratings</p>
        </div>
      </div>

      {!store ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🏪</div>
            <div className="empty-state-text">No store has been assigned to your account yet.<br />Please contact an administrator.</div>
          </div>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card gold">
              <div className="stat-label">Average Rating</div>
              <div className="stat-value">{Number(store.avg_rating).toFixed(1)}</div>
              <div className="stat-icon">⭐</div>
            </div>
            <div className="stat-card accent">
              <div className="stat-label">Total Ratings</div>
              <div className="stat-value">{store.total_ratings}</div>
              <div className="stat-icon">📊</div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="card-title">Store Information</h2>
            {[['Name', store.name], ['Email', store.email], ['Address', store.address || '—']].map(([l, v]) => (
              <div key={l} className="detail-row">
                <span className="detail-label">{l}</span>
                <span className="detail-value">{v}</span>
              </div>
            ))}
            <div className="detail-row">
              <span className="detail-label">Rating</span>
              <span className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <StarDisplay rating={store.avg_rating} />
                <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{Number(store.avg_rating).toFixed(2)}</span>
              </span>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">User Ratings ({ratings?.length || 0})</h2>
            {ratings?.length === 0 ? (
              <div className="empty-state"><div className="empty-state-icon">⭐</div><div className="empty-state-text">No ratings yet</div></div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('name')}>User Name<span className="sort-icon">{sortIcon('name')}</span></th>
                      <th>Email</th>
                      <th onClick={() => handleSort('rating')}>Rating<span className="sort-icon">{sortIcon('rating')}</span></th>
                      <th onClick={() => handleSort('updated_at')}>Date<span className="sort-icon">{sortIcon('updated_at')}</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRatings.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 500 }}>{r.name}</td>
                        <td>{r.email}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <StarDisplay rating={r.rating} />
                            <span style={{ fontWeight: 600, color: 'var(--gold)', fontSize: '0.875rem' }}>{r.rating}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>
                          {new Date(r.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
