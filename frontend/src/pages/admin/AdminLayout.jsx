import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './Dashboard/AdminDashboard.css';

// Sidebar chrome shared by every /admin/* page. The actual page content
// (Dashboard / Register Employee / Settings / Scanner) renders via <Outlet />.
function AdminLayout({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const onScannerPage = location.pathname.startsWith('/admin/scanner');

  // Inline styles preserved from the original single-file AdminDashboard
  // (kept as-is for this reorg pass; will move into AdminDashboard.css
  // during the styling pass).
  const sessionBtnStyle = {
    backgroundColor: onScannerPage ? '#dc3545' : '#28a745',
    color: 'white',
    marginTop: '10px',
    borderRadius: '8px',
    padding: '10px',
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>BioLog Admin</h2>
        <ul>
          <li>
            <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="icon">📊</span> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/register-employee" className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="icon">➕</span> Register
            </NavLink>
          </li>
          {/* Start/Stop Session toggles into the face scanner route */}
          <li style={sessionBtnStyle} onClick={() => navigate(onScannerPage ? '/admin' : '/admin/scanner')}>
            <span className="icon">{onScannerPage ? '🛑' : '⏱'}</span>{' '}
            {onScannerPage ? 'Stop Session' : 'Start Session'}
          </li>
          <li>
            <NavLink to="/admin/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="icon">⚙️</span> Settings
            </NavLink>
          </li>
          <li className="logout" onClick={handleLogout}>
            <span className="icon">🚪</span> Logout
          </li>
        </ul>
        <div className="sidebar-user">
          <div className="user-avatar">👤</div>
          <div className="user-details">
            <span className="user-name">{user?.fullName || 'Admin'}</span>
            <span className="user-role">{user?.role || 'Superadmin'}</span>
          </div>
        </div>
      </div>
      <div className="admin-main-content">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
