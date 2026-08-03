import React, { useState } from 'react';
import AuthSidebar from '../../../components/AuthSidebar';
import FormField from '../../../components/FormField';
import Button from '../../../components/Button';
import BackButton from '../../../components/BackButton';
import { UserIcon, LockIcon } from '../../../components/Icons';
import { setPassword as setPasswordRequest } from '../../../api';
import '../AuthPage.css';

function ForgotPassword() {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const result = await setPasswordRequest(employeeNumber, idNumber, password, confirmPassword);
      setSuccess(result.message || 'Password set successfully! You can now log in.');
      setEmployeeNumber('');
      setIdNumber('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.data || 'Failed to set password. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AuthSidebar />
      <div className="auth-page-content">
        <BackButton to="/login" />
        <div className="auth-page-inner">
          <h1 className="auth-heading">Reset your password</h1>
          <p className="auth-subheading">Verify your identity to reset password</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <FormField
              label="Employee Number"
              icon={UserIcon}
              name="employeeNumber"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              placeholder="Enter Employee Number"
              required
            />
            <FormField
              label="ID Number"
              icon={UserIcon}
              name="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Enter ID Number"
              required
            />
            <FormField
              label="New Password"
              icon={LockIcon}
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter New Password"
              required
            />
            <FormField
              label="Confirm Password"
              icon={LockIcon}
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
            />

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <Button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
