import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import DashboardSidebar from '../../../components/DashboardSidebar';
import DashboardHeader from '../../../components/DashboardHeader';
import FormField from '../../../components/FormField';
import Button from '../../../components/Button';
import { HouseIcon, MultipleUsersIcon, GearIcon, UserIcon, CardIcon, CameraIcon } from '../../../components/Icons';
import { registerEmployee, setFaceVector } from '../../../api';
import '../../../components/DashboardLayout.css';
import './RegisterEmployee.css';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: HouseIcon, path: '/admin/dashboard' },
  { label: 'Register Employee', icon: MultipleUsersIcon, path: '/admin/register-employee' },
  {
    label: 'Start Session',
    activeLabel: 'Stop Session',
    icon: CameraIcon,
    path: '/admin/scanner',
    sessionToggle: true,
    exitPath: '/admin/register-employee',
  },
  { label: 'Settings', icon: GearIcon, path: '/admin/settings' },
];

const EMPTY_FORM = {
  employeeNumber: '', firstName: '', lastName: '', idNumber: '',
  position: '', department: '', contactNumber: '', email: '', gender: '',
  faceVector: null,
};

function RegisterEmployee({ onLogout, user }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error('Face models failed to load:', err);
        setError('AI Engine failed to initialize. Please check your internet connection.');
      }
    };
    loadModels();
  }, []);

  const goToScanPage = useCallback(async () => {
    setShowScanner(true);
    setScanStatus('Initializing camera...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 300);
    } catch (err) {
      setScanStatus('Camera error: Please check permissions.');
      setShowScanner(false);
    }
  }, []);

  const stopScannerAndReturn = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowScanner(false);
  }, []);

  const handleVideoPlay = async () => {
    if (!modelsLoaded) return;
    setScanStatus('Looking for face...');
    const scanInterval = setInterval(async () => {
      if (!videoRef.current || !showScanner) {
        clearInterval(scanInterval);
        return;
      }
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setScanStatus('Face Captured Successfully!');
        const descriptorArray = Array.from(detection.descriptor);
        setFormData((prev) => ({ ...prev, faceVector: descriptorArray }));
        clearInterval(scanInterval);
        setTimeout(() => stopScannerAndReturn(), 1500);
      }
    }, 1000);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCancel = () => setFormData(EMPTY_FORM);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await registerEmployee(formData);
      const empNo = result.employeeNumber || formData.employeeNumber;

      if (formData.faceVector) {
        try {
          await setFaceVector(empNo, formData.faceVector);
        } catch (faceErr) {
          console.warn('Face vector upload failed:', faceErr);
        }
      }

      setSuccess(`Employee ${empNo} registered successfully!`);
      setFormData(EMPTY_FORM);
    } catch (err) {
      setError(err.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showScanner) {
    return (
      <div className="dashboard-page">
        <DashboardSidebar navItems={NAV_ITEMS} onLogout={onLogout} />
        <main className="dashboard-main face-scanner-page">
          <h1 className="dash-header-title">Face Registration</h1>
          <p className="dash-header-subheading">Please position your face inside the circle</p>
          <div className="video-wrapper">
            <video ref={videoRef} autoPlay muted playsInline onPlay={handleVideoPlay} className="scanner-video" />
            <div className="face-guide-overlay" />
          </div>
          <div className="scanner-status">{scanStatus}</div>
          <Button variant="secondary" onClick={stopScannerAndReturn}>Return to Form</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <DashboardSidebar navItems={NAV_ITEMS} onLogout={onLogout} />
      <main className="dashboard-main">
        <DashboardHeader
          title="Register New Employee"
          subheading="Fill in the details to register a new employee"
          roleLabel="System Admin"
          fullName={user?.fullName || 'Admin'}
        />

        {error && <div className="auth-error reg-message">{error}</div>}
        {success && <div className="auth-success reg-message">{success}</div>}

        <form className="reg-employee-form" onSubmit={handleSubmit}>
          <div className="reg-row">
            <FormField label="Employee Number" icon={UserIcon} name="employeeNumber" value={formData.employeeNumber} onChange={handleChange} placeholder="Enter Employee Number" required />
          </div>

          <div className="reg-row">
            <FormField label="First Name" icon={UserIcon} name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Enter First Name" required />
            <FormField label="Last Name" icon={UserIcon} name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Enter Last Name" required />
          </div>

          <div className="reg-row">
            <FormField label="ID Number" icon={CardIcon} name="idNumber" value={formData.idNumber} onChange={handleChange} placeholder="Enter ID Number" required />
            <FormField label="Role" icon={CardIcon} name="position" value={formData.position} onChange={handleChange} placeholder="Enter Role" />
          </div>

          <div className="reg-row">
            <FormField label="Department" name="department" value={formData.department} onChange={handleChange} placeholder="Enter Department" />
            <FormField label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="Enter Contact Number" />
          </div>

          <div className="reg-row reg-row-triple">
            <FormField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter Email" />
            <FormField as="select" label="Gender" name="gender" value={formData.gender} onChange={handleChange}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </FormField>

            <div className="face-vector-field">
              <label className="form-field-label">Face Vector (Biometrics)</label>
              {!formData.faceVector ? (
                <button type="button" className="capture-face-btn" onClick={goToScanPage}>
                  <CameraIcon />
                  <span>Capture Face</span>
                </button>
              ) : (
                <div className="capture-face-btn face-captured">
                  <span>Face Captured</span>
                  <button type="button" className="app-hyperlink app-hyperlink-button" onClick={() => setFormData((p) => ({ ...p, faceVector: null }))}>Rescan</button>
                </div>
              )}
              <p className="face-vector-hint">Use camera to capture employee's face</p>
            </div>
          </div>

          <div className="reg-actions">
            <Button variant="secondary" type="button" onClick={handleCancel}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</Button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default RegisterEmployee;
