import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const initialForm = { name: '', email: '', address: '', owner_id: '' };

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '' });
  const [sort, setSort] = useState({ field: 'name', order: 'ASC' });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchStores = useCallback(() => {
    setLoading(true);
    api.get('/admin/stores', { params: { ...filters, sortBy: sort.field, order: sort.order } })
      .then(res => setStores(res.data.stores))
      .catch(() => toast.error('Failed to fetch stores'))
      .finally(() => setLoading(false));
  }, [filters, sort]);

  useEffect(() => { fetchStores(); }, [fetchStores]);

  useEffect(() => {
    api.get('/admin/users', { params: { role: 'store_owner' } })
      .then(res => setOwners(res.data.users))
      .catch(() => {});
  }, []);

  const handleSort = (field) => {
    setSort(s => ({ field, order: s.field === field && s.order === 'ASC' ? 'DESC' : 'ASC' }));
  };

  const validateForm = () => {
    const e = {};
    if (!form.name) e.name = 'Required';
    else if (form.name.length < 20) e.name = 'Min 20 characters';
    else if (form.name.length > 60) e.name = 'Max 60 characters';
    if (!form.email) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (form.address && form.address.length > 400) e.address = 'Max 400 characters';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      await api.post('/admin/stores', { ...form, owner_id: form.owner_id || undefined });
      toast.success('Store created successfully!');
      setShowModal(false);
      setForm(initialForm);
      fetchStores();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create store');
    } finally { setSaving(false); }
  };

  const sortIcon = (field) => sort.field === field ? (sort.order === 'ASC' ? ' ↑' : ' ↓') : '';

  const StarDisplay = ({ rating }) => (
    <div className="stars">
      {[1,2,3,4,5].map(s => <span key={s} className={`star star-display ${s <= Math.round(rating) ? 'filled' : ''}`}>★</span>)}
      <span style={{ marginLeft: '0.25rem', fontSize: '0.8rem', color: 'var(--text-3)' }}>{Number(rating).toFixed(1)}</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Stores</h1>
          <p className="page-subtitle">Manage all registered stores</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(initialForm); setFormErrors({}); }}>
          + Add Store
        </button>
      </div>

      <div className="card">
        <div className="filters-row">
          {['name','email','address'].map(f => (
            <div key={f} className="filter-field">
              <label>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
              <input type="text" placeholder={`Filter by ${f}…`} value={filters[f]}
                onChange={e => setFilters({ ...filters, [f]: e.target.value })} />
            </div>
          ))}
          <div className="filter-field" style={{ maxWidth: 100, alignSelf: 'flex-end' }}>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setFilters({ name: '', email: '', address: '' })}>Clear</button>
          </div>
        </div>

        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          stores.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">🏪</div><div className="empty-state-text">No stores found</div></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {[['name','Name'],['email','Email'],['address','Address'],['avg_rating','Rating']].map(([f,l]) => (
                      <th key={f} onClick={() => handleSort(f)}>{l}<span className="sort-icon">{sortIcon(f)}</span></th>
                    ))}
                    <th>Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 500 }}>{s.name}</td>
                      <td>{s.email}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.address || '—'}</td>
                      <td><StarDisplay rating={s.avg_rating} /></td>
                      <td>{s.owner_name || <span style={{ color: 'var(--text-3)' }}>—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Store</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} noValidate>
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input type="text" className={`form-input ${formErrors.name ? 'error' : ''}`}
                  placeholder="Min 20 characters" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
                {formErrors.name && <div className="form-error">{formErrors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className={`form-input ${formErrors.email ? 'error' : ''}`}
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                {formErrors.email && <div className="form-error">{formErrors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className={`form-input ${formErrors.address ? 'error' : ''}`}
                  rows={2} value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })} style={{ resize: 'vertical' }} />
                {formErrors.address && <div className="form-error">{formErrors.address}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Store Owner <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
                <select className="form-select" value={form.owner_id}
                  onChange={e => setForm({ ...form, owner_id: e.target.value })}>
                  <option value="">No owner assigned</option>
                  {owners.map(o => <option key={o.id} value={o.id}>{o.name} ({o.email})</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create Store'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStores;
