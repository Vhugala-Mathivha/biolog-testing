import React, { useState } from 'react';
import AuthSidebar from '../../../components/AuthSidebar';
import FormField from '../../../components/FormField';
import Button from '../../../components/Button';
import Hyperlink from '../../../components/Hyperlink';
import { UserIcon, LockIcon } from '../../../components/Icons';
import { login } from '../../../api';
import '../AuthPage.css';

function Login({ onLogin }) {
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
    <div className="auth-page">
      <AuthSidebar />
      <div className="auth-page-content">
        <div className="auth-page-inner">
          <h1 className="auth-heading">Welcome back</h1>
          <p className="auth-subheading">Sign in to continue to BioLog</p>

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
              label="Password"
              icon={LockIcon}
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              required
            />

            <div className="auth-forgot-row">
              <Hyperlink to="/forgot-password">Forgot Password?</Hyperlink>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <Button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? 'Signing In...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
