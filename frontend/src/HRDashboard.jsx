import React, { useState, useEffect } from 'react';
import './HRDashboard.css';
import HRSettings from './HRSettings';
import { getHrDashboardSummary, getEmployeeHistory } from './api';

function HRDashboard({ onLogout, user }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHrDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalEmployees = summary?.totalEmployees || 0;
  const presentCount = summary?.presentCount || 0;
  const lateCount = summary?.lateCount || 0;
  const absentCount = summary?.absentCount || 0;

  const employees = summary?.employees || [];

  const filteredEmployees = employees.filter(emp =>
    (emp.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewReport = async (employee) => {
    try {
      const history = await getEmployeeHistory(employee.employeeNumber);
      const historyText = history.map(h =>
        `${h.status} - Clock In: ${h.clockInTime ? new Date(h.clockInTime).toLocaleTimeString() : '-'}, Clock Out: ${h.clockOutTime ? new Date(h.clockOutTime).toLocaleTimeString() : '-'}, Duration: ${h.duration || '-'}`
      ).join('\n');
      alert(`Report for ${employee.fullName} (${employee.employeeNumber}):\n\n${historyText || 'No history available.'}`);
    } catch (err) {
      alert(`Failed to load report for ${employee.fullName}.`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '-';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (activePage === 'settings') {
    return (
      <div className="hr-dashboard">
        <div className="sidebar">
          <h2>BioLog</h2>
          <ul>
            <li className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}>
              <span className="icon">📊</span> Dashboard
            </li>
            <li className={activePage === 'settings' ? 'active' : ''} onClick={() => setActivePage('settings')}>
              <span className="icon">⚙️</span> Settings
            </li>
            <li className="logout" onClick={handleLogout}>
              <span className="icon">🚪</span> Logout
            </li>
          </ul>
          <div className="sidebar-user">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <span className="user-name">HR Admin</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
        </div>
        <div className="main-content">
          <HRSettings />
        </div>
      </div>
    );
  }

  return (
    <div className="hr-dashboard">
      <div className="sidebar">
        <h2>BioLog</h2>
        <ul>
          <li className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}>
            <span className="icon">📊</span> Dashboard
          </li>
          <li className={activePage === 'settings' ? 'active' : ''} onClick={() => setActivePage('settings')}>
            <span className="icon">⚙️</span> Settings
          </li>
            <li className="logout" onClick={handleLogout}>
              <span className="icon">🚪</span> Logout
            </li>
          </ul>
          <div className="sidebar-user">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <span className="user-name">HR Admin</span>
              <span className="user-role">Administrator</span>
            </div>
          </div>
      </div>
      <div className="main-content">
        <h1>HR Dashboard</h1>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="card total">
            <h3>Total Employees</h3>
            <p className="card-value">{totalEmployees}</p>
          </div>
          <div className="card present">
            <h3>Present</h3>
            <p className="card-value">{presentCount}</p>
          </div>
          <div className="card late">
            <h3>Late</h3>
            <p className="card-value">{lateCount}</p>
          </div>
          <div className="card absent">
            <h3>Absent</h3>
            <p className="card-value">{absentCount}</p>
          </div>
        </div>

        {/* Employee List */}
        <div className="employee-list">
          <div className="employee-list-header">
            <h2>Employee Attendance</h2>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or employee number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {loading ? (
            <div className="loading-state">Loading dashboard data...</div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchDashboardData}>Retry</button>
            </div>
          ) : (
          <table>
            <thead>
              <tr>
                <th>Employee Info</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No employees found</td>
                </tr>
              ) : (
              filteredEmployees.map((emp, index) => (
                <tr key={emp.employeeNumber || index}>
                  <td>
                    <div className="employee-info">
                      <span className="emp-name">{emp.fullName}</span>
                      <span className="emp-number">{emp.employeeNumber}</span>
                    </div>
                  </td>
                  <td>{formatTime(emp.clockInTime)}</td>
                  <td>{formatTime(emp.clockOutTime)}</td>
                  <td>
                    <span className={`status-badge ${(emp.status || '').toLowerCase()}`}>
                      {emp.status || 'Unknown'}
                    </span>
                  </td>
                  <td>{emp.duration || '-'}</td>
                  <td>
                    <button className="view-btn" onClick={() => handleViewReport(emp)}>View</button>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default HRDashboard;