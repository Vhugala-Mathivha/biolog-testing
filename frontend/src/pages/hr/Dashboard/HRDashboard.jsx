import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../../../components/DashboardSidebar';
import DashboardHeader from '../../../components/DashboardHeader';
import Hyperlink from '../../../components/Hyperlink';
import { HouseIcon, GearIcon, MultipleUsersIcon, LateIcon, PresentIcon, AbsentIcon } from '../../../components/Icons';
import { getHrDashboardSummary } from '../../../api';
import '../../../components/DashboardLayout.css';
import './HRDashboard.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: HouseIcon, path: '/hr/dashboard' },
  { label: 'Settings', icon: GearIcon, path: '/hr/settings' },
];

const PREVIEW_ROWS = 6;

function HRDashboard({ onLogout, user }) {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

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
  const visibleRows = showAll ? employees : employees.slice(0, PREVIEW_ROWS);

  // "View" navigates to the dedicated employee attendance report page.
  const handleViewReport = (employee) => {
    navigate(`/hr/report/${encodeURIComponent(employee.employeeNumber)}`);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="dashboard-page">
      <DashboardSidebar navItems={NAV_ITEMS} onLogout={onLogout} />
      <main className="dashboard-main">
        <DashboardHeader title="Employee Management" roleLabel="HR Manager" fullName={user?.fullName || 'HR Admin'} />

        <div className="admin-total-row">
          <span className="admin-total-label">Total Employees</span>
          <span className="admin-total-count">{totalEmployees}</span>
        </div>

        {loading ? (
          <div className="dash-state-msg">Loading dashboard data...</div>
        ) : error ? (
          <div className="dash-state-msg">
            {error} <button className="app-hyperlink-button app-hyperlink" onClick={fetchDashboardData}>Retry</button>
          </div>
        ) : (
          <>
            <div className="hr-stat-blocks">
              <div className="hr-stat-block">
                <div className="hr-stat-top">
                  <span className="hr-stat-label">Total Employees</span>
                  <MultipleUsersIcon className="hr-stat-icon" />
                </div>
                <span className="hr-stat-value">{totalEmployees}</span>
              </div>
              <div className="hr-stat-block">
                <div className="hr-stat-top">
                  <span className="hr-stat-label">Late Today</span>
                  <LateIcon />
                </div>
                <span className="hr-stat-value">{lateCount}</span>
              </div>
              <div className="hr-stat-block">
                <div className="hr-stat-top">
                  <span className="hr-stat-label">Present Today</span>
                  <PresentIcon />
                </div>
                <span className="hr-stat-value">{presentCount}</span>
              </div>
              <div className="hr-stat-block">
                <div className="hr-stat-top">
                  <span className="hr-stat-label">Absent Today</span>
                  <AbsentIcon />
                </div>
                <span className="hr-stat-value">{absentCount}</span>
              </div>
            </div>

            <p className="hr-table-heading">Today's Attendance Overview</p>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.length === 0 ? (
                    <tr><td colSpan="6" className="admin-no-data">No employees found</td></tr>
                  ) : (
                    visibleRows.map((emp) => (
                      <tr key={emp.employeeNumber}>
                        <td>{emp.fullName}</td>
                        <td>{formatTime(emp.clockInTime)}</td>
                        <td>{formatTime(emp.clockOutTime)}</td>
                        <td>
                          <span className={`status-pill status-${(emp.status || '').toLowerCase()}`}>
                            {emp.status || 'Unknown'}
                          </span>
                        </td>
                        <td>{emp.duration || '--:--'}</td>
                        <td>
                          <Hyperlink onClick={() => handleViewReport(emp)}>view</Hyperlink>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {employees.length > PREVIEW_ROWS && (
              <div className="hr-view-all-row">
                <Hyperlink onClick={() => setShowAll((v) => !v)}>
                  {showAll ? 'Show less' : '< View all reports'}
                </Hyperlink>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default HRDashboard;
