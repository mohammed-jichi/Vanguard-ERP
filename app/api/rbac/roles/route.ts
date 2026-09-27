import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabaseServerClient } from '@/lib/supabaseClient';
import { RoleDefinition } from '@/types/rbac';
import { CANONICAL_SEED_ROLES } from '@/lib/rbacMasterTree';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'vanguard_accounting_db.json');

function readLocalRoles(): RoleDefinition[] {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = { roles: CANONICAL_SEED_ROLES, last_updated: new Date().toISOString() };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return CANONICAL_SEED_ROLES;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.roles || !Array.isArray(parsed.roles) || parsed.roles.length === 0) {
      parsed.roles = CANONICAL_SEED_ROLES;
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed.roles;
  } catch (err) {
    console.error('[API /api/rbac/roles] Failed to read local roles:', err);
    return CANONICAL_SEED_ROLES;
  }
}

function writeLocalRoles(roles: RoleDefinition[]): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    let parsed: any = {};
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = {};
      }
    }
    parsed.roles = roles;
    parsed.last_updated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
  } catch (err) {
    console.error('[API /api/rbac/roles] Failed to write local roles:', err);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  try {
    // 1. Attempt reading from Supabase
    try {
      const supabase = getSupabaseServerClient();
      const { data: dbRoles, error: rolesErr } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: true });

      if (!rolesErr && dbRoles && dbRoles.length > 0) {
        // Fetch permissions and brand access in parallel
        const [{ data: dbPerms }, { data: dbBrands }] = await Promise.all([
          supabase.from('role_permissions').select('*'),
          supabase.from('role_brand_access').select('*'),
        ]);

        const assembled: RoleDefinition[] = dbRoles.map((r: any) => {
          const permsForRole = (dbPerms || []).filter((p: any) => p.role_id === r.id);
          const brandsForRole = (dbBrands || []).filter((b: any) => b.role_id === r.id);

          const permissionsMap: Record<string, any> = {};
          const actionOverridesMap: Record<string, any> = {};
          const restrictedReportsMap: Record<string, any> = {};

          permsForRole.forEach((p: any) => {
            if (p.node_permissions) {
              Object.assign(permissionsMap, p.node_permissions);
            }
            if (p.action_overrides) {
              actionOverridesMap[p.module_key] = p.action_overrides;
            }
            if (p.restricted_reports) {
              restrictedReportsMap[p.module_key] = p.restricted_reports;
            }
          });

          return {
            id: r.id,
            name: r.name,
            description: r.description || '',
            employee_role: r.employee_role || 'MANAGER',
            is_read_only: Boolean(r.is_read_only),
            assignedCount: r.assigned_count || 0,
            badgeColor: r.badge_color || 'bg-slate-100 text-slate-800 border-slate-200',
            permissions: permissionsMap,
            action_overrides: actionOverridesMap,
            restricted_reports: restrictedReportsMap,
            brand_access: brandsForRole.map((b: any) => b.brand_id),
            created_at: r.created_at,
            updated_at: r.updated_at,
          };
        });

        // Sync with local file cache
        writeLocalRoles(assembled);
        return NextResponse.json({ success: true, roles: assembled, source: 'supabase' }, { headers: CORS_HEADERS });
      }
    } catch (sbError) {
      console.warn('[API /api/rbac/roles] Supabase query bypassed or unavailable, using local persistence:', sbError);
    }

    // 2. Fallback to local-first database
    const localRoles = readLocalRoles();
    return NextResponse.json({ success: true, roles: localRoles, source: 'local' }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('[API /api/rbac/roles] GET error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error' }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let currentRoles = readLocalRoles();

    if (body.roles && Array.isArray(body.roles)) {
      currentRoles = body.roles;
    } else if (body.role && typeof body.role === 'object') {
      const incoming: RoleDefinition = body.role;
      const index = currentRoles.findIndex((r) => r.id === incoming.id);
      if (index >= 0) {
        currentRoles[index] = { ...incoming, updated_at: new Date().toISOString() };
      } else {
        currentRoles.push({
          ...incoming,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } else {
      return NextResponse.json({ success: false, error: 'Invalid request body. Expected { role } or { roles }.' }, { status: 400, headers: CORS_HEADERS });
    }

    // Write to local persistence
    writeLocalRoles(currentRoles);

    // Asynchronously try upserting to Supabase
    (async () => {
      try {
        const supabase = getSupabaseServerClient();
        const roleToSync = body.role || (body.roles ? body.roles[0] : null);
        if (roleToSync) {
          await supabase.from('roles').upsert({
            id: roleToSync.id,
            name: roleToSync.name,
            description: roleToSync.description,
            employee_role: roleToSync.employee_role,
            is_read_only: roleToSync.is_read_only,
            badge_color: roleToSync.badgeColor,
            assigned_count: roleToSync.assignedCount || 0,
            updated_at: new Date().toISOString(),
          });

          await supabase.from('role_permissions').upsert({
            role_id: roleToSync.id,
            module_key: 'unified_rbac_matrix',
            node_permissions: roleToSync.permissions || {},
            action_overrides: roleToSync.action_overrides || {},
            restricted_reports: roleToSync.restricted_reports || {},
            updated_at: new Date().toISOString(),
          }, { onConflict: 'role_id,module_key' });

          if (roleToSync.brand_access && Array.isArray(roleToSync.brand_access)) {
            for (const bId of roleToSync.brand_access) {
              await supabase.from('role_brand_access').upsert({
                role_id: roleToSync.id,
                brand_id: bId,
                brand_name: bId,
                can_view: true,
                can_request: true,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'role_id,brand_id' });
            }
          }
        }
      } catch (err) {
        console.warn('[API /api/rbac/roles] Supabase background sync failed (non-fatal):', err);
      }
    })();

    return NextResponse.json({ success: true, roles: currentRoles }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('[API /api/rbac/roles] POST error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to save role' }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Role id is required' }, { status: 400, headers: CORS_HEADERS });
    }

    if (id === 'r_super') {
      return NextResponse.json({ success: false, error: 'Super Administrator role cannot be deleted' }, { status: 403, headers: CORS_HEADERS });
    }

    let currentRoles = readLocalRoles();
    currentRoles = currentRoles.filter((r) => r.id !== id);
    writeLocalRoles(currentRoles);

    // Asynchronously delete from Supabase if online
    (async () => {
      try {
        const supabase = getSupabaseServerClient();
        await supabase.from('roles').delete().eq('id', id);
      } catch (err) {
        console.warn('[API /api/rbac/roles] Supabase delete sync failed (non-fatal):', err);
      }
    })();

    return NextResponse.json({ success: true, message: `Role ${id} deleted successfully`, roles: currentRoles }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('[API /api/rbac/roles] DELETE error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to delete role' }, { status: 500, headers: CORS_HEADERS });
  }
}
