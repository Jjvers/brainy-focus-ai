# Database Migration Guide: From Supabase to Local PostgreSQL

This guide explains how to migrate from the Lovable Cloud (Supabase) database to a local PostgreSQL database for localhost development.

## Overview

Your current application uses Supabase (PostgreSQL) hosted by Lovable Cloud. To run this application independently from localhost without Lovable Cloud dependency, you need to:

1. Install PostgreSQL locally
2. Migrate the database schema
3. Update application configuration
4. Migrate data (optional)

## Prerequisites

- Node.js and npm installed
- Basic knowledge of SQL and terminal commands
- Your application code

## Step 1: Install PostgreSQL Locally

### On Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Default port is 5432

### On macOS:
```bash
# Using Homebrew
brew install postgresql@15
brew services start postgresql@15

# Or use Postgres.app
# Download from https://postgresapp.com/
```

### On Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Create Local Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Inside psql prompt:
CREATE DATABASE brainyfocus_db;

# Create a new user (optional but recommended)
CREATE USER brainyfocus_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE brainyfocus_db TO brainyfocus_user;

# Exit psql
\q
```

## Step 3: Export Schema from Supabase

You have two options:

### Option A: Manual Schema Recreation

Based on your `src/integrations/supabase/types.ts`, create the following SQL migration file:

Create file: `migrations/001_initial_schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mulai TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    selesai TIMESTAMPTZ,
    skor_rata NUMERIC,
    durasi_efektif INTEGER,
    material_name TEXT,
    material_category TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Focus details table
CREATE TABLE IF NOT EXISTS focus_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    detik_ke INTEGER NOT NULL,
    skor INTEGER NOT NULL,
    arah_tatapan TEXT,
    status_wajah TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Distractions table
CREATE TABLE IF NOT EXISTS distractions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    waktu TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    jenis TEXT NOT NULL,
    durasi INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Face descriptors table (for face recognition)
CREATE TABLE IF NOT EXISTS face_descriptors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    label TEXT NOT NULL,
    descriptor JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    teks TEXT NOT NULL,
    tanggal TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Study goals table
CREATE TABLE IF NOT EXISTS study_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    target_value NUMERIC NOT NULL,
    current_value NUMERIC DEFAULT 0,
    period TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Study materials table
CREATE TABLE IF NOT EXISTS study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    notes TEXT,
    target_hours NUMERIC,
    progress_percentage NUMERIC DEFAULT 0,
    total_duration NUMERIC DEFAULT 0,
    total_focus_score NUMERIC DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_details_session_id ON focus_details(session_id);
