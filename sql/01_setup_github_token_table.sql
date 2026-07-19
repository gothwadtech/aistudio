-- 01_setup_github_token_table.sql
-- --------------------------------------------------------------------------------------
-- GOTHWAD AI STUDIO: GitHub Token Storage Setup
-- --------------------------------------------------------------------------------------
-- This SQL script creates a highly secure, RLS-protected table in the public schema
-- to store GitHub Integration Tokens / Personal Access Tokens linked to Supabase users.
--
-- This guarantees that when a user logs in with their Email and Password on ANY device,
-- their GitHub token remains securely saved and synced.
-- --------------------------------------------------------------------------------------

-- 1. Create a table to store GitHub tokens safely
CREATE TABLE IF NOT EXISTS public.github_tokens (
    user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    github_token TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) for complete privacy
ALTER TABLE public.github_tokens ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow users to view ONLY their own GitHub token
CREATE POLICY "Users can select their own token" 
ON public.github_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Policy: Allow users to insert/save their own token
CREATE POLICY "Users can insert their own token" 
ON public.github_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. Policy: Allow users to update their own token
CREATE POLICY "Users can update their own token" 
ON public.github_tokens 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. Policy: Allow users to delete their own token
CREATE POLICY "Users can delete their own token" 
ON public.github_tokens 
FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Trigger to automatically handle 'updated_at' timestamp updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_github_token_updated
    BEFORE UPDATE ON public.github_tokens
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 8. OPTIONAL: Grant permissions to anon and authenticated roles
GRANT ALL ON public.github_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.github_tokens TO service_role;

-- --------------------------------------------------------------------------------------
-- Instructions for use in Supabase Dashboard:
-- 1. Open your Supabase Dashboard (https://supabase.com).
-- 2. Go to the "SQL Editor" section in the left sidebar.
-- 3. Click on "New query".
-- 4. Paste this entire script into the editor.
-- 5. Click the "Run" button.
-- --------------------------------------------------------------------------------------
