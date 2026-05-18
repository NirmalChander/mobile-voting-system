import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';

export default function FaceVerification({ user, setUser }) {
  const [stage, setStage] = useState('initializing'); // initializing, scanning, success, failed
  const [cameraError, setCameraError] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [scanMessage, setScanMessage] = useState('Loading face recognition models...');
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  // Resolve enrolled descriptor from user object or localStorage. Normalize to number[]
  const resolvedFaceDescriptor = (() => {
    try {
      let desc = null;
      if (user?.faceDescriptor) desc = user.faceDescriptor;
      else if (user?.epic) {
        const cachedDescriptor = localStorage.getItem(`faceDescriptor:${user.epic}`);
        desc = cachedDescriptor ? JSON.parse(cachedDescriptor) : null;
      }
      if (!desc) return null;
      // Normalize to number array
      if (Array.isArray(desc)) return desc.map(v => Number(v));
      return null;
    } catch (storageError) {
      console.warn('Failed to read cached face descriptor:', storageError);
      return null;
    }
  })();

  // Keep recent distances to smooth transient mismatches
  const distancesRef = useRef([]);
  const MATCH_THRESHOLD = 0.60; // slightly more tolerant than before
  const MAX_RECENT = 5;

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
        setStage('scanning');
        setScanMessage('Verifying facial biometrics...');
      } catch (error) {
        console.error('Error loading face models:', error);
        setCameraError(true);
        setScanMessage('Failed to load AI models. Please refresh.');
      }
    };
    
    loadModels();
  }, []);

  const verifyFace = useCallback(async () => {
    if (stage !== 'scanning' || !modelsLoaded || !webcamRef.current || !webcamRef.current.video) return;
    
    const video = webcamRef.current.video;
    if (video.readyState !== 4) return;

    try {
      const detection = await faceapi.detectSingleFace(
        video, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();

      if (detection) {
        // Compare with enrolled descriptor
        if (!resolvedFaceDescriptor) {
           setStage('failed');
           setScanMessage('No enrolled face found for this user.');
           return;
        }

        // Ensure descriptor lengths match
        if (!Array.isArray(resolvedFaceDescriptor) || resolvedFaceDescriptor.length !== detection.descriptor.length) {
          console.warn('[face-verify] descriptor length mismatch', resolvedFaceDescriptor?.length, detection.descriptor.length);
          setScanMessage('Enrolled descriptor incompatible with current model. Re-enroll face.');
          return;
        }

        const enrolledDescriptor = new Float32Array(resolvedFaceDescriptor.map(v => Number(v)));
        const distance = faceapi.euclideanDistance(detection.descriptor, enrolledDescriptor);
        console.debug('[face-verify] distance=', distance.toFixed(4));

        // Keep sliding window of recent distances
        distancesRef.current.push(distance);
        if (distancesRef.current.length > MAX_RECENT) distancesRef.current.shift();
        const minRecent = Math.min(...distancesRef.current);

        setScanMessage(`Comparing... Distance: ${distance.toFixed(2)}`);

        // Accept if any of recent distances are below threshold
        if (minRecent < MATCH_THRESHOLD) {
          setStage('success');
          setScanMessage('Face Match Confirmed!');

          setTimeout(() => {
            setUser({ ...user, faceVerified: true });
            navigate('/instructions');
          }, 800);
          return;
        }

        // Otherwise prompt user to adjust
        setScanMessage(`Face mismatch. Try centering your face. (Dist: ${distance.toFixed(2)})`);
      } else {
          setScanMessage('Keep face in frame...');
      }
    } catch (err) {
      console.error('Face verification error:', err);
    }
  }, [stage, modelsLoaded, user, resolvedFaceDescriptor, setUser, navigate]);

  useEffect(() => {
    let interval;
    if (stage === 'scanning' && modelsLoaded) {
      interval = setInterval(verifyFace, 800);
    }
    return () => clearInterval(interval);
  }, [stage, modelsLoaded, verifyFace]);

  return (
    <div className="auth-container glass-card" style={{ textAlign: 'center' }}>
      <div className="header">
        <h1>Identity Verification</h1>
        <p>Cross-checking against enrolled biometrics</p>
      </div>

      <div className="face-scanner-container relative-container" style={{ margin: '1rem auto 2rem', width: '240px', height: '320px', borderRadius: '2rem', overflow: 'hidden', background: '#000', border: stage === 'success' ? '4px solid var(--success)' : stage === 'failed' ? '4px solid var(--danger)' : '4px solid var(--primary)', transition: 'border-color 0.3s' }}>
        
        {cameraError ? (
          <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--danger)', fontSize: '0.85rem' }}>
            {scanMessage}
          </div>
        ) : (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user" }}
            onUserMediaError={() => {
               setCameraError(true);
               setScanMessage('Camera access denied or unavailable.');
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
          />
        )}

        {stage === 'scanning' && !cameraError && (
          <>
            <div className="scanner-line"></div>
            <div className="scanner-overlay"></div>
          </>
        )}

        {stage === 'success' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.4)', backdropFilter: 'blur(6px)' }}>
            <CheckCircle size={80} color="white" style={{ animation: 'pulse 1s infinite' }} />
          </div>
        )}
      </div>

      <div style={{ height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {stage === 'initializing' && !cameraError && <p className="text-muted"><span className="spinner" style={{ display: 'inline-block', width: '1rem', height: '1rem', marginRight: '0.5rem', verticalAlign: 'middle', borderTopColor: 'var(--primary)' }}></span> Loading Models...</p>}
        {stage === 'scanning' && !cameraError && <p className="text-info glow-text">{scanMessage}</p>}
        {stage === 'success' && <p className="text-success" style={{ fontWeight: 'bold' }}>{scanMessage}</p>}
        {stage === 'failed' && <p className="text-danger" style={{ fontWeight: 'bold' }}>Verification Failed: {scanMessage}</p>}
      </div>
      
      {stage === 'scanning' && (
        <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={() => navigate('/login')}>
            Cancel Verification
        </button>
      )}
    </div>
  );
}
