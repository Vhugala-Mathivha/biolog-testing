import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BioLogLogo, LogoutIcon } from './Icons';
import './DashboardSidebar.css';

/**
 * navItems: [{ label, icon: Component, path }]
 * Shared by AdminDashboard's sidebar and HRDashboard's sidebar
 * (Styling Part 2.2).
 */
function DashboardSidebar({ navItems, onLogout }) {
  const navigate = useNavigate();

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
