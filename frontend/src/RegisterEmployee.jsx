import React, { useState, useRef, useEffect, useCallback } from 'react';
import './RegisterEmployee.css';
import { registerEmployee, setFaceVector } from './api';
import * as faceapi from 'face-api.js';

function RegisterEmployee({ onRegisterComplete }) {
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
    faceVector: null,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  
  // Scanner Logic States
  const [showScanner, setShowScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // 1. Load AI Models from a stable CDN to avoid local file corruption errors
  useEffect(() => {
    const loadModels = async () => {
      try {
        // Using a reliable CDN for the raw weights
        const MODEL_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model'; 
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        
        setModelsLoaded(true);
        console.log("Tiny Face AI Models Loaded Successfully");
      } catch (err) {
        console.error('Face models failed to load:', err);
        setError("AI Engine failed to initialize. Please check your internet connection.");
      }
    };
    loadModels();
  }, []);

  // 2. Navigation to the separate Face Scan "Page"
  const goToScanPage = useCallback(async () => {
    setShowScanner(true);
    setScanStatus("Initializing camera...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: "user" } 
      });
      streamRef.current = stream;
      // Attach stream after the view has switched
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 300);
    } catch (err) {
      setScanStatus("Camera error: Please check permissions.");
      setShowScanner(false);
    }
  }, []);

  const stopScannerAndReturn = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowScanner(false);
  }, []);

  // 3. Automated Scanning Logic (Using TinyFaceDetectorOptions)
  const handleVideoPlay = async () => {
    if (!modelsLoaded) return;

    setScanStatus("Looking for face...");
    const scanInterval = setInterval(async () => {
      if (!videoRef.current || !showScanner) {
        clearInterval(scanInterval);
        return;
      }

      // Detection using the Tiny Face Detector to prevent "tensor shape" errors
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setScanStatus("Face Captured Successfully!");
        
        // Convert the 128-float descriptor to a standard array for Postgres
        const descriptorArray = Array.from(detection.descriptor);
        
        // Save to formData for registration
        setFormData(prev => ({ ...prev, faceVector: descriptorArray }));
        
        clearInterval(scanInterval);
        // Automatically return to the form after 1.5 seconds
        setTimeout(() => {
          stopScannerAndReturn();
        }, 1500);
      }
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Step A: Register the basic employee data
      const result = await registerEmployee(formData);
      const empNo = result.employeeNumber || formData.employeeNumber;

      // Step B: Send the face vector if it exists
      if (formData.faceVector) {
        try {
          await setFaceVector(empNo, formData.faceVector);
        } catch (faceErr) {
          console.warn('Face vector upload failed:', faceErr);
        }
      }

      setSuccess(`Employee ${empNo} registered successfully!`);
      // Reset form
      setFormData({
        employeeNumber: '', firstName: '', lastName: '', idNumber: '',
        position: '', department: '', contactNumber: '', email: '', gender: '',
        faceVector: null,
      });
      if (onRegisterComplete) onRegisterComplete();
    } catch (err) {
      setError(err.data || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-employee-container">
      {!showScanner ? (
        /* MAIN FORM PAGE */
        <>
          <h1>Register Employee</h1>
          <p className="form-subtitle">Fill in the employee details below</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="register-employee-form">
            <div className="form-row">
              <div className="form-group">
                <label>Employee Number *</label>
                <input type="text" name="employeeNumber" value={formData.employeeNumber} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>ID Number *</label>
                <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Position</label>
                <input type="text" name="position" value={formData.position} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Contact Number</label>
                <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              
              <div className="face-scan-section">
                <label>Face Biometrics</label>
                <div className="face-scan-controls">
                  {!formData.faceVector ? (
                    <button type="button" className="scan-face-btn" onClick={goToScanPage}>
                      🔍 SCAN FACE
                    </button>
                  ) : (
                    <div className="face-success-msg">
                      <span>✅ Face Captured</span>
                      <button type="button" className="retake-btn" onClick={() => setFormData(prev => ({...prev, faceVector: null}))}>Rescan</button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="register-submit-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register Employee'}
            </button>
          </form>
        </>
      ) : (
        /* SEPARATE FACE SCAN PAGE */
        <div className="face-scanner-page">
          <div className="scanner-header">
            <h1>Face Registration</h1>
            <p>Please position your face inside the circle</p>
          </div>

          <div className="video-wrapper">
            <video ref={videoRef} autoPlay muted playsInline onPlay={handleVideoPlay} className="scanner-video" />
            <div className="face-guide-overlay"></div>
          </div>

          <div className="scanner-status">
            {scanStatus}
          </div>

          <button type="button" className="cancel-scan-btn" onClick={stopScannerAndReturn}>
            Return to Form
          </button>
        </div>
      )}
    </div>
  );
}

export default RegisterEmployee;