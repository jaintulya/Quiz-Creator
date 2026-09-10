-- =========================================================================
-- QuizCraft Supabase Database Schema
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Create the quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'General',
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow users to view their own quizzes OR public sample quizzes (where user_id IS NULL)
CREATE POLICY "Allow users to read own and public quizzes"
ON public.quizzes
FOR SELECT
USING (
    auth.uid() = user_id 
    OR user_id IS NULL
);

-- 4. Policy: Allow authenticated users to insert their own quizzes
CREATE POLICY "Allow users to insert own quizzes"
ON public.quizzes
FOR INSERT
WITH CHECK (
    auth.uid() = user_id 
    OR user_id IS NULL
);

-- 5. Policy: Allow users to update their own quizzes
CREATE POLICY "Allow users to update own quizzes"
ON public.quizzes
FOR UPDATE
USING (
    auth.uid() = user_id 
    OR user_id IS NULL
);

-- 6. Policy: Allow users to delete their own quizzes
CREATE POLICY "Allow users to delete own quizzes"
ON public.quizzes
FOR DELETE
USING (
    auth.uid() = user_id 
    OR user_id IS NULL
);

-- 7. Realtime Support (optional, enables live syncing across tabs)
ALTER PUBLICATION supabase_realtime ADD TABLE public.quizzes;
