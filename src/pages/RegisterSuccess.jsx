import { useLocation, useNavigate } from 'react-router-dom';
import { UserCheck, Copy, Home } from 'lucide-react';
import { useState } from 'react';

export default function RegisterSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  // If accessed directly without state
  if (!state?.epic) {
    return (
      <div className="auth-container glass-card" style={{ textAlign: 'center' }}>
        <p>Invalid Session. Please register.</p>
        <button className="btn" onClick={() => navigate('/register')} style={{ marginTop: '1rem' }}>Go to Register</button>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(state.epic);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="auth-container glass-card" style={{ textAlign: 'center' }}>
      <UserCheck size={64} color="var(--success)" style={{ margin: '0 auto 1.5rem' }} />
      
      <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'white' }}>Registration Complete!</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        You are now a verified digital voter. Below is your unique EPIC number. Please save it securely.
      </p>

      <div style={{ 
        background: 'rgba(0,0,0,0.4)', 
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '1.5rem', 
        borderRadius: '1rem', 
        display: 'inline-block',
        margin: '0 auto 2rem',
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)',
        width: '100%'
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Electronic Photo Identity Card</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '2rem', color: 'var(--primary)', letterSpacing: '2px', fontFamily: 'monospace' }}>{state.epic}</h2>
          <button 
            onClick={handleCopy} 
            style={{ background: 'none', border: 'none', color: copied ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }}
            title="Copy to clipboard"
          >
            {copied ? <UserCheck size={24} /> : <Copy size={24} />}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button className="btn" onClick={() => navigate('/login')}>
          Login to Vote Now
        </button>

        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          <Home size={18} /> Return Home
        </button>
      </div>
    </div>
  );
}
