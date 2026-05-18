import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LifeBuoy, Send, ArrowLeft } from 'lucide-react';

export default function Help() {
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="container" style={{ padding: '1.5rem' }}>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="header" style={{ marginBottom: '2rem', textAlign: 'left' }}>
        <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LifeBuoy size={32} color="var(--primary)" /> Support
        </h1>
        <p>Frequently asked questions and contact form</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'white', marginBottom: '0.5rem' }}>I forgot my EPIC number</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Your EPIC number is generated after successfully completing Face Registration. Check your SMS or email inbox associated with your Aadhaar.</p>
        </div>
        
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'white', marginBottom: '0.5rem' }}>Face Verification Failed</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Ensure you are in a well-lit environment and not wearing glasses or masks. The system requires a 95% threshold match against your enrolled biometric hash.</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginTop: 'auto' }}>
        <h3 style={{ marginBottom: '1rem', color: 'white' }}>Contact Electoral Officer</h3>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <p style={{ color: 'var(--success)', fontWeight: 'bold', marginBottom: '0.5rem' }}>Message Sent Securely</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ticket ID: #{Math.floor(Math.random() * 900000) + 100000}</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <div className="input-group">
              <label>Issue Description</label>
              <textarea 
                rows="3" 
                placeholder="Describe what went wrong..." 
                required 
                style={{ 
                  background: 'rgba(0,0,0,0.3)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '0.75rem', 
                  padding: '1rem', 
                  color: 'white', 
                  width: '100%', 
                  fontFamily: 'inherit',
                  resize: 'none'
                }} 
              />
            </div>
            <button type="submit" className="btn">
              <Send size={18} /> Submit Ticket
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
