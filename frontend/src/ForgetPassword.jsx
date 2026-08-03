import React, { useState } from 'react';
import './ForgetPassword.css';
import { setPassword } from './api';

function ForgetPassword({ onBackToLogin }) {
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
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      const result = await setPassword(employeeNumber, idNumber, password, confirmPassword);
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
    <div className="forgot-container">
      <div className="forgot-left">
        <div className="branding">
          <h1>BioLog</h1>
          <p className="tagline">Employee Attendance Management System</p>
        </div>
        <div className="forgot-illustration">
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">🔑</span>
              <span>Set or reset your password</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Verify with your ID number</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Secure account activation</span>
            </div>
          </div>
        </div>
      </div>
      <div className="forgot-right">
        <form className="forgot-form" onSubmit={handleSubmit}>
          <h2>Set Password</h2>
          <p className="form-subtitle">Activate your account or reset your password</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-group">
            <label htmlFor="employeeNumber">Employee Number</label>
            <input
              type="text"
              id="employeeNumber"
              value={employeeNumber}
              onChange={(e) => setEmployeeNumber(e.target.value)}
              placeholder="Enter your employee number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="idNumber">ID Number</label>
            <input
              type="text"
              id="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="Enter your South African ID number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              required
            />
          </div>

          <button type="submit" className="forgot-submit-button" disabled={loading}>
            {loading ? 'Setting Password...' : 'Set Password'}
          </button>

          <button type="button" className="forgot-back-button" onClick={onBackToLogin}>
            ← Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgetPassword;