import React, { useState } from 'react';
import './Register.css';
import { registerEmployee } from './api';

function Register({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    idNumber: '',
    position: '',
    department: '',
    contactNumber: '',
    email: '',
    gender: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await registerEmployee(formData);
      setSuccess(`Employee ${result.employeeNumber} registered successfully!`);
      setFormData({
        employeeNumber: '',
        firstName: '',
        lastName: '',
        idNumber: '',
        position: '',
        department: '',
        contactNumber: '',
        email: '',
        gender: '',
      });
    } catch (err) {
      setError(err.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-left">
        <div className="branding">
          <h1>BioLog</h1>
          <p className="tagline">Employee Attendance Management System</p>
        </div>
        <div className="register-illustration">
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Register new employees</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Manage employee records</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Track attendance easily</span>
            </div>
          </div>
        </div>
      </div>
      <div className="register-right">
        <form className="register-form" onSubmit={handleSubmit}>
          <h2>Register Employee</h2>
          <p className="form-subtitle">Fill in the employee details below</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="employeeNumber">Employee Number *</label>
              <input
                type="text"
                id="employeeNumber"
                name="employeeNumber"
                value={formData.employeeNumber}
                onChange={handleChange}
                placeholder="e.g. EMP007"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="idNumber">ID Number *</label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder="South African ID number"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="position">Position</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="e.g. Software Developer"
              />
            </div>
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Engineering"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                type="tel"
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                placeholder="e.g. 071 234 5678"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="employee@company.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              {/* Empty for spacing */}
            </div>
          </div>

          <button type="submit" className="register-button" disabled={loading}>
            {loading ? 'Registering...' : 'Register Employee'}
          </button>

          <button type="button" className="back-button" onClick={onBackToLogin}>
            ← Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;