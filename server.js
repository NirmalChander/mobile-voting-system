import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running perfectly!' });
});

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Helper function to make Supabase REST calls
function supabaseRequest(table, method = 'GET', body = null, query = '') {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`);
    
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    // Ask Supabase to return the created/updated row and merge duplicates for write operations
    if (['POST', 'PATCH', 'PUT'].includes(method.toUpperCase())) {
      headers['Prefer'] = 'return=representation,resolution=merge-duplicates';
    }

    const options = { method: method, headers };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
          let parsed = null;
          try {
            parsed = data ? JSON.parse(data) : null;
          } catch (e) {
            parsed = null;
          }
          resolve({
            status: res.statusCode,
            body: parsed
          });
        });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Get users endpoint
app.get('/api/users', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ success: false, message: 'Supabase not configured' });
    }
    
    const result = await supabaseRequest('voters', 'GET', null, 'select=epic,name,aadhaar,faceregistered');
    
    if (result.status >= 200 && result.status < 300) {
      res.json({ success: true, data: result.body });
    } else {
      res.status(result.status).json({ success: false, message: 'Failed to fetch users', error: result.body });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Register a voter endpoint
app.post('/api/register-voter', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ success: false, message: 'Supabase not configured' });
    }
    
    let { epic, name, aadhaar, faceRegistered } = req.body;

    if (!name || !aadhaar) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Helper to check EPIC existence
    const epicExists = async (candidate) => {
      const check = await supabaseRequest('voters', 'GET', null, `epic=eq.${encodeURIComponent(candidate)}&select=*`);
      if (check.status >= 200 && check.status < 300 && Array.isArray(check.body) && check.body.length > 0) return check.body[0];
      return null;
    };

    // If epic provided by client, prefer server ownership: if it exists return it
    if (epic) {
      const existing = await epicExists(epic);
      if (existing) {
        return res.json({ success: true, data: [existing] });
      }
    }

    // Generate server-side EPIC if not provided or if client-generated pattern detected
    const shouldGenerate = !epic || /^IND\d+$/.test(epic);
    if (shouldGenerate) {
      let attempts = 0;
      let generated = null;
      while (attempts < 10) {
        const candidate = `IND${Math.floor(Math.random() * 9000000) + 1000000}`;
        const exists = await epicExists(candidate);
        if (!exists) { generated = candidate; break; }
        attempts++;
      }
      if (!generated) return res.status(500).json({ success: false, message: 'Failed to generate unique EPIC' });
      epic = generated;
    }

    // Insert new voter
    const result = await supabaseRequest('voters', 'POST', { epic, name, aadhaar, faceregistered: !!faceRegistered });
    
    if (result.status >= 200 && result.status < 300) {
      res.json({ success: true, data: result.body });
    } else {
      // Handle duplicate key race: fetch existing record and return it
      const errCode = result.body && (result.body.code || result.body.message);
      const isDuplicate = errCode === '23505' || errCode === 23505 || (typeof errCode === 'string' && errCode.toString().includes('duplicate'));
      if (isDuplicate) {
        const existing = await supabaseRequest('voters', 'GET', null, `epic=eq.${encodeURIComponent(epic)}&select=*`);
        if (existing.status >= 200 && existing.status < 300 && Array.isArray(existing.body)) {
          res.json({ success: true, data: existing.body });
          return;
        }
      }
      res.status(result.status).json({ success: false, message: 'Failed to register voter', error: result.body });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all votes endpoint
app.get('/api/votes', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ success: false, message: 'Supabase not configured' });
    }
    
    const result = await supabaseRequest('votes', 'GET', null, 'select=*');
    
    if (result.status >= 200 && result.status < 300) {
      res.json({ success: true, data: result.body });
    } else {
      res.status(result.status).json({ success: false, message: 'Failed to fetch votes', error: result.body });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Cast a vote endpoint
app.post('/api/votes', async (req, res) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ success: false, message: 'Supabase not configured' });
    }
    
    const { epic, candidateId, timestamp } = req.body;
    
    if (!epic || !candidateId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    // Prevent double voting: check if epic already has a vote
    const existingVote = await supabaseRequest('votes', 'GET', null, `epic=eq.${encodeURIComponent(epic)}&select=*`);
    if (existingVote.status >= 200 && existingVote.status < 300 && Array.isArray(existingVote.body) && existingVote.body.length > 0) {
      return res.status(409).json({ success: false, message: 'This EPIC has already cast a vote' });
    }

    const result = await supabaseRequest('votes', 'POST', { epic, candidateid: candidateId, timestamp: timestamp || new Date().toISOString() });
    
    if (result.status >= 200 && result.status < 300) {
      res.json({ success: true, data: result.body, message: 'Vote cast successfully' });
    } else {
      res.status(result.status).json({ success: false, message: 'Failed to cast vote', error: result.body });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Add your API routes here
// app.use('/api/users', userRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
