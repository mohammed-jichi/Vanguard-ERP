import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cmntrzsaqapybfhngmdv.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_iJZBDyMfGUS2d34DI4lRZw_J8fcucuc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
