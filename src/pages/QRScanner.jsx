import { useState, useEffect } from 'react';
import { Scan, ShieldAlert, CheckCircle, ShieldOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CANDIDATES = [
  { id: '1', name: 'Ravi Kumar', party: 'Progressive Alliance' },
  { id: '2', name: 'Meera Reddy', party: 'Democratic Front' },
  { id: '3', name: 'Anita Desai', party: 'National Union' },
  { id: '4', name: 'NOTA', party: 'None of the Above' }
];

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // fake scan result
  const [countdown, setCountdown] = useState(0);
  const [expired, setExpired] = useState(false);
  const navigate = useNavigate();

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      // Simulate reading data from QR
      setResult({
        epic: 'ABC1234567',
        candidateId: '1',
      });
      setCountdown(10);
    }, 2000);
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && result !== null) {
      setExpired(true);
      setResult(null);
    }
    return () => clearInterval(timer);
  }, [countdown, result]);

  if (expired) {
    return (
      <div className="auth-container glass-card" style={{ textAlign: 'center' }}>
        <ShieldOff size={64} color="var(--danger)" style={{ margin: '0 auto 1.5rem' }} />
        <h1>Verification Expired</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          For your privacy, the voting record has been hidden and the QR code is now invalid.
        </p>
        <button className="btn" onClick={() => navigate('/')}>
          Start Over
        </button>
      </div>
    );
  }

  if (result) {
    const candidate = CANDIDATES.find(c => c.id === result.candidateId);
    return (
      <div className="auth-container glass-card" style={{ textAlign: 'center' }}>
        <CheckCircle size={56} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>Vote Verified</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Voter ID: {result.epic}
        </p>
        
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Voted For:</p>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>
            {candidate?.name || 'Unknown'}
          </h1>
          <p style={{ color: 'white' }}>{candidate?.party || 'Unknown'}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--danger)', fontWeight: 'bold' }}>
          <ShieldAlert size={20} />
          <span>Hiding result in {countdown}s</span>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container glass-card" style={{ textAlign: 'center' }}>
      <div className="header">
        <Scan size={48} color="var(--text-main)" style={{ margin: '0 auto 1rem' }} />
        <h1>Booth QR Scanner</h1>
        <p>Simulate scanning the generated QR code</p>
      </div>

      <div 
        style={{ 
          margin: '2rem auto', 
          width: '200px', 
          height: '200px', 
          border: '2px dashed var(--primary)', 
          borderRadius: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {scanning ? (
          <>
            <div style={{ 
              position: 'absolute', 
              top: 0, left: 0, right: 0, 
              height: '4px', 
              background: 'var(--primary)',
              boxShadow: '0 0 10px var(--primary)',
              animation: 'scanLine 1.5s linear infinite'
            }} />
            <p style={{ color: 'var(--primary)' }}>Scanning...</p>
            <style>
              {`
                @keyframes scanLine {
                  0% { top: 0%; }
                  50% { top: 100%; }
                  100% { top: 0%; }
                }
              `}
            </style>
          </>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Align QR code within frame</p>
        )}
      </div>

      <button className="btn" onClick={handleSimulateScan} disabled={scanning}>
        <Scan size={18} /> {scanning ? 'Scanning...' : 'Simulate Scan'}
      </button>
    </div>
  );
}
