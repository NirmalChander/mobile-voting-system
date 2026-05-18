import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ShieldAlert, ArrowRight, CheckSquare } from 'lucide-react';

export default function Instructions() {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '1rem 0' }}>
      <div className="header" style={{ marginBottom: '1.5rem', padding: '0 1.5rem' }}>
        <BookOpen size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
        <h1>Voter Guidelines</h1>
        <p>Please read carefully before proceeding</p>
      </div>

      <div style={{ flex: 1, padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'left' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={20} /> Important Rules
          </h3>
          <ul style={{ listStylePosition: 'inside', color: 'var(--text-main)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><strong style={{color: 'white'}}>Single Vote:</strong> You can only cast your vote once. This action is irreversible.</li>
            <li><strong style={{color: 'white'}}>Privacy:</strong> Ensure you are in a private environment before selecting a candidate.</li>
            <li><strong style={{color: 'white'}}>Timeout:</strong> The selection screen will expire if inactive for 3 minutes.</li>
            <li><strong style={{color: 'white'}}>Verification:</strong> A QR code will be generated upon successful submission. This is your proof of voting.</li>
            <li><strong style={{color: 'white'}}>Legal:</strong> Any attempt to tamper with the application will be recorded and prosecuted.</li>
          </ul>
        </div>

        <div 
          style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: '1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            cursor: 'pointer',
            border: agreed ? '1px solid var(--primary)' : '1px solid transparent'
          }}
          onClick={() => setAgreed(!agreed)}
        >
          <div style={{ 
            width: '24px', height: '24px', borderRadius: '6px', 
            border: agreed ? 'none' : '2px solid var(--text-muted)',
            background: agreed ? 'var(--primary)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {agreed && <CheckSquare size={16} color="white" />}
          </div>
          <p style={{ fontSize: '0.9rem', color: agreed ? 'white' : 'var(--text-muted)' }}>
            I agree to the terms and guidelines
          </p>
        </div>
      </div>

      <div style={{ padding: '1.5rem', marginTop: 'auto', background: 'var(--bg-end)', borderTop: '1px solid var(--card-border)' }}>
        <button 
          className="btn" 
          disabled={!agreed}
          onClick={() => navigate('/dashboard')}
        >
          Proceed to Voting <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}
