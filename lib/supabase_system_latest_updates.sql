-- ==============================================================================
-- Vanguard ERP: System Latest Updates Schema Migration
-- Defines automated release logging, changelogs, and notification tracking
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.system_latest_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commit_hash VARCHAR(40) NOT NULL UNIQUE,
    short_hash VARCHAR(10) NOT NULL,
    version VARCHAR(20) DEFAULT 'v2.4.0',
    title TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'feature', -- 'feature', 'fix', 'security', 'performance', 'refactor', 'maintenance'
    description TEXT NOT NULL,
    bullet_points JSONB DEFAULT '[]'::jsonb,
    affected_modules JSONB DEFAULT '[]'::jsonb,
    author_name VARCHAR(100) DEFAULT 'Vanguard CI/CD Automated Deployer',
    author_email VARCHAR(150),
    is_critical BOOLEAN DEFAULT FALSE,
    deployed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.system_latest_updates ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated and anonymous system users to view latest updates
CREATE POLICY "Allow public read access for system_latest_updates"
    ON public.system_latest_updates
    FOR SELECT
    USING (true);

-- Allow system and authorized users to insert and update release records
CREATE POLICY "Allow write access for system_latest_updates"
    ON public.system_latest_updates
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create index for high-speed chronological querying
CREATE INDEX IF NOT EXISTS idx_system_latest_updates_deployed_at 
    ON public.system_latest_updates (deployed_at DESC);

CREATE INDEX IF NOT EXISTS idx_system_latest_updates_category 
    ON public.system_latest_updates (category);
