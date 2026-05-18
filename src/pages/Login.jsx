import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Login({ setCurrentUser, voters, votes }) {
  const [epic, setEpic] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      
      const userRecord = voters.find(v => v.epic === epic);
      if (!userRecord) {
        setError('EPIC not found. Please register first.');
        return;
      }

      let faceDescriptor = userRecord.faceDescriptor || null;
      if (!faceDescriptor) {
        try {
          const cachedDescriptor = localStorage.getItem(`faceDescriptor:${epic}`);
          if (cachedDescriptor) {
            faceDescriptor = JSON.parse(cachedDescriptor);
          }
        } catch (storageError) {
          console.warn('Failed to load cached face descriptor:', storageError);
        }
      }

      const hasVoted = votes.some(v => v.epic === epic);
      if (hasVoted) {
        setError('A vote has already been cast for this EPIC.');
        return;
      }
      
      setCurrentUser({ ...userRecord, faceDescriptor, aadhaarVerified: false, faceVerified: false, votedFor: null });
      navigate('/verify');
    }, 1000);
  };

  return (
    <div className="container" style={{ padding: '1.5rem' }}>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="auth-container glass-card" style={{ justifyContent: 'flex-start' }}>
        <div className="header" style={{ marginBottom: '2rem' }}>
          <Fingerprint size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '1.75rem' }}>Voter Login</h1>
          <p>Login with your verified EPIC</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="epic">EPIC Number</label>
            <input 
              type="text" 
              id="epic"
              value={epic}
              onChange={(e) => {
                setEpic(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="e.g. IND1234567"
              autoComplete="off"
              required
            />
            {error && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{error}</span>}
          </div>
          
          <button type="submit" className="btn" disabled={epic.length === 0 || loading} style={{ marginTop: '1rem' }}>
            {loading ? <div className="spinner"></div> : (
              <>Authenticate <ArrowRight size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
