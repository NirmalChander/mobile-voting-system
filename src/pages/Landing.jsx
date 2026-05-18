import { useNavigate } from 'react-router-dom';
import { UserPlus, LogIn, LayoutDashboard, LifeBuoy } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="container" style={{ justifyContent: 'center' }}>
      <div className="header" style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>E-Democracy Protocol</h1>
        <p style={{ marginTop: '0.5rem', fontSize: '1rem', color: 'var(--text-muted)' }}>Secure Digital Voting Ecosystem</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        
        <div 
          className="glass-card" 
          style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.3s' }}
          onClick={() => navigate('/register')}
        >
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '1rem' }}>
            <UserPlus size={28} color="var(--info)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem', color: 'white' }}>New Voter Registration</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enroll face and get your EPIC</p>
          </div>
        </div>

        <div 
          className="glass-card" 
          style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.3s' }}
          onClick={() => navigate('/login')}
        >
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '1rem' }}>
            <LogIn size={28} color="var(--success)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem', color: 'white' }}>Cast Your Vote</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Login with EPIC to vote securely</p>
          </div>
        </div>

        <div 
          className="glass-card" 
          style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', transition: 'all 0.3s' }}
          onClick={() => navigate('/admin')}
        >
          <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '1rem', borderRadius: '1rem' }}>
            <LayoutDashboard size={28} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem', color: 'white' }}>Election Commission</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Admin dashboard and analytics</p>
          </div>
        </div>

      </div>

      <button 
        className="btn btn-secondary" 
        style={{ width: 'auto', margin: '3rem auto 0', padding: '0.75rem 1.5rem', display: 'flex', gap: '0.5rem', fontSize: '0.9rem', borderRadius: '2rem' }}
        onClick={() => navigate('/help')}
      >
        <LifeBuoy size={18} /> Help & Support
      </button>

    </div>
  );
}
