import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import AdminSettings from './AdminSettings';
import RegisterEmployee from './RegisterEmployee';
// Import the scanner component (assuming you name it AttendanceScanner)
import AttendanceScanner from './AttendanceScanner'; 
import { getEmployees, deleteEmployee, promoteToHr } from './api';

function AdminDashboard({ onLogout, user }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activePage === 'dashboard') {
      fetchEmployees();
    }
  }, [activePage]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      setError('Failed to load employees. Please try again.');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (empNo) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await deleteEmployee(empNo);
      setEmployees(employees.filter(e => e.employeeNumber !== empNo));
    } catch (err) {
      alert('Failed to delete employee.');
    }
  };

  const handlePromoteToHr = async (empNo) => {
    if (!window.confirm(`Promote employee ${empNo} to HR? They will receive an invite to set their password.`)) return;
    try {
      await promoteToHr(empNo);
      alert('HR invite sent! The employee can now activate their account via Set Password.');
      fetchEmployees();
    } catch (err) {
      alert(err.data || 'Failed to promote employee.');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    (emp.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  // Inline styles for the new session button to ensure colors match your request
  const sessionBtnStyle = {
    backgroundColor: activePage === 'session' ? '#dc3545' : '#28a745',
    color: 'white',
    marginTop: '10px',
    borderRadius: '8px',
    padding: '10px'
  };

  if (activePage === 'settings') {
    return (
      <div className="admin-dashboard">
        <div className="admin-sidebar">
          <h2>BioLog Admin</h2>
          <ul>
            <li className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}>
              <span className="icon">📊</span> Dashboard
            </li>
            <li className={activePage === 'register' ? 'active' : ''} onClick={() => setActivePage('register')}>
              <span className="icon">➕</span> Register
            </li>
            {/* Added Session Button */}
            <li style={sessionBtnStyle} onClick={() => setActivePage(activePage === 'session' ? 'dashboard' : 'session')}>
              <span className="icon">⏱</span> {activePage === 'session' ? 'Stop Session' : 'Start Session'}
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
              <span className="user-name">{user?.fullName || 'Admin'}</span>
              <span className="user-role">{user?.role || 'Superadmin'}</span>
            </div>
          </div>
        </div>
        <div className="admin-main-content">
          <AdminSettings />
        </div>
      </div>
    );
  }

  if (activePage === 'register') {
    return (
      <div className="admin-dashboard">
        <div className="admin-sidebar">
          <h2>BioLog Admin</h2>
          <ul>
            <li className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}>
              <span className="icon">📊</span> Dashboard
            </li>
            <li className={activePage === 'register' ? 'active' : ''} onClick={() => setActivePage('register')}>
              <span className="icon">➕</span> Register
            </li>
             {/* Added Session Button */}
             <li style={sessionBtnStyle} onClick={() => setActivePage(activePage === 'session' ? 'dashboard' : 'session')}>
              <span className="icon">⏱</span> {activePage === 'session' ? 'Stop Session' : 'Start Session'}
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
              <span className="user-name">{user?.fullName || 'Admin'}</span>
              <span className="user-role">{user?.role || 'Superadmin'}</span>
            </div>
          </div>
        </div>
        <div className="admin-main-content">
          <RegisterEmployee onRegisterComplete={fetchEmployees} />
        </div>
      </div>
    );
  }

  // NEW: View for the Attendance Scanner
  if (activePage === 'session') {
    return (
      <div className="admin-dashboard">
        <div className="admin-sidebar">
          <h2>BioLog Admin</h2>
          <ul>
            <li className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}>
              <span className="icon">📊</span> Dashboard
            </li>
            <li className={activePage === 'register' ? 'active' : ''} onClick={() => setActivePage('register')}>
              <span className="icon">➕</span> Register
            </li>
             {/* Added Session Button */}
             <li style={sessionBtnStyle} onClick={() => setActivePage('dashboard')}>
              <span className="icon">🛑</span> Stop Session
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
              <span className="user-name">{user?.fullName || 'Admin'}</span>
              <span className="user-role">{user?.role || 'Superadmin'}</span>
            </div>
          </div>
        </div>
        <div className="admin-main-content">
          {/* This will open your Facial Recognition Clock-in Page */}
          <AttendanceScanner /> 
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <h2>BioLog Admin</h2>
        <ul>
          <li className={activePage === 'dashboard' ? 'active' : ''} onClick={() => setActivePage('dashboard')}>
            <span className="icon">📊</span> Dashboard
          </li>
          <li className={activePage === 'register' ? 'active' : ''} onClick={() => setActivePage('register')}>
            <span className="icon">➕</span> Register
          </li>
          {/* Added Session Button */}
          <li style={sessionBtnStyle} onClick={() => setActivePage('session')}>
              <span className="icon">⏱</span> Start Session
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
            <span className="user-name">{user?.fullName || 'Admin'}</span>
            <span className="user-role">{user?.role || 'Superadmin'}</span>
          </div>
        </div>
      </div>
      <div className="admin-main-content">
        <h1>Admin Dashboard</h1>

        {/* Summary Cards */}
        <div className="admin-summary-cards">
          <div className="admin-card total">
            <h3>Total Employees</h3>
            <p className="card-value">{employees.length}</p>
          </div>
          <div className="admin-card active">
            <h3>Active</h3>
            <p className="card-value">{employees.filter(e => e.isActive).length}</p>
          </div>
          <div className="admin-card hr">
            <h3>HR Admins</h3>
            <p className="card-value">{employees.filter(e => e.portalRole === 'HR' || e.portalRole === 'Superadmin').length}</p>
          </div>
          <div className="admin-card pending">
            <h3>Pending Invites</h3>
            <p className="card-value">{employees.filter(e => e.portalRole === 'Pending').length}</p>
          </div>
        </div>

        {/* Employee Table */}
        <div className="admin-employee-list">
          <div className="employee-list-header">
            <h2>All Employees</h2>
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search by name, number or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading employees...</div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchEmployees}>Retry</button>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Employee Info</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Portal Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">No employees found</td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp, index) => (
                    <tr key={emp.employeeNumber || index}>
                      <td>
                        <div className="employee-info">
                          <span className="emp-name">{emp.firstName} {emp.lastName}</span>
                          <span className="emp-number">{emp.employeeNumber}</span>
                        </div>
                      </td>
                      <td>
                        <div className="contact-info">
                          {emp.email && <span className="emp-email">{emp.email}</span>}
                          {emp.contactNumber && <span className="emp-phone">{emp.contactNumber}</span>}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${emp.isActive ? 'active' : 'inactive'}`}>
                          {emp.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <span className={`role-badge ${(emp.portalRole || '').toLowerCase()}`}>
                          {emp.portalRole || 'Employee'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {emp.portalRole !== 'HR' && emp.portalRole !== 'Superadmin' && (
                            <button className="promote-btn" onClick={() => handlePromoteToHr(emp.employeeNumber)} title="Promote to HR">
                              👑
                            </button>
                          )}
                          <button className="delete-btn" onClick={() => handleDelete(emp.employeeNumber)} title="Delete">
                            🗑️
                          </button>
                        </div>
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

export default AdminDashboard;