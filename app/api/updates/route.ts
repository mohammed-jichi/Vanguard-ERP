import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cmntrzsaqapybfhngmdv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_iJZBDyMfGUS2d34DI4lRZw_J8fcucuc';

const supabase = createClient(supabaseUrl, supabaseKey);
const TENANT_ID = '00000000-0000-0000-0000-000000000001';

export interface SystemUpdate {
  id: string;
  commit_hash: string;
  short_hash: string;
  version: string;
  title: string;
  category: 'feature' | 'fix' | 'security' | 'performance' | 'refactor' | 'maintenance';
  description: string;
  bullet_points: string[];
  affected_modules: string[];
  author_name: string;
  author_email?: string;
  is_critical?: boolean;
  deployed_at: string;
  created_at?: string;
}

function getLocalManifest(): SystemUpdate[] {
  try {
    const manifestPath = path.resolve(process.cwd(), 'lib/releases_manifest.json');
    if (fs.existsSync(manifestPath)) {
      const raw = fs.readFileSync(manifestPath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('[API /api/updates] Manifest read error:', err);
  }
  return [];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const category = searchParams.get('category');
    const moduleFilter = searchParams.get('module');

    let updates: SystemUpdate[] = [];

    // 1. Try querying dedicated Supabase table `system_latest_updates`
    try {
      const { data, error } = await supabase
        .from('system_latest_updates')
        .select('*')
        .order('deployed_at', { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        updates = data as SystemUpdate[];
      }
    } catch (e) {
      // Table might not exist yet, fallback gracefully
    }

    // 2. If table empty or unmigrated, query `tenants.feature_flags.system_latest_updates`
    if (updates.length === 0) {
      try {
        const { data: tenant, error: tenantErr } = await supabase
          .from('tenants')
          .select('feature_flags')
          .eq('id', TENANT_ID)
          .maybeSingle();

        if (!tenantErr && tenant?.feature_flags?.system_latest_updates) {
          updates = tenant.feature_flags.system_latest_updates as SystemUpdate[];
        }
      } catch (e) {
        // Fallback to local manifest
      }
    }

    // 3. Bundled releases manifest fallback / merge
    const localUpdates = getLocalManifest();
    const mergedMap = new Map<string, SystemUpdate>();
    localUpdates.forEach(u => mergedMap.set(u.commit_hash || u.id, u));
    updates.forEach(u => mergedMap.set(u.commit_hash || u.id, u));
    updates = Array.from(mergedMap.values());

    // Sort chronologically (newest first)
    updates.sort((a, b) => new Date(b.deployed_at).getTime() - new Date(a.deployed_at).getTime());

    // Apply optional category & module filters
    if (category && category !== 'all') {
      updates = updates.filter(u => u.category === category);
    }
    if (moduleFilter && moduleFilter !== 'all') {
      updates = updates.filter(u => 
        u.affected_modules && u.affected_modules.some(m => m.toLowerCase().includes(moduleFilter.toLowerCase()))
      );
    }

    return NextResponse.json({
      success: true,
      data: updates.slice(0, limit),
      totalCount: updates.length,
      latestVersion: updates[0]?.version || 'v2.4.0',
      lastDeployedAt: updates[0]?.deployed_at || new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[API /api/updates GET] Internal error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve system updates' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    if (!payload || !payload.title) {
      return NextResponse.json(
        { success: false, error: 'Update title is required' },
        { status: 400 }
      );
    }

    const newUpdate: SystemUpdate = {
      id: payload.id || payload.commit_hash || `manual-${Date.now()}`,
      commit_hash: payload.commit_hash || `manual-${Date.now()}`,
      short_hash: payload.short_hash || (payload.commit_hash ? payload.commit_hash.slice(0, 7) : 'manual'),
      version: payload.version || 'v2.4.1',
      title: payload.title,
      category: payload.category || 'feature',
      description: payload.description || payload.title,
      bullet_points: payload.bullet_points || [payload.title],
      affected_modules: payload.affected_modules || ['System Core'],
      author_name: payload.author_name || 'Administrator',
      author_email: payload.author_email || 'admin@vanguard-erp.com',
      is_critical: Boolean(payload.is_critical),
      deployed_at: payload.deployed_at || new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    // 1. Attempt upsert into `system_latest_updates`
    try {
      await supabase.from('system_latest_updates').upsert([newUpdate], { onConflict: 'commit_hash' });
    } catch (e) {}

    // 2. Fetch current tenant feature flags & append/upsert
    try {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', TENANT_ID)
        .maybeSingle();

      const existingFlags = tenant?.feature_flags || {};
      const currentList: SystemUpdate[] = existingFlags.system_latest_updates || getLocalManifest();

      // Deduplicate by commit_hash / id
      const updatedList = [newUpdate, ...currentList.filter(u => u.commit_hash !== newUpdate.commit_hash)];

      await supabase
        .from('tenants')
        .update({
          feature_flags: {
            ...existingFlags,
            system_latest_updates: updatedList,
            system_latest_updates_updated_at: new Date().toISOString(),
          }
        })
        .eq('id', TENANT_ID);
    } catch (e) {
      console.warn('[API /api/updates POST] Tenant sync error:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'System update registered successfully',
      data: newUpdate
    });
  } catch (error: any) {
    console.error('[API /api/updates POST] Internal error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register update' },
      { status: 500 }
    );
  }
}
