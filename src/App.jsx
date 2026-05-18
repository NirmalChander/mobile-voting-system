import { useState } from 'react';
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

  const handleRegisterVoter = (voterData) => {
    setVoters(prev => [...prev, voterData]);
  };

  const handleCastVote = (voteData) => {
    setVotes(prev => [...prev, voteData]);
    setCurrentUser(prev => ({ ...prev, votedFor: voteData.candidateId }));
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
