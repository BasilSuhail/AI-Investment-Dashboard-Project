# Supabase Setup Instructions

## Step 1: Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up for a free account
3. Click "New Project"
4. Fill in project details:
   - **Name**: cfo-cockpit
   - **Database Password**: (create a strong password and save it)
   - **Region**: Choose closest to your location
5. Wait for project to finish setting up (~2 minutes)

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (for frontend - not used in Phase 1)
   - **service_role key** ⚠️ **SECRET** (for backend)

## Step 3: Configure Environment Variables

1. Navigate to the `backend/` directory
2. Copy the `.env.example` file:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Edit `backend/.env` and add your Supabase credentials:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=your-service-role-key-here
   ```

⚠️ **IMPORTANT**: Never commit the `.env` file to git! It's already in `.gitignore`.

## Step 4: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute the schema

You should see:
- ✅ `market_data_cache` table created
- ✅ `portfolios` table created
- ✅ `optimization_cache` table created
- ✅ Indexes and triggers created

## Step 5: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see three tables:
   - `market_data_cache`
   - `portfolios`
   - `optimization_cache`

## Optional: Enable Row Level Security (RLS)

For production use with authentication:

```sql
-- Enable RLS
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own portfolios
CREATE POLICY "Users can view own portfolios" ON portfolios
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own portfolios" ON portfolios
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
```

## Cache Management

### Automatic Cache Expiration

The backend will check cache timestamps:
- **Market data**: 24-hour TTL
- **Optimization results**: 1-hour TTL

### Manual Cache Clearing (if needed)

```sql
-- Clear all market data cache
DELETE FROM market_data_cache;

-- Clear optimization cache
DELETE FROM optimization_cache;

-- Clear old cache entries (older than 7 days)
DELETE FROM market_data_cache WHERE cached_at < NOW() - INTERVAL '7 days';
DELETE FROM optimization_cache WHERE cached_at < NOW() - INTERVAL '7 days';
```

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran the schema.sql file in SQL Editor
- Check that all tables show up in Table Editor

### Error: "permission denied"
- Make sure you're using the **service_role** key in backend/.env
- The anon key has limited permissions

### Connection timeout
- Check your SUPABASE_URL is correct
- Verify your internet connection
- Check Supabase project status (Settings → General)

## Next Steps

Once Supabase is set up, the backend will automatically:
- Cache market data to reduce API calls
- Store optimization results for faster repeated calculations
- (Future) Save user portfolios for later retrieval
