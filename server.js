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
    
    const options = {
      method: method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: data ? JSON.parse(data) : null
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
    
    const { epic, name, aadhaar, faceRegistered } = req.body;
    
    if (!epic || !name || !aadhaar) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const result = await supabaseRequest('voters', 'POST', 
      { epic, name, aadhaar, faceregistered: faceRegistered || false }
    );
    
    if (result.status >= 200 && result.status < 300) {
      res.json({ success: true, data: result.body });
    } else {
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
    
    const result = await supabaseRequest('votes', 'POST', 
      { epic, candidateid: candidateId, timestamp: timestamp || new Date().toISOString() }
    );
    
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
