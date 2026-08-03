import React, { useState } from 'react';
import './AdminSettings.css';
import { changePassword, updateProfile } from './api';

function AdminSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Profile state
  const [fullName, setFullName] = useState(user.fullName || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setProfileLoading(true);
    try {
      const result = await updateProfile(fullName);
      const updatedUser = { ...user, fullName };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfileMsg(result.message || 'Profile updated successfully.');
    } catch (err) {
      setProfileError(err.data || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const result = await changePassword(currentPassword, newPassword, confirmNewPassword);
      setPasswordMsg(result.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(err.data || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="admin-settings-container">
      <h1>Settings</h1>

      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`settings-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Change Password
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="settings-panel">
          <h2>Profile Information</h2>
          {profileMsg && <div className="success-message">{profileMsg}</div>}
          {profileError && <div className="error-message">{profileError}</div>}
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label>Employee Number</label>
              <input type="text" value={user.employeeNumber || ''} disabled className="disabled-input" />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" value={user.role || ''} disabled className="disabled-input" />
            </div>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <button type="submit" className="settings-btn" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="settings-panel">
          <h2>Change Password</h2>
          {passwordMsg && <div className="success-message">{passwordMsg}</div>}
          {passwordError && <div className="error-message">{passwordError}</div>}
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
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
                placeholder="Enter new password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmNewPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
            <button type="submit" className="settings-btn" disabled={passwordLoading}>
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminSettings;