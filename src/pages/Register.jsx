import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, ArrowRight } from 'lucide-react';

export default function Register({ setTemporaryRegistrationData }) {
  const [formData, setFormData] = useState({ name: '', dob: '', address: '', aadhaar: '' });
  const navigate = useNavigate();

  const handleNext = (e) => {
    e.preventDefault();
    // In a real app, we'd verify Aadhaar OTP here similar to AadhaarCheck.jsx.
    // For this prototype, we'll assume valid Aadhaar and proceed to Face Registration.
    setTemporaryRegistrationData(formData);
    navigate('/face-enroll');
  };

  return (
    <div className="container" style={{ padding: '1.5rem' }}>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="auth-container glass-card" style={{ justifyContent: 'flex-start' }}>
        <div className="header" style={{ marginBottom: '2rem' }}>
          <UserPlus size={48} color="var(--info)" style={{ margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '1.75rem' }}>Voter Enrollment</h1>
          <p>Register to obtain your Digital EPIC</p>
        </div>

        <form onSubmit={handleNext}>
          <div className="input-group">
            <label>Full Name (as per Aadhaar)</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. John Doe"
              required
            />
          </div>
          
          <div className="input-group">
            <label>Date of Birth</label>
            <input 
              type="date" 
              value={formData.dob}
              onChange={(e) => setFormData({...formData, dob: e.target.value})}
              required
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div className="input-group">
            <label>Last 4 Digits of Aadhaar</label>
            <input 
              type="text" 
              inputMode="numeric"
              value={formData.aadhaar}
              onChange={(e) => setFormData({...formData, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 4)})}
              placeholder="0000"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn" 
            disabled={formData.name.length < 3 || formData.aadhaar.length !== 4 || !formData.dob}
            style={{ marginTop: '1rem' }}
          >
            Proceed to Biometrics <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
