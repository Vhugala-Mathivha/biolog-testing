import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './Dashboard/HRDashboard.css';

// Sidebar chrome shared by every /hr/* page. The actual page content
// (Dashboard / Settings) renders via <Outlet />.
function HRLayout({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="hr-dashboard">
      <div className="sidebar">
        <h2>BioLog</h2>
        <ul>
          <li>
            <NavLink to="/hr" end className={({ isActive }) => (isActive ? 'active' : '')}>
              <span className="icon">📊</span> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/hr/settings" className={({ isActive }) => (isActive ? 'active' : '')}>
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
            <span className="user-name">HR Admin</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
      </div>
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}

export default HRLayout;
