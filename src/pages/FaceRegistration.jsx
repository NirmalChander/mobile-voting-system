import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';

export default function FaceRegistration({ temporaryRegistrationData, onRegisterVoter }) {
  const [stage, setStage] = useState('initializing'); // initializing, scanning, success
  const [epic, setEpic] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [scanMessage, setScanMessage] = useState('Loading face recognition models...');
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const registeredRef = useRef(false);

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
        setScanMessage('Align your face within the frame');
      } catch (error) {
        console.error('Error loading face models:', error);
        setCameraError(true);
        setScanMessage('Failed to load AI models. Please refresh.');
      }
    };
    
    loadModels();
  }, []);

  const detectFace = useCallback(async () => {
    if (stage !== 'scanning' || !modelsLoaded || !webcamRef.current || !webcamRef.current.video) return;
    
    const video = webcamRef.current.video;
    if (video.readyState !== 4) return;

    try {
      const detection = await faceapi.detectSingleFace(
        video, 
        new faceapi.TinyFaceDetectorOptions()
      ).withFaceLandmarks().withFaceDescriptor();

      if (detection) {
        if (registeredRef.current) return;
        registeredRef.current = true;
        setStage('success');
        setScanMessage('Face Enrolled Successfully!');

        // Prepare payload without client-generated EPIC; server will create one
        const payload = {
          name: temporaryRegistrationData.name,
          aadhaar: temporaryRegistrationData.aadhaar,
          faceRegistered: true,
          faceDescriptor: Array.from(detection.descriptor),
          registeredAt: new Date().toISOString()
        };

        try {
          const created = await onRegisterVoter(payload);
          if (created && created.epic) {
            setEpic(created.epic);
            try { localStorage.setItem('lastEpic', created.epic); } catch {};
            // Auto-navigate to success page shortly after enrollment
            setTimeout(() => {
              navigate('/register-success', { state: { epic: created.epic } });
            }, 700);
          }
        } catch (err) {
          console.error('Registration API failed:', err);
        }
      }
    } catch (err) {
      console.error('Face detection error:', err);
    }
  }, [stage, modelsLoaded, temporaryRegistrationData, onRegisterVoter]);

  useEffect(() => {
    let interval;
    if (stage === 'scanning' && modelsLoaded) {
      interval = setInterval(detectFace, 500);
    }
    return () => clearInterval(interval);
  }, [stage, modelsLoaded, detectFace]);

  const handleFinish = () => {
    navigate('/register-success', { state: { epic } });
  };

  return (
    <div className="auth-container glass-card" style={{ textAlign: 'center' }}>
      <div className="header">
        <h1>Face Enrollment</h1>
        <p>{scanMessage}</p>
      </div>

      <div className="face-scanner-container relative-container" style={{ margin: '1rem auto 2rem', width: '240px', height: '320px', borderRadius: '2rem', overflow: 'hidden', background: '#000', border: stage === 'success' ? '4px solid var(--success)' : '4px solid var(--info)', transition: 'border-color 0.3s' }}>
        
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
            <div className="scanner-line" style={{ background: 'var(--info)', boxShadow: '0 0 15px 2px rgba(59,130,246,0.5)' }}></div>
            <div className="scanner-overlay" style={{ background: 'linear-gradient(to bottom, rgba(59,130,246,0.2) 0%, transparent 100%)' }}></div>
          </>
        )}

        {stage === 'success' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.4)', backdropFilter: 'blur(6px)' }}>
            <CheckCircle size={80} color="white" style={{ animation: 'pulse 1s infinite' }} />
          </div>
        )}
      </div>

      <div style={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        {stage === 'initializing' && !cameraError && <p className="text-muted"><span className="spinner" style={{ display: 'inline-block', width: '1rem', height: '1rem', marginRight: '0.5rem', verticalAlign: 'middle', borderTopColor: 'var(--info)' }}></span> Loading Models...</p>}
        {stage === 'scanning' && !cameraError && <p className="text-info glow-text" style={{ textShadow: '0 0 10px rgba(59, 130, 246, 0.8)' }}>Creating Biometric Profile...</p>}
        {stage === 'success' && (
          <div style={{ animation: 'fadeIn 0.5s' }}>
            <p className="text-success" style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Face Enrolled Successfully!</p>
            <button className="btn" onClick={handleFinish} style={{ width: '200px', padding: '0.75rem' }}>
              View Digital EPIC <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
