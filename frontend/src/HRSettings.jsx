import React, { useState } from 'react';
import './HRSettings.css';

function HRSettings() {
  const [activeTab, setActiveTab] = useState('updateInfo');

  // Update Information state
  const [name, setName] = useState('HR Admin');
  const [email, setEmail] = useState('hradmin@company.com');
  const [phone, setPhone] = useState('+27 12 345 6789');

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateInfo = (e) => {
    e.preventDefault();
    alert('Information updated successfully!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    alert('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="settings-container">
      <h1>Settings</h1>

      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'updateInfo' ? 'active' : ''}`}
          onClick={() => setActiveTab('updateInfo')}
        >
          Update Information
        </button>
        <button
          className={`tab ${activeTab === 'changePassword' ? 'active' : ''}`}
          onClick={() => setActiveTab('changePassword')}
        >
          Change Password
        </button>
      </div>

      {activeTab === 'updateInfo' && (
        <div className="settings-section">
          <h2>Update Information</h2>
          <form onSubmit={handleUpdateInfo} className="settings-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="save-btn">Save Changes</button>
          </form>
        </div>
      )}

      {activeTab === 'changePassword' && (
        <div className="settings-section">
          <h2>Change Password</h2>
          <form onSubmit={handleChangePassword} className="settings-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="save-btn">Change Password</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default HRSettings;