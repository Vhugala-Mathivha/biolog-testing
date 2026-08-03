import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../../components/DashboardSidebar';
import DashboardHeader from '../../../components/DashboardHeader';
import { HouseIcon, MultipleUsersIcon, GearIcon, EditIcon, BinIcon, CameraIcon } from '../../../components/Icons';
import { getEmployees, deleteEmployee, updateEmployee, promoteToHr } from '../../../api';
import EditEmployeeModal from './EditEmployeeModal';
import '../../../components/DashboardLayout.css';
import './AdminDashboard.css';

const PAGE_SIZE = 6;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: HouseIcon, path: '/admin/dashboard' },
  { label: 'Register Employee', icon: MultipleUsersIcon, path: '/admin/register-employee' },
  { label: 'Start Session', icon: CameraIcon, path: '/admin/scanner' },
  { label: 'Settings', icon: GearIcon, path: '/admin/settings' },
];

function AdminDashboard({ onLogout, user }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [editingEmployee, setEditingEmployee] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEmployees();
      setEmployees(data.filter((e) => e.employeeNumber !== user?.employeeNumber));
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
      setEmployees((prev) => prev.filter((e) => e.employeeNumber !== empNo));
    } catch (err) {
      alert('Failed to delete employee.');
    }
  };

  const handleSaveEdit = async (empNo, updates) => {
    const { promoteToHr: shouldPromote, ...rest } = updates;
    await updateEmployee(empNo, rest);
    if (shouldPromote) {
      await promoteToHr(empNo);
    }
    setEditingEmployee(null);
    fetchEmployees();
  };

  const totalEntries = employees.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const windowStart = Math.min(Math.max(currentPage - 1, 1), Math.max(totalPages - 3, 1));
  const windowEnd = Math.min(windowStart + 3, totalPages);
  const pageNumbers = [];
  for (let p = windowStart; p <= windowEnd; p += 1) pageNumbers.push(p);

  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageRows = employees.slice(pageStart, pageStart + PAGE_SIZE);
  const showingTo = Math.min(pageStart + PAGE_SIZE, totalEntries);

  return (
    <div className="dashboard-page">
      <DashboardSidebar navItems={NAV_ITEMS} onLogout={onLogout} />
      <main className="dashboard-main">
        <DashboardHeader
          title="Employee Management"
          roleLabel="System Admin"
          fullName={user?.fullName || 'Admin'}
        />

        <div className="admin-total-row">
          <span className="admin-total-label">Total Employees</span>
          <span className="admin-total-count">{totalEntries}</span>
        </div>

        {loading ? (
          <div className="dash-state-msg">Loading employees...</div>
        ) : error ? (
          <div className="dash-state-msg">
            {error} <button className="app-hyperlink-button app-hyperlink" onClick={fetchEmployees}>Retry</button>
          </div>
        ) : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Employee Number</th>
                    <th>Name</th>
                    <th>Surname</th>
                    <th>Phone Number</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr><td colSpan="7" className="admin-no-data">No employees found</td></tr>
                  ) : (
                    pageRows.map((emp) => (
                      <tr key={emp.employeeNumber}>
                        <td>{emp.employeeNumber}</td>
                        <td>{emp.firstName}</td>
                        <td>{emp.lastName}</td>
                        <td>{emp.contactNumber || '--'}</td>
                        <td>{emp.email || '--'}</td>
                        <td>{emp.portalRole || 'Employee'}</td>
                        <td>
                          <div className="admin-action-icons">
                            <button className="admin-icon-btn" onClick={() => setEditingEmployee(emp)} aria-label="Edit">
                              <EditIcon />
                            </button>
                            <button className="admin-icon-btn" onClick={() => handleDelete(emp.employeeNumber)} aria-label="Delete">
                              <BinIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination-row">
              <span className="admin-pagination-info">
                Showing {totalEntries === 0 ? 0 : pageStart + 1} to {showingTo} of {totalEntries} entries
              </span>
              <div className="admin-pagination-controls">
                <button
                  className="admin-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setPage(currentPage - 1)}
                >
                  &lt;
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    className={`admin-page-btn${p === currentPage ? ' active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="admin-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage(currentPage + 1)}
                >
                  &gt;
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
