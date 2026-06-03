import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStores from './pages/admin/AdminStores';
import UserDashboard from './pages/user/UserDashboard';
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ChangePassword from './pages/ChangePassword';
import Layout from './components/common/Layout';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
  return <Navigate to="/stores" replace />;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<RoleRedirect />} />

        {/* Admin */}
        <Route path="/admin" element={<PrivateRoute roles={['admin']}><Layout /></PrivateRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="stores" element={<AdminStores />} />
          <Route path="password" element={<ChangePassword />} />
        </Route>

        {/* User */}
        <Route path="/stores" element={<PrivateRoute roles={['user']}><Layout /></PrivateRoute>}>
          <Route index element={<UserDashboard />} />
        </Route>
        <Route path="/user/password" element={<PrivateRoute roles={['user']}><Layout><ChangePassword /></Layout></PrivateRoute>} />

        {/* Owner */}
        <Route path="/owner" element={<PrivateRoute roles={['store_owner']}><Layout /></PrivateRoute>}>
          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="password" element={<ChangePassword />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="colored" />
  </AuthProvider>
);

export default App;
