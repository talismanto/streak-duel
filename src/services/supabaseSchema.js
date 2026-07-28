export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- STREAKDUEL - SUPABASE DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor
-- ==========================================

-- 1. Create Profiles Table for Linked Friends
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  avatar_url TEXT,
  color_theme TEXT DEFAULT 'cyan',
  current_streak INT DEFAULT 0,
  best_streak INT DEFAULT 0,
  last_ticked_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Daily Checkins Log Table
CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);

-- 3. Create Habit Challenge Configuration Table
CREATE TABLE IF NOT EXISTS public.habit_config (
  id INT PRIMARY KEY DEFAULT 1,
  title TEXT NOT NULL DEFAULT 'Daily 30-Min Fitness Workout',
  category TEXT DEFAULT 'Fitness & Health',
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_config ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for demonstration & linked friends
CREATE POLICY "Public profiles access" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public checkins access" ON public.checkins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public habit_config access" ON public.habit_config FOR ALL USING (true) WITH CHECK (true);

-- 5. SERVER-SIDE MIDNIGHT CRON JOB (pg_cron)
-- Automatically wipes streak to 0 at midnight if no tick was recorded yesterday
CREATE OR REPLACE FUNCTION reset_inactive_streaks()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET current_streak = 0
  WHERE last_ticked_date IS NULL OR last_ticked_date < (CURRENT_DATE - INTERVAL '1 day');
END;
$$ LANGUAGE plpgsql;

-- Schedule job to run at 00:00 UTC daily (Requires pg_cron extension enabled in Supabase)
-- SELECT cron.schedule('midnight-streak-reset', '0 0 * * *', 'SELECT reset_inactive_streaks();');
`;

export const SUPABASE_SETUP_GUIDE = `
### How to Connect to Supabase Cloud Database:

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** -> Paste the schema above -> Click **Run**.
3. Create your \`.env.local\` file in this project root:
   \`\`\`env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   \`\`\`
4. Install \`npm install @supabase/supabase-supabase-js\` to activate cloud mode!
`;
