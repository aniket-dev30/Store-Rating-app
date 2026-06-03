import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const navConfig = {
  admin: [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/stores', label: 'Stores', icon: '🏪' },
    { path: '/admin/password', label: 'Change Password', icon: '🔒' },
  ],
  user: [
    { path: '/stores', label: 'Browse Stores', icon: '🏪' },
    { path: '/user/password', label: 'Change Password', icon: '🔒' },
  ],
  store_owner: [
    { path: '/owner/dashboard', label: 'My Store', icon: '📈' },
    { path: '/owner/password', label: 'Change Password', icon: '🔒' },
  ],
};

const roleLabel = { admin: 'Administrator', user: 'Normal User', store_owner: 'Store Owner' };

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = navConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>Store<span>Rate</span></h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Rating Platform</p>
        </div>
        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink key={link.path} to={link.path} className={({ isActive }) => isActive ? 'active' : ''}>
              <span className="nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem' }}>
            <div className="topbar-avatar">{initials}</div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'white', lineHeight: 1.2 }}>{user?.name?.slice(0, 22)}{user?.name?.length > 22 ? '…' : ''}</div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>{roleLabel[user?.role]}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(233,69,96,0.15)', border: '1px solid rgba(233,69,96,0.3)', color: '#e94560', padding: '0.55rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, width: '100%', justifyContent: 'center' }}>
            🚪 Logout
          </button>
        </div>
      </aside>
      <div className="sidebar-with-margin" style={{ flex: 1, minWidth: 0 }}>
        <main className="main-content">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
