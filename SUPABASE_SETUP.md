# Supabase Setup Guide

## Step 1: Disable Row Level Security (RLS)

Row Level Security is preventing INSERT operations. You must disable it:

### Option A: Using SQL (Recommended)
1. Go to Supabase Dashboard → **SQL Editor**
2. Paste and run these commands:

```sql
-- Disable RLS on both tables
ALTER TABLE voters DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;
```

### Option B: Using UI
1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. For each table (`voters`, `votes`), click the table
3. Find the RLS toggle and **disable** it

---

## Step 2: Verify Database Schema

Ensure tables are created with correct column names:

```sql
-- Run in SQL Editor if tables don't exist
CREATE TABLE IF NOT EXISTS voters (
  id SERIAL PRIMARY KEY,
  epic VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  aadhaar VARCHAR(12) UNIQUE NOT NULL,
  faceregistered BOOLEAN DEFAULT FALSE,
  votedfor VARCHAR(50) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS votes (
  id SERIAL PRIMARY KEY,
  epic VARCHAR(20) NOT NULL,
  candidateid VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (epic) REFERENCES voters(epic)
);
```

---

## Step 3: Test Endpoints

```bash
# Test voter registration
curl -X POST http://localhost:5000/api/register-voter \
  -H "Content-Type: application/json" \
  -d '{"epic":"EP001","name":"Test Voter","aadhaar":"123456789012"}'

# Test cast vote
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -d '{"epic":"EP001","candidateId":"1"}'

# Check stored votes
curl http://localhost:5000/api/votes
```

---

## Backend Endpoints

- **GET /api/health** - Server status
- **GET /api/users** - List all voters
- **POST /api/register-voter** - Register a new voter
- **GET /api/votes** - Get all votes cast
- **POST /api/votes** - Cast a vote

---

## Environment Variables

Your `.env` file should have:

```
SUPABASE_URL=https://hwhojtwwgbqbuqvaihqq.supabase.co
SUPABASE_KEY=sb_publishable_V8gxi9h5ZlDdN5DemctyJg_qedH4mUV
PORT=5000
```

All set! Once RLS is disabled, the system will store votes in Supabase.
