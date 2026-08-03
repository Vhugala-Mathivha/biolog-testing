import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/auth/Login/Login';
import ForgotPassword from './pages/auth/ForgotPassword/ForgotPassword';
import AdminDashboard from './pages/admin/Dashboard/AdminDashboard';
import RegisterEmployee from './pages/admin/RegisterEmployee/RegisterEmployee';
import AdminSettings from './pages/admin/Settings/AdminSettings';
import AttendanceScanner from './pages/admin/Scanner/AttendanceScanner';
import HRDashboard from './pages/hr/Dashboard/HRDashboard';
import HRSettings from './pages/hr/Settings/HRSettings';

function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function homePathFor(user) {
  return user?.role === 'Superadmin' ? '/admin/dashboard' : '/hr/dashboard';
}

/** Redirects to /login if not authenticated, or home if role doesn't match. */
function ProtectedRoute({ user, allow, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(user.role)) return <Navigate to={homePathFor(user)} replace />;
  return children;
}

function App() {
  const [user, setUser] = useState(getStoredUser);

  const handleLogin = (userData) => {
    setUser({
      employeeNumber: userData.employeeNumber,
      fullName: userData.fullName,
      role: userData.role,
    });
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to={homePathFor(user)} replace /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/forgot-password"
          element={user ? <Navigate to={homePathFor(user)} replace /> : <ForgotPassword />}
        />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute user={user} allow={['Superadmin']}>
            <AdminDashboard onLogout={handleLogout} user={user} />
          </ProtectedRoute>
        } />
        <Route path="/admin/register-employee" element={
          <ProtectedRoute user={user} allow={['Superadmin']}>
            <RegisterEmployee onLogout={handleLogout} user={user} />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute user={user} allow={['Superadmin']}>
            <AdminSettings onLogout={handleLogout} user={user} />
          </ProtectedRoute>
        } />
        <Route path="/admin/scanner" element={
          <ProtectedRoute user={user} allow={['Superadmin']}>
            <AttendanceScanner onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/hr/dashboard" element={
          <ProtectedRoute user={user} allow={['HR']}>
            <HRDashboard onLogout={handleLogout} user={user} />
          </ProtectedRoute>
        } />
        <Route path="/hr/settings" element={
          <ProtectedRoute user={user} allow={['HR']}>
            <HRSettings onLogout={handleLogout} user={user} />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to={user ? homePathFor(user) : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
