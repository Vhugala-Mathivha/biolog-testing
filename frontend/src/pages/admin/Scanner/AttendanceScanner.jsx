import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import DashboardSidebar from '../../../components/DashboardSidebar';
import { HouseIcon, MultipleUsersIcon, GearIcon, CameraIcon } from '../../../components/Icons';
import { getEmployees } from '../../../api';
import '../../../components/DashboardLayout.css';
import './AttendanceScanner.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5101';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: HouseIcon, path: '/admin/dashboard' },
  { label: 'Register Employee', icon: MultipleUsersIcon, path: '/admin/register-employee' },
  { label: 'Start Session', icon: CameraIcon, path: '/admin/scanner' },
  { label: 'Settings', icon: GearIcon, path: '/admin/settings' },
];

// Minimum time between logging any message (success OR error) for the same
// face, so a continuously-unrecognised face doesn't spam the screen.
const MESSAGE_COOLDOWN_MS = 4000;

function AttendanceScanner({ onLogout }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const lastMessageTimeRef = useRef(0);

  const [faceMatcher, setFaceMatcher] = useState(null);
  const [status, setStatus] = useState('Initializing System...');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [lastMessage, setLastMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' | 'error'

  const startCamera = useCallback(async () => {
    if (streamRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((error) => console.warn('Video play interrupted:', error));
        };
      }
    } catch (err) {
      console.error('Camera Error:', err);
      setStatus('Camera Error: Access Denied');
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        const MODEL_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model';
        setStatus('Loading AI Engine...');
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);

        setStatus('Syncing Employee Database...');
        const employees = await getEmployees();
        const labeledDescriptors = [];

        for (const emp of employees) {
          let v = emp.faceVector || emp.facevector || emp.FaceVector || emp.face_vector || emp.vector;
          if (!v) continue;

          if (typeof v === 'string') {
            try {
              v = JSON.parse(v);
            } catch (e) {
              v = v.replace(/[[\]\s]/g, '').split(',').map(Number);
            }
          }

          if (Array.isArray(v) && v.length === 128) {
            const id = (emp.employeeNumber || emp.employeenumber || emp.EmployeeNumber || 'Unknown').toString();
            try {
              labeledDescriptors.push(new faceapi.LabeledFaceDescriptors(id, [new Float32Array(v)]));
            } catch (err) {
              console.error('Error creating descriptor for', id, err);
            }
          }
        }

        if (labeledDescriptors.length > 0) {
          setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.5));
          setStatus('SCANNER ACTIVE');
          startCamera();
        } else {
          setStatus(`Sync Error: Found ${employees.length} employees, but no valid biometrics.`);
          startCamera();
        }
      } catch (err) {
        console.error('Initialization Failed:', err);
        setStatus('System Offline.');
      }
    };
    initialize();

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  const showMessage = (text, type) => {
    const now = Date.now();
    if (now - lastMessageTimeRef.current < MESSAGE_COOLDOWN_MS) return;
    lastMessageTimeRef.current = now;
    setMessageType(type);
    setLastMessage(text);
    setTimeout(() => setLastMessage(''), MESSAGE_COOLDOWN_MS);
  };

  const handleVideoPlay = () => {
    if (scanIntervalRef.current) return;

    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !faceMatcher || !modelsLoaded) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) return;

      const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
      if (bestMatch.label !== 'unknown') {
        processClocking(detection.descriptor);
      } else {
        // A face is visible but doesn't match any registered employee -
        // surface this instead of silently doing nothing.
        showMessage('Face not recognized. Please try again or contact HR.', 'error');
      }
    }, 700);
  };

  const processClocking = async (capturedVector) => {
    const now = Date.now();
    if (window.lastScanTime && now - window.lastScanTime < 15000) return;
    window.lastScanTime = now;

    try {
      const response = await fetch(`${API_URL}/api/attendance/identify-and-clock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vector: Array.from(capturedVector) }),
      });

      if (response.ok) {
        const result = await response.json();
        showMessage(`Welcome ${result.name}!`, 'success');
      } else if (response.status === 404) {
        showMessage('Face verification failed: no matching employee found.', 'error');
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('Server returned error:', response.status, errorText);
        showMessage(`Face verification failed. Server error (${response.status}). Please try again.`, 'error');
      }
    } catch (err) {
      console.error('Identification error:', err);
      showMessage('Face verification failed: could not reach the server. Check your connection.', 'error');
    }
  };

  return (
    <div className="dashboard-page">
      <DashboardSidebar navItems={NAV_ITEMS} onLogout={onLogout} />
      <main className="dashboard-main attendance-scanner-container">
        <div className="scanner-header">
          <div className={`status-pill ${modelsLoaded ? 'online' : 'loading'}`}>{status}</div>
        </div>

        <div className="scanner-kiosk">
          <div className="video-wrap">
            <video ref={videoRef} autoPlay muted onPlay={handleVideoPlay} playsInline />
            <div className="face-oval" />
          </div>

          {lastMessage && (
            <div className={`scan-overlay ${messageType}`}>{lastMessage}</div>
          )}
        </div>

        <div className="scanner-footer">
          <p>Position face within the circle for automatic logging.</p>
        </div>
      </main>
    </div>
  );
}

export default AttendanceScanner;
