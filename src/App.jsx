import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Landing from './pages/Landing';
import Help from './pages/Help';
import Register from './pages/Register';
import FaceRegistration from './pages/FaceRegistration';
import RegisterSuccess from './pages/RegisterSuccess';
import Login from './pages/Login';
import AadhaarCheck from './pages/AadhaarCheck';
import FaceVerification from './pages/FaceVerification';
import Instructions from './pages/Instructions';
import Dashboard from './pages/Dashboard';
import Success from './pages/Success';
import QRScanner from './pages/QRScanner';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  // Global Mock DB (In-Memory React State)
  const [voters, setVoters] = useState([]); // { epic, name, aadhaar, faceRegistered }
  const [votes, setVotes] = useState([]); // { epic, candidateId, timestamp }
  
  // Current Session States
  const [temporaryRegistrationData, setTemporaryRegistrationData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // { epic, aadhaarVerified, faceVerified, votedFor }
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  // Load voters and votes from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [votersRes, votesRes] = await Promise.all([
          fetch('http://localhost:5000/api/users'),
          fetch('http://localhost:5000/api/votes')
        ]);
        
        if (votersRes.ok) {
          const votersData = await votersRes.json();
          setVoters(votersData.data || []);
        }
        
        if (votesRes.ok) {
          const votesData = await votesRes.json();
          setVotes(votesData.data || []);
        }
      } catch (error) {
        console.error('Failed to load data from backend:', error);
      }
    };
    
    fetchData();
  }, []);

  const handleRegisterVoter = async (voterData) => {
    try {
      console.log('[handleRegisterVoter] sending', voterData);
      // Call backend API to register voter (server will generate EPIC)
      const response = await fetch('http://localhost:5000/api/register-voter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: voterData.name,
          aadhaar: voterData.aadhaar,
          faceRegistered: voterData.faceRegistered
        })
      });

      console.log('[handleRegisterVoter] response status', response.status);

      if (response.ok) {
        const resJson = await response.json();
        console.log('[handleRegisterVoter] response json', resJson);
        // resJson.data may be an array
        const created = Array.isArray(resJson.data) && resJson.data.length ? resJson.data[0] : resJson.data || null;
        if (created) {
          const merged = { ...created };
          if (voterData.faceDescriptor && !merged.faceDescriptor) {
            merged.faceDescriptor = voterData.faceDescriptor;
          }
          if (voterData.registeredAt && !merged.registeredAt) {
            merged.registeredAt = voterData.registeredAt;
          }
          if (merged.epic && merged.faceDescriptor) {
            try {
              localStorage.setItem(`faceDescriptor:${merged.epic}`, JSON.stringify(merged.faceDescriptor));
            } catch (storageError) {
              console.warn('Failed to cache face descriptor locally:', storageError);
            }
          }
          setVoters(prev => [...prev, merged]);
          return merged;
        } else {
          const fallback = { ...voterData };
          if (fallback.epic && fallback.faceDescriptor) {
            try {
              localStorage.setItem(`faceDescriptor:${fallback.epic}`, JSON.stringify(fallback.faceDescriptor));
            } catch (storageError) {
              console.warn('Failed to cache fallback face descriptor locally:', storageError);
            }
          }
          setVoters(prev => [...prev, fallback]);
          return fallback;
        }
      } else {
        // Handle conflict by refetching existing user
        if (response.status === 409) {
          const usersRes = await fetch('http://localhost:5000/api/users');
          if (usersRes.ok) {
            const usersJson = await usersRes.json();
            const existing = (usersJson.data || []).find(u => u.aadhaar === voterData.aadhaar || u.name === voterData.name);
            if (existing) {
              const merged = { ...existing };
              if (voterData.faceDescriptor && !merged.faceDescriptor) {
                merged.faceDescriptor = voterData.faceDescriptor;
              }
              if (merged.epic && merged.faceDescriptor) {
                try {
                  localStorage.setItem(`faceDescriptor:${merged.epic}`, JSON.stringify(merged.faceDescriptor));
                } catch (storageError) {
                  console.warn('Failed to cache conflicting face descriptor locally:', storageError);
                }
              }
              setVoters(prev => [...prev, merged]);
              return merged;
            }
          }
        }
        console.error('Failed to register voter in backend');
        return null;
      }
    } catch (error) {
      console.error('Error registering voter:', error);
      // Still update local state even if backend fails (graceful fallback)
      setVoters(prev => [...prev, voterData]);
      return voterData;
    }
  };

  const handleCastVote = async (voteData) => {
    try {
      // Call backend API to cast vote
      const response = await fetch('http://localhost:5000/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          epic: voteData.epic,
          candidateId: voteData.candidateId,
          timestamp: voteData.timestamp
        })
      });
      
      if (response.ok) {
        // Re-fetch votes from backend to ensure authoritative state
        const votesRes = await fetch('http://localhost:5000/api/votes');
        if (votesRes.ok) {
          const votesData = await votesRes.json();
          setVotes(votesData.data || []);
        } else {
          setVotes(prev => [...prev, voteData]);
        }
        setCurrentUser(prev => ({ ...prev, votedFor: voteData.candidateId }));
      } else {
        console.error('Failed to cast vote in backend');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      // Still update local state even if backend fails (graceful fallback)
      setVotes(prev => [...prev, voteData]);
      setCurrentUser(prev => ({ ...prev, votedFor: voteData.candidateId }));
    }
  };

  return (
    <Router>
      <div className="container">
        {/* Background glow effects */}
        <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.15, zIndex: -1, pointerEvents: 'none' }} />
        <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '300px', height: '300px', background: 'var(--info)', filter: 'blur(150px)', opacity: 0.1, zIndex: -1, pointerEvents: 'none' }} />
        
        <Routes>
          {/* Public / Hub */}
          <Route path="/" element={<Landing />} />
          <Route path="/help" element={<Help />} />

          {/* Registration Flow */}
          <Route path="/register" element={<Register setTemporaryRegistrationData={setTemporaryRegistrationData} />} />
          <Route 
            path="/face-enroll" 
            element={temporaryRegistrationData ? <FaceRegistration temporaryRegistrationData={temporaryRegistrationData} onRegisterVoter={handleRegisterVoter} /> : <Navigate to="/register" replace />} 
          />
          <Route path="/register-success" element={<RegisterSuccess />} />

          {/* Voting Flow */}
          <Route path="/login" element={<Login setCurrentUser={setCurrentUser} voters={voters} votes={votes} />} />
          <Route 
            path="/verify" 
            element={currentUser?.epic ? <AadhaarCheck user={currentUser} setUser={setCurrentUser} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/face-verify" 
            element={currentUser?.aadhaarVerified ? <FaceVerification user={currentUser} setUser={setCurrentUser} /> : <Navigate to="/verify" replace />} 
          />
          <Route 
            path="/instructions" 
            element={currentUser?.faceVerified ? <Instructions /> : <Navigate to="/face-verify" replace />} 
          />
          <Route 
            path="/dashboard" 
            element={currentUser?.faceVerified ? <Dashboard user={currentUser} onCastVote={handleCastVote} /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/success" 
            element={currentUser?.votedFor ? <Success user={currentUser} /> : <Navigate to="/dashboard" replace />} 
          />
          <Route path="/scan" element={<QRScanner />} />

          {/* Admin Flow */}
          <Route path="/admin" element={<AdminLogin setAdminLoggedIn={setAdminLoggedIn} />} />
          <Route 
            path="/admin-dashboard" 
            element={adminLoggedIn ? <AdminDashboard voters={voters} votes={votes} setAdminLoggedIn={setAdminLoggedIn} /> : <Navigate to="/admin" replace />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
