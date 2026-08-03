import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../../../components/DashboardSidebar';
import DashboardHeader from '../../../components/DashboardHeader';
import Button from '../../../components/Button';
import { HouseIcon, GearIcon } from '../../../components/Icons';
import { getEmployeeAttendanceReport, downloadEmployeeAttendanceReport } from '../../../api';
import '../../../components/DashboardLayout.css';
import './Report.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: HouseIcon, path: '/hr/dashboard' },
  { label: 'Settings', icon: GearIcon, path: '/hr/settings' },
];

function Report({ onLogout, user }) {
  const { empNo } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    if (!empNo) {
      setError('No employee selected. Please go back to the dashboard and choose an employee.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    const fetchReport = async () => {
      try {
        const data = await getEmployeeAttendanceReport(empNo);
        if (!cancelled) setReport(data);
      } catch (err) {
        if (!cancelled) {
          setError(err?.data || err?.message || 'Failed to load the attendance report. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReport();

    return () => {
      cancelled = true;
    };
  }, [empNo]);

  const handleDownload = async () => {
    if (!empNo) return;
    setDownloading(true);
    setDownloadError('');
    try {
      await downloadEmployeeAttendanceReport(empNo);
    } catch (err) {
      setDownloadError(err?.data || err?.message || 'Failed to download the report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const formatTimeOnly = (timestamp) => {
    if (!timestamp) return '--:--';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatReportPeriod = () => {
    if (!report) return '';
    return `${report.fromDate || '--'} to ${report.toDate || '--'}`;
  };

  const history = report?.history || [];
  const totalDays = history.length;
  const presentDays = history.filter((h) => h.status === 'Present').length;
  const lateDays = history.filter((h) => h.status === 'Late').length;
  const absentDays = history.filter((h) => h.status === 'Absent').length;

  return (
    <div className="dashboard-page">
      <DashboardSidebar navItems={NAV_ITEMS} onLogout={onLogout} />
      <main className="dashboard-main">
        <DashboardHeader title="Employee Attendance Report" roleLabel="HR Manager" fullName={user?.fullName || 'HR Admin'} />

        {loading ? (
          <div className="report-state-msg">Loading attendance report...</div>
        ) : error ? (
          <div className="report-state-msg report-error">
            <p>{error}</p>
            <button className="app-hyperlink-button app-hyperlink" onClick={() => navigate('/hr/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        ) : report ? (
          <div className="report-container">
            <div className="report-header">
              <h2 className="report-title">Attendance Report for {report.fullName}</h2>
              <p className="report-subtitle">
                Employee No: {report.employeeNumber} &nbsp;|&nbsp; Department: {report.department || '-'}
                &nbsp;|&nbsp; Position: {report.position || '-'}
              </p>
              <p className="report-period">Report Period: {formatReportPeriod()}</p>
            </div>

            {/* Summary cards */}
            <div className="report-summary-row">
              <div className="report-summary-card">
                <span className="report-summary-label">Total Days</span>
                <span className="report-summary-value">{totalDays}</span>
              </div>
              <div className="report-summary-card">
                <span className="report-summary-label">Present</span>
                <span className="report-summary-value">{presentDays}</span>
              </div>
              <div className="report-summary-card">
                <span className="report-summary-label">Late</span>
                <span className="report-summary-value">{lateDays}</span>
              </div>
              <div className="report-summary-card">
                <span className="report-summary-label">Absent</span>
                <span className="report-summary-value">{absentDays}</span>
              </div>
            </div>

            {/* Attendance records */}
            <div className="admin-table-wrap report-table-wrap">
              <table className="admin-table report-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="admin-no-data">No attendance records found for this period.</td>
                    </tr>
                  ) : (
                    history.map((entry, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{entry.clockInTime ? new Date(entry.clockInTime).toLocaleDateString() : '-'}</td>
                        <td>{formatTimeOnly(entry.clockInTime)}</td>
                        <td>{formatTimeOnly(entry.clockOutTime)}</td>
                        <td>{entry.duration || '--:--'}</td>
                        <td>
                          <span className={`status-pill status-${(entry.status || '').toLowerCase()}`}>
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {downloadError && <div className="report-download-error">{downloadError}</div>}

            <div className="report-actions">
              <Button className="report-download-btn" onClick={handleDownload} disabled={downloading}>
                {downloading ? 'Downloading...' : 'Download Report'}
              </Button>
              <Button className="report-back-btn" onClick={() => navigate('/hr/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default Report;