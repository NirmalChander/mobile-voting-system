import { QRCodeSVG } from 'qrcode.react';
import { QRCodeCanvas } from 'qrcode.react';
import { CheckCircle, Download, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Success({ user }) {
  const navigate = useNavigate();
  // Encrypt or mask the data in a real app. Here we just encode JSON.
  const qrData = JSON.stringify({
    epic: user.epic,
    voteId: user.votedFor,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="auth-container glass-card" style={{ textAlign: 'center', margin: 'auto' }}>
      <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
      
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'white' }}>Vote Cast Successfully!</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Your vote has been securely recorded on the ledger.
      </p>

      <div style={{ 
        background: 'white', 
        padding: '1.5rem', 
        borderRadius: '1rem', 
        display: 'inline-block',
        margin: '0 auto 1.5rem',
        boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)'
      }}>
        <QRCodeSVG value={qrData} size={200} level="H" />
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'rgba(225, 29, 72, 0.1)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
        <ShieldAlert size={24} color="var(--danger)" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
          This QR code is your only proof of voting. It can be scanned <strong>only once</strong> at the booth. It will reveal your vote for <strong>10 seconds</strong> only.
        </p>
      </div>

      <button className="btn" onClick={() => navigate('/scan')}>
        Simulate QR Scan <Download size={18} />
      </button>

      <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={() => window.location.href = '/'}>
        Logout & Return Home
      </button>
    </div>
  );
}
