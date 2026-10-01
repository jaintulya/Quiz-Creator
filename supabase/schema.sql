-- =========================================================================
-- QuizCraft Supabase Database Schema
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. Create the quizzes table (supports both Google Auth and Username accounts)
CREATE TABLE IF NOT EXISTS public.quizzes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT 'General',
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the app_users table for Username + Password accounts
CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    normalized_username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    course TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- 4. Policies for quizzes (Allows users to manage their quizzes)
DROP POLICY IF EXISTS "Allow read quizzes" ON public.quizzes;
CREATE POLICY "Allow read quizzes" ON public.quizzes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert quizzes" ON public.quizzes;
CREATE POLICY "Allow insert quizzes" ON public.quizzes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update quizzes" ON public.quizzes;
CREATE POLICY "Allow update quizzes" ON public.quizzes FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete quizzes" ON public.quizzes;
CREATE POLICY "Allow delete quizzes" ON public.quizzes FOR DELETE USING (true);

-- 5. Policies for app_users (Allows registration and authentication)
DROP POLICY IF EXISTS "Allow read app_users" ON public.app_users;
CREATE POLICY "Allow read app_users" ON public.app_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert app_users" ON public.app_users;
CREATE POLICY "Allow insert app_users" ON public.app_users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update app_users" ON public.app_users;
CREATE POLICY "Allow update app_users" ON public.app_users FOR UPDATE USING (true);
