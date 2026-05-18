import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, CheckCircle2, ShieldCheck, Clock, UserCheck } from 'lucide-react';

const CANDIDATES = [
  { id: '1', name: 'Ravi Kumar', party: 'Progressive Alliance', color: '#10B981' },
  { id: '2', name: 'Meera Reddy', party: 'Democratic Front', color: '#3B82F6' },
  { id: '3', name: 'Anita Desai', party: 'National Union', color: '#F59E0B' },
  { id: '4', name: 'NOTA', party: 'None of the Above', color: '#64748B' }
];

export default function Dashboard({ user, onCastVote }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 23, s: 45 });
  const navigate = useNavigate();

  // Mock live timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else {
          s = 59;
          if (m > 0) m--;
          else { m = 59; h--; }
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user.votedFor) {
      navigate('/success');
    }
  }, [user.votedFor, navigate]);

  const handleVote = () => {
    if (!selectedCandidate) return;
    setSubmitting(true);
    
    setTimeout(() => {
      onCastVote({ 
        epic: user.epic, 
        candidateId: selectedCandidate, 
        timestamp: new Date().toISOString() 
      });
      // Do not navigate immediately. Let the useEffect redirect once state updates globally.
    }, 2000);
  };

  return (
    <div className="container" style={{ padding: '0', maxWidth: '500px' }}>
      
      {/* Premium Header */}
      <div style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', padding: '1rem 1.5rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Voter <span style={{ color: 'var(--primary)' }}>{user.epic}</span></h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            {user.aadhaarVerified && <ShieldCheck size={14} color="var(--success)" />}
            {user.faceVerified && <UserCheck size={14} color="var(--info)" />}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fully Verified</span>
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)' }}>
            <Clock size={14} />
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Poll closes in</span>
          </div>
          <p style={{ fontSize: '1.1rem', fontFamily: 'monospace', margin: 0, color: 'white' }}>
            {String(timeLeft.h).padStart(2,'0')}:{String(timeLeft.m).padStart(2,'0')}:{String(timeLeft.s).padStart(2,'0')}
          </p>
        </div>
      </div>

      <div className="header" style={{ padding: '1.5rem', marginBottom: '0' }}>
        <h1 style={{ fontSize: '1.5rem' }}>Digital Ballot</h1>
        <p>Select a candidate to proceed</p>
      </div>

      <div className="candidate-list" style={{ flex: 1, padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {CANDIDATES.map((candidate) => (
          <div 
            key={candidate.id}
            className={`glass-card ${selectedCandidate === candidate.id ? 'selected' : ''}`}
            style={{ 
              padding: '1.25rem', 
              cursor: 'pointer',
              border: selectedCandidate === candidate.id ? `2px solid ${candidate.color}` : '1px solid var(--card-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: selectedCandidate === candidate.id ? 'scale(1.02)' : 'scale(1)',
              animation: 'none',
              opacity: 1,
              boxShadow: selectedCandidate === candidate.id ? `0 0 20px -5px ${candidate.color}` : 'none'
            }}
            onClick={() => setSelectedCandidate(candidate.id)}
          >
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: 'white' }}>{candidate.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{candidate.party}</p>
            </div>
            <div 
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                background: candidate.color + '20',
                border: `2px solid ${candidate.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s'
              }}
            >
              {selectedCandidate === candidate.id && <CheckCircle2 color={candidate.color} size={24} style={{ animation: 'pulse 1s infinite' }} />}
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '1.5rem', marginTop: 'auto', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--card-border)', position: 'sticky', bottom: 0, zIndex: 10 }}>
        <button 
          className="btn" 
          disabled={!selectedCandidate}
          onClick={() => setModalOpen(true)}
        >
          <Vote size={20} /> Preview & Cast Vote
        </button>
      </div>

      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
          zIndex: 50,
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-start)' }}>
            <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.5rem' }}>Confirm Selection</h2>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px dashed var(--card-border)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>You are securely casting a vote for:</p>
              <h3 style={{ fontSize: '1.75rem', color: 'white' }}>
                {CANDIDATES.find(c => c.id === selectedCandidate)?.name}
              </h3>
              <p style={{ color: 'var(--primary)', marginTop: '0.25rem', fontWeight: 'bold' }}>
                {CANDIDATES.find(c => c.id === selectedCandidate)?.party}
              </p>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--danger)', textAlign: 'center', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={16} /> Data is secured via blockchain ledger
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setModalOpen(false)}
                disabled={submitting}
                style={{ flex: 1 }}
              >
                Go Back
              </button>
              <button 
                className="btn" 
                onClick={handleVote}
                disabled={submitting}
                style={{ flex: 2 }}
              >
                {submitting ? (
                  <>
                    <div className="spinner"></div> Submitting...
                  </>
                ) : 'Confirm & Cast Vote'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
