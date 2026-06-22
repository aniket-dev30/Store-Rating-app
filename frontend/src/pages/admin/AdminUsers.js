import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
const initialForm = { name: '', email: '', password: '', address: '', role: 'user' };

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ field: 'name', order: 'ASC' });
  const [showModal, setShowModal] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = { ...filters, sortBy: sort.field, order: sort.order };
    api.get('/admin/users', { params })
      .then(res => setUsers(res.data.users))
      .catch(() => toast.error('Failed to fetch users'))
      .finally(() => setLoading(false));
  }, [filters, sort]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSort = (field) => {
    setSort(s => ({ field, order: s.field === field && s.order === 'ASC' ? 'DESC' : 'ASC' }));
  };

  const viewDetail = async (id) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setDetailUser(res.data.user);
    } catch { toast.error('Failed to load user details'); }
  };

  const validateForm = () => {
    const e = {};
    if (!form.name) e.name = 'Required';
    else if (form.name.length < 20) e.name = 'Min 20 characters';
    else if (form.name.length > 60) e.name = 'Max 60 characters';
    if (!form.email) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Required';
    else if (!passwordRegex.test(form.password)) e.password = '8-16 chars, 1 uppercase, 1 special char';
    if (form.address && form.address.length > 400) e.address = 'Max 400 characters';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      await api.post('/admin/users', form);
      toast.success('User created successfully!');
      setShowModal(false);
      setForm(initialForm);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally { setSaving(false); }
  };

  const sortIcon = (field) => sort.field === field ? (sort.order === 'ASC' ? ' ↑' : ' ↓') : '';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage all platform users</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setForm(initialForm); setFormErrors({}); }}>
          + Add User
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
          <div className="filter-field">
            <label>Role</label>
            <select value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>
          <div className="filter-field" style={{ maxWidth: 100, alignSelf: 'flex-end' }}>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setFilters({ name: '', email: '', address: '', role: '' })}>Clear</button>
          </div>
        </div>

        {loading ? <div className="loading-center"><div className="spinner" /></div> : (
          users.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-text">No users found</div></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {[['name','Name'],['email','Email'],['address','Address'],['role','Role']].map(([f,l]) => (
                      <th key={f} onClick={() => handleSort(f)}>{l}<span className="sort-icon">{sortIcon(f)}</span></th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.address || '—'}</td>
                      <td><span className={`badge badge-${u.role}`}>{u.role.replace('_', ' ')}</span></td>
                      <td><button className="btn btn-sm btn-secondary" onClick={() => viewDetail(u.id)}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New User</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} noValidate>
              <div className="form-group">
                <label className="form-label">Full Name</label>
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
                <label className="form-label">Password</label>
                <input type="password" className={`form-input ${formErrors.password ? 'error' : ''}`}
                  placeholder="8-16 chars, 1 uppercase, 1 special" value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })} />
                {formErrors.password && <div className="form-error">{formErrors.password}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea className={`form-input ${formErrors.address ? 'error' : ''}`}
                  rows={2} value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })} style={{ resize: 'vertical' }} />
                {formErrors.address && <div className="form-error">{formErrors.address}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="user">Normal User</option>
                  <option value="admin">Administrator</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailUser && (
        <div className="modal-overlay" onClick={() => setDetailUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">User Details</h2>
              <button className="modal-close" onClick={() => setDetailUser(null)}>×</button>
            </div>
            {[['Name', detailUser.name], ['Email', detailUser.email], ['Address', detailUser.address || '—'], ['Role', detailUser.role]].map(([l, v]) => (
              <div key={l} className="detail-row">
                <span className="detail-label">{l}</span>
                <span className="detail-value">{l === 'Role' ? <span className={`badge badge-${v}`}>{v.replace('_',' ')}</span> : v}</span>
              </div>
            ))}
            {detailUser.role === 'store_owner' && detailUser.stores?.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Stores</div>
                {detailUser.stores.map(s => (
                  <div key={s.id} style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>⭐ {s.avg_rating} avg rating</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
