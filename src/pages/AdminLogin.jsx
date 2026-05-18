import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, ArrowLeft } from 'lucide-react';

export default function AdminLogin({ setAdminLoggedIn }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      // Hardcoded admin credential
      if (password === 'admin123') {
        setAdminLoggedIn(true);
        navigate('/admin-dashboard');
      } else {
        setError('Invalid administrator credentials');
      }
    }, 1000);
  };

  return (
    <div className="container" style={{ padding: '1.5rem' }}>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="auth-container glass-card" style={{ justifyContent: 'flex-start' }}>
        <div className="header" style={{ marginBottom: '2rem' }}>
          <Shield size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '1.75rem' }}>Election Commission</h1>
          <p>Authorized access only</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Master Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••••"
              required
            />
            {error && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{error}</span>}
          </div>

          <button 
            type="submit" 
            className="btn" 
            disabled={password.length === 0 || loading}
            style={{ marginTop: '1rem' }}
          >
            {loading ? <div className="spinner"></div> : (
              <>Authenticate <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
