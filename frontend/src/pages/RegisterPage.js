import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;
const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Name is required';
    else if (form.name.length < 20) e.name = 'Name must be at least 20 characters';
    else if (form.name.length > 60) e.name = 'Name cannot exceed 60 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (!passwordRegex.test(form.password)) e.password = 'Password must be 8-16 chars with 1 uppercase and 1 special character';
    if (form.address && form.address.length > 400) e.address = 'Address cannot exceed 400 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      toast.success('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <div className="auth-logo">
          <h1>Store<span>Rate</span></h1>
          <p>Create your account</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name (min 20 characters)"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            {errors.name ? <div className="form-error">{errors.name}</div> : <div className="form-hint">{form.name.length}/60 chars (min 20)</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="8-16 chars, 1 uppercase, 1 special char"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
            {errors.password ? <div className="form-error">{errors.password}</div> : <div className="form-hint">8-16 chars with uppercase and special character</div>}
          </div>
          <div className="form-group">
            <label className="form-label">Address <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              className={`form-input ${errors.address ? 'error' : ''}`}
              placeholder="Your address"
              rows={2}
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              style={{ resize: 'vertical' }}
            />
            {errors.address && <div className="form-error">{errors.address}</div>}
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <div className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
