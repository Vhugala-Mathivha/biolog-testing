import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
// Added missing imports: getAttendanceHistory and clockOut
import { getEmployees, clockIn, clockOut, getAttendanceHistory } from './api'; 
import './AttendanceScanner.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5101';

function AttendanceScanner() {
  const videoRef = useRef(null);
  // ADDED: Missing streamRef declaration
  const streamRef = useRef(null); 
  
  const [faceMatcher, setFaceMatcher] = useState(null);
  const [status, setStatus] = useState("Initializing System...");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [recentScans, setRecentScans] = useState(new Map()); 
  const [lastMessage, setLastMessage] = useState("");

  // 1. Safe Camera Start Function
  const startCamera = useCallback(async () => {
    if (streamRef.current) return; // Don't start if already running

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: "user" } 
      });
      
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(error => console.warn("Video play interrupted:", error));
        };
      }
    } catch (err) {
      console.error("Camera Error:", err);
      setStatus("Camera Error: Access Denied");
    }
  }, []);

  // 2. Single Initialization Effect (Combined logic)
  useEffect(() => {
    const initialize = async () => {
  try {
    const MODEL_URL = 'https://raw.githubusercontent.com/vladmandic/face-api/master/model';
    
    setStatus("Loading AI Engine...");
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
    ]);
    setModelsLoaded(true);

    setStatus("Syncing Employee Database...");
    const employees = await getEmployees();
    
    // --- DIAGNOSTIC LOGS ---
    console.log("TOTAL EMPLOYEES FOUND:", employees.length);
    if (employees.length > 0) {
      console.log("FIRST EMPLOYEE KEYS:", Object.keys(employees[0]));
      console.log("SAMPLE DATA:", employees[0]);
    }

    const labeledDescriptors = [];

    for (const emp of employees) {
      // Look for the face data under ANY possible name
      let v = emp.faceVector || emp.facevector || emp.FaceVector || emp.face_vector || emp.vector;
      
      if (!v) continue;

      // Handle String vs Array format
      if (typeof v === 'string') {
        try {
          v = JSON.parse(v);
        } catch (e) {
          // Manual cleanup for string formatted vectors like "[0.1, 0.2...]"
          v = v.replace(/[\[\]\s]/g, '').split(',').map(Number);
        }
      }

      // Final check: Must be an array of 128 numbers
      if (Array.isArray(v) && v.length === 128) {
        const id = (emp.employeeNumber || emp.employeenumber || emp.EmployeeNumber || "Unknown").toString();
        
        try {
          labeledDescriptors.push(
            new faceapi.LabeledFaceDescriptors(id, [new Float32Array(v)])
          );
        } catch (err) {
          console.error("Error creating descriptor for", id, err);
        }
      }
    }

    if (labeledDescriptors.length > 0) {
      console.log("SUCCESSFULLY SYNCED FACES:", labeledDescriptors.length);
      setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.5));
      setStatus("SCANNER ACTIVE");
      startCamera();
    } else {
      // IF WE ARE HERE: The names above didn't match what the backend sent
      setStatus(`Sync Error: Found ${employees.length} employees, but no valid biometrics.`);
      startCamera(); 
    }
  } catch (err) {
    console.error("Initialization Failed:", err);
    setStatus("System Offline.");
  }
};
    initialize();

    // Cleanup: Stop camera when component unmounts
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [startCamera]);

  // 3. Recognition Loop
  const handleVideoPlay = () => {
    const interval = setInterval(async () => {
      if (!videoRef.current || !faceMatcher || !modelsLoaded) return;

      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
        if (bestMatch.label !== 'unknown') {
          // Pass the actual 128-float descriptor (not the label string) to the server for verification
          processClocking(detection.descriptor);
        }
      }
    }, 700); 

    return () => clearInterval(interval);
  };

  // 4. Automated Clocking Logic
  const processClocking = async (capturedVector) => {
  // 15-second cooldown to prevent double-clocks and request flooding
  const now = Date.now();
  if (window.lastScanTime && now - window.lastScanTime < 15000) return;
  // Set cooldown immediately so failed requests don't trigger a flood of retries
  window.lastScanTime = now;

  try {
    const response = await fetch(`${API_URL}/api/attendance/identify-and-clock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Convert Float32Array to a regular array so JSON.stringify produces [0.1, 0.2, ...]
      // instead of {"0": 0.1, "1": 0.2, ...} which the backend can't deserialize as float[]
      body: JSON.stringify({ vector: Array.from(capturedVector) }) 
    });

    if (response.ok) {
      const result = await response.json();
      setLastMessage(`✅ Welcome ${result.name}!`);
    } else if (response.status === 404) {
      setLastMessage("❌ Face not recognized");
    } else {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error("Server returned error:", response.status, errorText);
      setLastMessage(`⚠️ Server error: ${response.status}`);
    }

    setTimeout(() => setLastMessage(""), 4000);
  } catch (err) {
    console.error("Identification error:", err);
    setLastMessage("⚠️ Network error");
    setTimeout(() => setLastMessage(""), 4000);
  }
};

  return (
    <div className="attendance-scanner-container">
      <div className="scanner-header">
        <div className={`status-pill ${modelsLoaded ? 'online' : 'loading'}`}>
            {status}
        </div>
      </div>

      <div className="scanner-kiosk">
        <div className="video-wrap">
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            onPlay={handleVideoPlay} 
            playsInline
          />
          <div className="face-oval"></div>
        </div>

        {lastMessage && (
          <div className="success-overlay">
            {lastMessage}
          </div>
        )}
      </div>

      <div className="scanner-footer">
        <p>Position face within the circle for automatic logging.</p>
      </div>
    </div>
  );
}

export default AttendanceScanner;