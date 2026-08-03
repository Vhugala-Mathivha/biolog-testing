import React, { useState } from 'react';
import DashboardSidebar from '../../../components/DashboardSidebar';
import DashboardHeader from '../../../components/DashboardHeader';
import FormField from '../../../components/FormField';
import Button from '../../../components/Button';
import { HouseIcon, MultipleUsersIcon, GearIcon, CameraIcon } from '../../../components/Icons';
import { changePassword, updateProfile } from '../../../api';
import '../../../components/DashboardLayout.css';
import '../../SettingsPage.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: HouseIcon, path: '/admin/dashboard' },
  { label: 'Register Employee', icon: MultipleUsersIcon, path: '/admin/register-employee' },
  {
    label: 'Start Session',
    activeLabel: 'Stop Session',
    icon: CameraIcon,
    path: '/admin/scanner',
    sessionToggle: true,
    exitPath: '/admin/settings',
  },
  { label: 'Settings', icon: GearIcon, path: '/admin/settings' },
];

function AdminSettings({ onLogout, user }) {
  const [activeTab, setActiveTab] = useState('profile');

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

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
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, fullName }));
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
    <div className="dashboard-page">
      <DashboardSidebar navItems={NAV_ITEMS} onLogout={onLogout} />
      <main className="dashboard-main">
        <DashboardHeader title="Admin Settings" roleLabel="System Admin" fullName={user?.fullName || 'Admin'} />

        <div className="settings-tabs">
          <button className={`settings-tab${activeTab === 'profile' ? ' active' : ''}`} onClick={() => setActiveTab('profile')}>Profile</button>
          <button className={`settings-tab${activeTab === 'password' ? ' active' : ''}`} onClick={() => setActiveTab('password')}>Change Password</button>
        </div>

        {activeTab === 'profile' && (
          <form className="settings-form" onSubmit={handleProfileUpdate}>
            {profileMsg && <div className="auth-success">{profileMsg}</div>}
            {profileError && <div className="auth-error">{profileError}</div>}
            <FormField label="Full Name" name="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" required />
            <Button type="submit" disabled={profileLoading} className="settings-submit-btn">
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        )}

        {activeTab === 'password' && (
          <form className="settings-form" onSubmit={handlePasswordChange}>
            {passwordMsg && <div className="auth-success">{passwordMsg}</div>}
            {passwordError && <div className="auth-error">{passwordError}</div>}
            <FormField label="Current Password" type="password" name="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" required />
            <FormField label="New Password" type="password" name="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" required />
            <FormField label="Confirm New Password" type="password" name="confirmNewPassword" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password" required />
            <Button type="submit" disabled={passwordLoading} className="settings-submit-btn">
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        )}
      </main>
    </div>
  );
}

export default AdminSettings;
