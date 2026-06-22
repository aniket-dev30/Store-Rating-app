import React, { useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
const ChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required';
    if (!form.newPassword) e.newPassword = 'New password is required';
    else if (!passwordRegex.test(form.newPassword)) e.newPassword = 'Password must be 8-16 chars with 1 uppercase and 1 special character';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.patch('/auth/password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Update your account password</p>
        </div>
      </div>
      <div className="card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input type="password" className={`form-input ${errors.currentPassword ? 'error' : ''}`}
              value={form.currentPassword} onChange={e => setForm({ ...form, currentPassword: e.target.value })} />
            {errors.currentPassword && <div className="form-error">{errors.currentPassword}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input type="password" className={`form-input ${errors.newPassword ? 'error' : ''}`}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} />
            {errors.newPassword ? <div className="form-error">{errors.newPassword}</div> : <div className="form-hint">8-16 chars with at least one uppercase letter and one special character</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input type="password" className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
            {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
