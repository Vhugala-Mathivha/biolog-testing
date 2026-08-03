import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { BioLogLogo, LogoutIcon } from './Icons';
import './DashboardSidebar.css';

/**
 * navItems: [{ label, icon: Component, path }]
 * Shared by AdminDashboard's sidebar and HRDashboard's sidebar
 * (Styling Part 2.2).
 */
function DashboardSidebar({ navItems, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const onScannerPage = location.pathname === '/admin/scanner';

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <aside className="dash-sidebar">
      <div className="dash-brand-row">
        <BioLogLogo className="dash-brand-logo" />
        <span className="dash-brand-text">BioLog</span>
      </div>

      <nav className="dash-nav">
        {navItems.map((item, index) => (
          item.path === '/admin/scanner' ? (
            <button
              key={item.path}
              type="button"
              className={`dash-nav-item dash-session-toggle ${onScannerPage ? 'stop' : 'start'}${index === navItems.length - 1 ? ' no-border' : ''}`}
              onClick={() => navigate(onScannerPage ? '/admin/dashboard' : '/admin/scanner')}
            >
              <item.icon className="dash-nav-icon" />
              <span>{onScannerPage ? 'Stop Session' : 'Start Session'}</span>
            </button>
          ) : (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `dash-nav-item${isActive ? ' active' : ''}${index === navItems.length - 1 ? ' no-border' : ''}`
              }
            >
              <item.icon className="dash-nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          )
        ))}
      </nav>

      <button type="button" className="dash-logout-btn" onClick={handleLogout}>
        <LogoutIcon className="dash-nav-icon" />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default DashboardSidebar;
