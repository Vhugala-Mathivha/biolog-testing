import React, { useState } from 'react';
import './Login.css';
import { login } from './api';

function Login({ onLogin, onForgotPassword }) {
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(employeeNumber, password);
      // Store token and user info
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify({
        employeeNumber: result.employeeNumber,
        fullName: result.fullName,
        role: result.role,
      }));
      onLogin(result);
    } catch (err) {
      setError(err.data || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="branding">
          <img src="/1.png" alt="BioLog Logo" className="brand-logo" />
          <h1>BioLog</h1>
          <p className="tagline">Employee Attendance Management System</p>
        </div>
        <div className="login-illustration">
          <div className="feature-list">
            <div className="feature-item">
              <img src="/2.png" alt="Clock In" className="feature-icon-img" />
              <span>Easy clock-in and clock-out tracking</span>
            </div>
            <div className="feature-item">
              <img src="/3.png" alt="Face Recognition" className="feature-icon-img" />
              <span>Secure face recognition technology</span>
            </div>
            <div className="feature-item">
              <img src="/4.png" alt="Reports" className="feature-icon-img" />
              <span>Real-time attendance reports</span>
            </div>
            <div className="feature-item">
              <img src="/5.png" alt="Management" className="feature-icon-img" />
              <span>Employee management dashboard</span>
            </div>
            <div className="feature-item">
              <img src="/6.png" alt="Analytics" className="feature-icon-img" />
              <span>Advanced analytics and insights</span>
            </div>
          </div>
        </div>
      </div>
      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Welcome!!</h2>
          <p className="form-subtitle">Sign in to your account</p>
          <div className="form-group">
            <label htmlFor="employeeNumber">Employee Number</label>
            <div className="input-wrapper">
              <img src="/7.png" alt="" className="input-icon-img" />
              <input
                type="text"
                id="employeeNumber"
                value={employeeNumber}
                onChange={(e) => setEmployeeNumber(e.target.value)}
                placeholder="Enter your employee number"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <img src="/8.png" alt="" className="input-icon-img" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="forgot-password">
              <button type="button" className="forgot-link" onClick={onForgotPassword}>Forgot Password?</button>
            </div>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;