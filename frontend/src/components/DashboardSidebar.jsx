import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { BioLogLogo, LogoutIcon } from './Icons';
import './DashboardSidebar.css';

/**
 * navItems: [{ label, activeLabel?, icon: Component, path, sessionToggle? }]
 * Shared by AdminDashboard's sidebar and HRDashboard's sidebar.
 *
 * For a `sessionToggle` item (e.g. "Start/Stop Session"):
 *   - When NOT on the item's path: renders a green "Start Session" button.
 *   - When ON the item's path: renders a red "Stop Session" button, and
 *     clicking it navigates away, which unmounts the scanner so its
 *     lifecycle cleanup reliably stops the camera and recognition loop.
 */
function DashboardSidebar({ navItems, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

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
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isLast = index === navItems.length - 1;

          if (item.sessionToggle) {
            // Session toggle: green "Start Session" normally,
            // red "Stop Session" when the scanner is open.
            const label = isActive ? item.activeLabel || item.label : item.label;

            const handleSessionClick = () => {
              if (isActive) {
                // Stop session -> navigate away from the scanner so the
                // component unmounts and its cleanup stops the camera
                // and recognition loop.
                navigate(item.exitPath || '/admin/dashboard');
              } else {
                // Start session -> open the face-recognition scanner page.
                navigate(item.path);
              }
            };

            return (
              <button
                key={item.path}
                type="button"
                onClick={handleSessionClick}
                className={`dash-nav-item session-nav-item${isActive ? ' session-running' : ''}${isLast ? ' no-border' : ''}`}
              >
                <item.icon className="dash-nav-icon" />
                <span>{label}</span>
              </button>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive: active }) =>
                `dash-nav-item${active ? ' active' : ''}${isLast ? ' no-border' : ''}`
              }
            >
              <item.icon className="dash-nav-icon" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button type="button" className="dash-logout-btn" onClick={handleLogout}>
        <LogoutIcon className="dash-nav-icon" />
        <span>Logout</span>
      </button>
    </aside>
  );
}

export default DashboardSidebar;