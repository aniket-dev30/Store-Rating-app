import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const StarRating = ({ value, onChange, readonly = false }) => (
  <div className="stars">
    {[1,2,3,4,5].map(s => (
      <span
        key={s}
        className={`star ${s <= value ? 'filled' : ''} ${readonly ? '' : ''}`}
        style={{ cursor: readonly ? 'default' : 'pointer', fontSize: readonly ? '0.9rem' : '1.4rem' }}
        onClick={() => !readonly && onChange && onChange(s)}
      >★</span>
    ))}
  </div>
);

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sort, setSort] = useState({ field: 'name', order: 'ASC' });
  const [ratingStore, setRatingStore] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const fetchStores = useCallback(() => {
    api.get('/stores', { params: { ...filters, sortBy: sort.field, order: sort.order } })
      .then(res => setStores(res.data.stores))
      .catch(() => toast.error('Failed to fetch stores'))
      .finally(() => setLoading(false));
  }, [filters, sort]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  const openRating = (store) => {
    setRatingStore(store);
    setSelectedRating(store.user_rating || 0);
  };

  const submitRating = async () => {
    if (!selectedRating) { toast.warning('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await api.post(`/stores/${ratingStore.id}/ratings`, { rating: selectedRating });
      toast.success(ratingStore.user_rating ? 'Rating updated!' : 'Rating submitted!');
      setRatingStore(null);
      fetchStores();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally { setSubmitting(false); }
  };


  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Stores</h1>
          <p className="page-subtitle">Discover and rate stores on the platform</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="filters-row" style={{ marginBottom: 0 }}>
          <div className="filter-field">
            <label>Store Name</label>
            <input type="text" placeholder="Search by name…" value={filters.name}
              onChange={e => setFilters({ ...filters, name: e.target.value })} />
          </div>
          <div className="filter-field">
            <label>Address</label>
            <input type="text" placeholder="Search by address…" value={filters.address}
              onChange={e => setFilters({ ...filters, address: e.target.value })} />
          </div>
          <div className="filter-field">
            <label>Sort By</label>
            <select value={sort.field} onChange={e => setSort({ ...sort, field: e.target.value })}>
              <option value="name">Name</option>
              <option value="address">Address</option>
              <option value="avg_rating">Rating</option>
            </select>
          </div>
          <div className="filter-field" style={{ maxWidth: 90, alignSelf: 'flex-end' }}>
            <button className="btn btn-secondary" style={{ width: '100%' }}
              onClick={() => setSort(s => ({ ...s, order: s.order === 'ASC' ? 'DESC' : 'ASC' }))}>
              {sort.order === 'ASC' ? '↑ ASC' : '↓ DESC'}
            </button>
          </div>
          <div className="filter-field" style={{ maxWidth: 90, alignSelf: 'flex-end' }}>
            <button className="btn btn-secondary" style={{ width: '100%' }}
              onClick={() => setFilters({ name: '', address: '' })}>Clear</button>
          </div>
        </div>
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        stores.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🏪</div><div className="empty-state-text">No stores found</div></div>
        ) : (
          <div className="stores-grid">
            {stores.map(store => (
              <div key={store.id} className="store-card">
                <div className="store-card-header">
                  <div>
                    <div className="store-card-name">{store.name}</div>
                    <div className="store-card-address">📍 {store.address || 'Address not provided'}</div>
                  </div>
                </div>
                <div className="store-card-rating">
                  <span className="rating-value">{Number(store.avg_rating).toFixed(1)}</span>
                  <StarRating value={Math.round(store.avg_rating)} readonly />
                </div>
                <div className="user-rating-section">
                  <div className="user-rating-label">Your Rating</div>
                  {store.user_rating ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <StarRating value={store.user_rating} readonly />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>({store.user_rating}/5)</span>
                      <button className="btn btn-sm btn-secondary" onClick={() => openRating(store)}>Modify</button>
                    </div>
                  ) : (
                    <button className="btn btn-sm btn-primary" onClick={() => openRating(store)}>+ Rate this store</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {ratingStore && (
        <div className="modal-overlay" onClick={() => setRatingStore(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{ratingStore.user_rating ? 'Update Rating' : 'Rate Store'}</h2>
              <button className="modal-close" onClick={() => setRatingStore(null)}>×</button>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{ratingStore.name}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-3)' }}>📍 {ratingStore.address || '—'}</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ marginBottom: '0.75rem', color: 'var(--text-3)', fontSize: '0.875rem' }}>Select your rating</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {[1,2,3,4,5].map(s => (
                  <span key={s} onClick={() => setSelectedRating(s)}
                    style={{ fontSize: '2.5rem', cursor: 'pointer', color: s <= selectedRating ? 'var(--gold)' : '#ddd', transition: 'all 0.15s', transform: s <= selectedRating ? 'scale(1.1)' : 'scale(1)' }}>★</span>
                ))}
              </div>
              {selectedRating > 0 && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-2)', fontWeight: 500 }}>
                  {['','Poor','Fair','Good','Very Good','Excellent'][selectedRating]} ({selectedRating}/5)
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setRatingStore(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitRating} disabled={submitting || !selectedRating}>
                {submitting ? 'Submitting…' : ratingStore.user_rating ? 'Update' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
