import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function AadhaarCheck({ user, setUser }) {
  const [aadhaar, setAadhaar] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (aadhaar.length !== 4) {
      setError('Aadhaar must be exactly 4 digits');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setError('');
    }, 1200);
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (otp !== '123456') {
      setError('Invalid OTP. Use 123456 for testing.');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setUser({ ...user, aadhaarVerified: true });
      navigate('/face-verify');
    }, 1000);
  };

  return (
    <div className="auth-container glass-card">
      <div className="header">
        <ShieldCheck size={48} color="var(--success)" style={{ margin: '0 auto 1rem' }} />
        <h1>Aadhaar Verification</h1>
        <p>Verify identity for EPIC: <strong>{user.epic}</strong></p>
      </div>

      {!otpSent ? (
        <form onSubmit={handleSendOTP}>
          <div className="input-group">
            <label htmlFor="aadhaar">Last 4 Digits of Aadhaar Number</label>
            <input 
              type="text" 
              id="aadhaar"
              value={aadhaar}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                setAadhaar(val);
                setError('');
              }}
              placeholder="0000"
              required
            />
            {error && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{error}</span>}
          </div>
          
          <button type="submit" className="btn" disabled={aadhaar.length !== 4 || loading}>
            {loading ? <div className="spinner"></div> : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <div className="input-group">
            <label htmlFor="otp">Enter 6-digit OTP (123456)</label>
            <input 
              type="text" 
              id="otp"
              value={otp}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(val);
                setError('');
              }}
              placeholder="123456"
              required
            />
            {error && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{error}</span>}
          </div>
          
          <button type="submit" className="btn" disabled={otp.length !== 6 || loading}>
            {loading ? <div className="spinner"></div> : (
              <>
                Verify & Proceed <ArrowRight size={18} />
              </>
            )}
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{ marginTop: '1rem' }}
            onClick={() => setOtpSent(false)}
            disabled={loading}
          >
            Back
          </button>
        </form>
      )}
    </div>
  );
}
