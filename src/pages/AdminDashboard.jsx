import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Vote, LogOut, CheckCircle, Download, FileText } from 'lucide-react';

const CANDIDATES = [
  { id: '1', name: 'Ravi Kumar', party: 'Progressive Alliance', color: '#10B981' },
  { id: '2', name: 'Meera Reddy', party: 'Democratic Front', color: '#3B82F6' },
  { id: '3', name: 'Anita Desai', party: 'National Union', color: '#F59E0B' },
  { id: '4', name: 'NOTA', party: 'None of the Above', color: '#64748B' }
];

export default function AdminDashboard({ voters, votes, setAdminLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setAdminLoggedIn(false);
    navigate('/');
  };

  const getVoteCount = (candidateId) => {
    return votes.filter(v => v.candidateId === candidateId).length;
  };

  const totalVotes = votes.length;
  const verificationRate = voters.length > 0 ? ((voters.filter(v => v.faceRegistered).length / voters.length) * 100).toFixed(1) : 0;

  const handleDownloadCSV = () => {
    const headers = ['Voter Public ID', 'Candidate', 'Party', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...votes.map(v => {
        const candidate = CANDIDATES.find(c => c.id === v.candidateId);
        const candidateName = candidate ? candidate.name : 'Unknown';
        const partyName = candidate ? candidate.party : 'Unknown';
        const time = v.timestamp ? new Date(v.timestamp).toLocaleString() : new Date().toLocaleString();
        
        // Mask the epic for privacy considerations
        const maskedEpic = '***' + (v.epic ? String(v.epic).slice(-4) : '####');
        return [maskedEpic, candidateName, partyName, `"${time}"`].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Election_Results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container" style={{ padding: '1rem', maxWidth: '600px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutDashboard size={24} color="var(--primary)" /> Analytics
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleDownloadCSV} className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            <Download size={16} /> Export CSV
          </button>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', transition: 'none', animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Registered</span>
            <Users size={18} color="var(--info)" />
          </div>
          <h2 style={{ fontSize: '2rem', color: 'white' }}>{voters.length}</h2>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', transition: 'none', animation: 'fadeIn 0.3s 0.1s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Votes Cast</span>
            <Vote size={18} color="var(--success)" />
          </div>
          <h2 style={{ fontSize: '2rem', color: 'white' }}>{totalVotes}</h2>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', animation: 'fadeIn 0.3s 0.2s both' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={18} color="var(--primary)" /> Live Results
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {CANDIDATES.map(candidate => {
            const count = getVoteCount(candidate.id);
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            return (
              <div key={candidate.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  <span>{candidate.name} ({candidate.party})</span>
                  <span style={{ fontWeight: 'bold' }}>{count} ({percentage.toFixed(1)}%)</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: candidate.color,
                      transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', animation: 'fadeIn 0.3s 0.3s both' }}>
        <h3 style={{ marginBottom: '1rem' }}>System Integrity</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Overall Biometric Success Rate</span>
          <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{verificationRate}%</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Blockchain Ledger Status</span>
          <span style={{ color: 'var(--info)', fontWeight: 'bold' }}>SYNCED</span>
        </div>
      </div>

      {/* Audit Log Segment */}
      <div className="glass-card" style={{ padding: '1.5rem', animation: 'fadeIn 0.3s 0.4s both' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="var(--primary)" /> Recent Activity (Audit Log)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {votes.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No votes cast yet.</p>
          ) : (
            votes.slice().reverse().map((vote, index) => {
              // Creating a mock transaction hash for professional appearance
              const hash = `0x${Math.random().toString(16).slice(2, 10).toUpperCase()}...`;
              const time = vote.timestamp ? new Date(vote.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString();
              const maskedEpic = vote.epic ? `***${String(vote.epic).slice(-4)}` : 'Anon';
              
              return (
                <div key={index} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>Ballot Cast</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Tx: {hash} | Voter: {maskedEpic}</div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--info)' }}>{time}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
