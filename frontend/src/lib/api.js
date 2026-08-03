const API_URL = import.meta.env.VITE_API_URL || 'https://biolog-face-recognition.onrender.com';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.text();
    } catch {
      errorData = null;
    }
    throw new ApiError(
      errorData || `Request failed with status ${response.status}`,
      response.status,
      errorData
    );
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
}

// Auth API
export async function login(employeeNumber, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ employeeNumber, password }),
  });
}

export async function setPassword(employeeNumber, idNumber, password, confirmPassword) {
  return request('/api/auth/set-password', {
    method: 'POST',
    body: JSON.stringify({ employeeNumber, idNumber, password, confirmPassword }),
  });
}

export async function changePassword(currentPassword, newPassword, confirmNewPassword) {
  return request('/api/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword, confirmNewPassword }),
  });
}

export async function updateProfile(fullName) {
  return request('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify({ fullName }),
  });
}

// Employees API
export async function getEmployees() {
  return request('/api/employees');
}

export async function getEmployee(empNo) {
  return request(`/api/employees/${empNo}`);
}

export async function registerEmployee(employeeData) {
  return request('/api/employees/register', {
    method: 'POST',
    body: JSON.stringify(employeeData),
  });
}

export async function updateEmployee(empNo, employeeData) {
  return request(`/api/employees/${empNo}`, {
    method: 'PUT',
    body: JSON.stringify(employeeData),
  });
}

export async function deleteEmployee(empNo) {
  return request(`/api/employees/${empNo}`, {
    method: 'DELETE',
  });
}

export async function promoteToHr(empNo) {
  return request(`/api/employees/${empNo}/promote-to-hr`, {
    method: 'POST',
  });
}

// Attendance API
export async function clockIn(empNo) {
  return request(`/api/attendance/clock-in/${empNo}`, {
    method: 'POST',
  });
}

export async function clockOut(empNo) {
  return request(`/api/attendance/clock-out/${empNo}`, {
    method: 'POST',
  });
}

export async function getAttendanceHistory(empNo) {
  return request(`/api/attendance/${empNo}`);
}

export async function getHoursWorked(empNo) {
  return request(`/api/attendance/hours-worked/${empNo}`);
}

// Reports API
export async function getHrDashboardSummary(date) {
  const params = date ? `?date=${date}` : '';
  return request(`/api/reports/hr-summary${params}`);
}

export async function getEmployeeHistory(empNo, from, to) {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const query = params.toString();
  return request(`/api/reports/hr-summary/${empNo}${query ? `?${query}` : ''}`);
}

export async function getOrganisationReport() {
  return request('/api/reports/organisation');
}

// Face recognition
export async function setFaceVector(empNo, vector) {
  return request(`/api/employees/${empNo}/face-vector`, {
    method: 'POST',
    body: JSON.stringify({ vector }),
  });
}

export async function verifyFace(empNo, vector, threshold = 0.85) {
  return request(`/api/employees/${empNo}/verify-face`, {
    method: 'POST',
    body: JSON.stringify({ vector, threshold }),
  });
}

// Health check
export async function healthCheck() {
  return request('/api/health');
}

export { ApiError };
export default {
  login,
  setPassword,
  changePassword,
  updateProfile,
  getEmployees,
  getEmployee,
  registerEmployee,
  updateEmployee,
  deleteEmployee,
  promoteToHr,
  clockIn,
  clockOut,
  getAttendanceHistory,
  getHoursWorked,
  getHrDashboardSummary,
  getEmployeeHistory,
  getOrganisationReport,
  healthCheck,
};