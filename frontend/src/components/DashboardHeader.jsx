import React from 'react';
import { ProfileIcon } from './Icons';
import './DashboardHeader.css';

function DashboardHeader({ title, subheading, roleLabel, fullName }) {
  return (
    <div className="dash-header">
      <div className="dash-header-row">
        <h1 className="dash-header-title">{title}</h1>
        <div className="dash-header-profile">
          <ProfileIcon className="dash-header-profile-icon" />
          <div className="dash-header-profile-text">
            <span className="dash-header-role">{roleLabel}</span>
            <span className="dash-header-name">{fullName}</span>
          </div>
        </div>
      </div>
      {subheading && <p className="dash-header-subheading">{subheading}</p>}
    </div>
  );
}

export default DashboardHeader;