CREATE INDEX IF NOT EXISTS idx_distractions_session_id ON distractions(session_id);
CREATE INDEX IF NOT EXISTS idx_face_descriptors_user_id ON face_descriptors(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_study_goals_user_id ON study_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_study_materials_user_id ON study_materials(user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_face_descriptors_updated_at
    BEFORE UPDATE ON face_descriptors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_goals_updated_at
    BEFORE UPDATE ON study_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_materials_updated_at
    BEFORE UPDATE ON study_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

Apply the migration:
```bash
psql -U brainyfocus_user -d brainyfocus_db -f migrations/001_initial_schema.sql
```

### Option B: Use Supabase CLI (if you have access)

```bash
# Install Supabase CLI
npm install -g supabase

# Login and link project (if you have access credentials)
supabase login
supabase link --project-ref vcslxxkgbrtyfhwuyqpn

# Generate migration from remote
supabase db pull
```

## Step 4: Update Application Configuration

### 4.1 Install PostgreSQL Client Library

```bash
npm install pg
# or if you prefer Prisma ORM
npm install @prisma/client
npm install -D prisma
```

### 4.2 Create Database Configuration File

Create `src/config/database.ts`:

```typescript
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'brainyfocus_db',
  user: process.env.DB_USER || 'brainyfocus_user',
  password: process.env.DB_PASSWORD || 'your_secure_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

### 4.3 Update Environment Variables

Create or update `.env.local`:

```env
# Local PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=brainyfocus_db
DB_USER=brainyfocus_user
DB_PASSWORD=your_secure_password

# Remove or comment out Supabase variables
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_PUBLISHABLE_KEY=...
```

### 4.4 Replace Supabase Client

Update `src/integrations/supabase/client.ts` or create a new database client:

```typescript
import pool from '@/config/database';

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params),
  
  // Helper methods matching Supabase API style
  from: (table: string) => ({
    select: async (columns = '*') => {
      const result = await pool.query(`SELECT ${columns} FROM ${table}`);
      return { data: result.rows, error: null };
    },
    insert: async (data: any) => {
      const keys = Object.keys(data).join(', ');
      const values = Object.values(data);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      const result = await pool.query(
        `INSERT INTO ${table} (${keys}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return { data: result.rows[0], error: null };
    },
    update: (data: any) => ({
      eq: async (column: string, value: any) => {
        const keys = Object.keys(data);
        const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
        const values = [...Object.values(data), value];
        const result = await pool.query(
          `UPDATE ${table} SET ${setClause} WHERE ${column} = $${values.length}`,
          values
        );
        return { data: result.rows, error: null };
      },
    }),
    delete: () => ({
      eq: async (column: string, value: any) => {
        await pool.query(`DELETE FROM ${table} WHERE ${column} = $1`, [value]);
        return { error: null };
      },
    }),
  }),
};
```

## Step 5: Handle Authentication

Since Supabase Auth won't work locally, you need to implement your own authentication:

### Option A: Use Passport.js + JWT

```bash
npm install passport passport-local jsonwebtoken bcrypt
npm install -D @types/passport @types/passport-local @types/jsonwebtoken @types/bcrypt
```

Create `src/auth/passport-config.ts`:

```typescript
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import db from '@/config/database';

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const result = await db.query(
          'SELECT * FROM profiles WHERE email = $1',
          [email]
        );
        
        if (result.rows.length === 0) {
          return done(null, false, { message: 'User not found' });
        }

        const user = result.rows[0];
        // Note: You'll need to add password field to profiles table
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
          return done(null, false, { message: 'Incorrect password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

export default passport;
```

### Option B: Use Clerk or Auth0 (Recommended)

These services provide ready-made authentication:

```bash
# For Clerk
npm install @clerk/clerk-react

# For Auth0
npm install @auth0/auth0-react
```

## Step 6: Handle Edge Functions

Since Supabase Edge Functions won't work, convert them to Express.js API routes:

### Install Express

```bash
npm install express cors
npm install -D @types/express @types/cors
```

### Create API Server

Create `server/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import db from '../src/config/database';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Example: Face auth endpoint (was edge function)
app.post('/api/face-auth', async (req, res) => {
  const { email, user_id } = req.body;
  
  try {
    // Your face authentication logic here
    // Generate JWT token
    // Return response
    res.json({ success: true, token: 'your-jwt-token' });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// More API routes...

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

Update `package.json`:

```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"tsx watch server/index.ts\"",
    "server": "tsx server/index.ts"
  }
}
```

## Step 7: Update Frontend API Calls

Update all frontend calls from `supabase.functions.invoke()` to regular `fetch()`:

```typescript
// Before (Supabase Edge Function)
const { data } = await supabase.functions.invoke('face-auth', {
  body: { email, user_id },
});

// After (Express API)
const response = await fetch('http://localhost:3001/api/face-auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, user_id }),
});
const data = await response.json();
```

## Step 8: Data Migration (Optional)

If you have existing data in Supabase and want to migrate it:

```bash
# Export from Supabase (if you have access)
pg_dump -h db.vcslxxkgbrtyfhwuyqpn.supabase.co \
  -U postgres \
  -d postgres \
  --data-only \
  --table=profiles \
  --table=sessions \
  > data_export.sql

# Import to local database
psql -U brainyfocus_user -d brainyfocus_db -f data_export.sql
```

## Step 9: Testing

1. Start PostgreSQL: `brew services start postgresql` (macOS) or `sudo systemctl start postgresql` (Linux)
2. Start your backend API: `npm run server`
3. Start your frontend: `npm run dev`
4. Test all features:
   - User registration/login
   - Face recognition (may need reconfiguration)
   - Study sessions
   - Data persistence

## Troubleshooting

### Connection Issues
```bash
# Check if PostgreSQL is running
# macOS/Linux
pg_isready

# Windows
pg_ctl status
```

### Permission Errors
```sql
-- Grant all permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO brainyfocus_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO brainyfocus_user;
```

### Port Already in Use
```bash
# Find process using port 5432
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Kill the process or change PostgreSQL port in postgresql.conf
```

## Summary

After completing these steps, your application will run completely independently on localhost without any Lovable Cloud or Supabase dependencies. You'll have:

1. ✅ Local PostgreSQL database with full schema
2. ✅ Local authentication system
3. ✅ Express.js API server replacing Edge Functions
4. ✅ Updated frontend making direct API calls
5. ✅ Complete control over your application stack

## Additional Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Passport.js Documentation: https://www.passportjs.org/
- Express.js Documentation: https://expressjs.com/
- Prisma ORM (alternative): https://www.prisma.io/

## Need Help?

If you encounter issues during migration:
1. Check PostgreSQL logs: `tail -f /usr/local/var/log/postgresql@15.log` (macOS)
2. Verify database connections: `psql -U brainyfocus_user -d brainyfocus_db`
3. Test API endpoints with Postman or curl
4. Review error messages in both frontend and backend consoles
