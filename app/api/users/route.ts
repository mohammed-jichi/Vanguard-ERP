import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabaseServerClient } from '@/lib/supabaseClient';
import { hashPassword, syncSupabaseUserAuth } from '@/lib/authSync';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'vanguard_accounting_db.json');

export interface BranchAccessSetting {
  company_name: string;
  branch_id: string;
  branch_name: string;
  enabled: boolean;
  salesman: string;
  workstation_id: string;
}

export interface EnterpriseUserRecord {
  id: string;
  tenant_id: string;
  user_code: string;
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  pin: string;
  card_number: string;
  role: string;
  role_id: string;
  role_badge?: string;
  branch: string;
  status: 'ACTIVE' | 'INACTIVE';
  is_training?: boolean;
  expiry_date?: string;
  created_by?: string;
  contact?: string;
  last_login?: string;
  branches_access?: BranchAccessSetting[];
  password?: string;
  password_hash?: string;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_BRANCH_ACCESS: BranchAccessSetting[] = [
  {
    company_name: 'منتوجات زيت وزيتون الجنوب ش.م.م.',
    branch_id: '1300',
    branch_name: 'معمل الشويفات المركزي (Choueifat Facility)',
    enabled: true,
    salesman: 'Mahdi',
    workstation_id: '2000',
  },
];

const DEFAULT_USERS: EnterpriseUserRecord[] = [
  {
    id: 'u-641',
    tenant_id: '1300',
    user_code: '641',
    name: 'Mohammed Jichi',
    first_name: 'Mohammed',
    last_name: 'Jichi',
    email: 'mohammed@southernolive-lb.com',
    pin: '1',
    card_number: 'CRD-641',
    role: 'Manager',
    role_id: 'r_manager',
    role_badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    branch: 'معمل الشويفات المركزي (Choueifat Facility)',
    status: 'ACTIVE',
    is_training: false,
    expiry_date: '2028-12-31',
    created_by: 'System Admin',
    contact: '+961 71 384506',
    last_login: 'Today, 09:30 AM',
    created_at: '2024-01-01',
    branches_access: DEFAULT_BRANCH_ACCESS,
  },
  {
    id: 'u-642',
    tenant_id: '1300',
    user_code: '642',
    name: 'Hussien Jichi',
    first_name: 'Hussien',
    last_name: 'Jichi',
    email: 'jamaljichihusseinmahdi@gmail.com',
    pin: '9',
    card_number: 'CRD-642',
    role: 'Manager',
    role_id: 'r_manager',
    role_badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    branch: 'معمل الشويفات المركزي (Choueifat Facility)',
    status: 'ACTIVE',
    is_training: false,
    expiry_date: '2028-12-31',
    created_by: 'System Admin',
    contact: '+961 71 390241',
    last_login: 'Today, 11:42 AM',
    created_at: '2024-05-15',
    branches_access: DEFAULT_BRANCH_ACCESS,
  },
  {
    id: 'u-644',
    tenant_id: '1300',
    user_code: '644',
    name: 'Hussein Jichi',
    first_name: 'Hussein',
    last_name: 'Jichi',
    email: 'hussein.jichi@southernolive-lb.com',
    pin: '5',
    card_number: 'CRD-644',
    role: 'Manager',
    role_id: 'r_manager',
    role_badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    branch: 'معمل الشويفات المركزي (Choueifat Facility)',
    status: 'ACTIVE',
    is_training: false,
    expiry_date: '2028-12-31',
    created_by: 'System Admin',
    contact: '+961 81 958823',
    last_login: 'Yesterday, 04:30 PM',
    created_at: '2024-06-15',
    branches_access: DEFAULT_BRANCH_ACCESS,
  },
  {
    id: 'u-649',
    tenant_id: '1300',
    user_code: '649',
    name: 'Hiba Aloulou',
    first_name: 'Hiba',
    last_name: 'Aloulou',
    email: 'hiba.aloulou@southernolive-lb.com',
    pin: '10',
    card_number: 'CRD-649',
    role: 'Limited Access',
    role_id: 'r_limited',
    role_badge: 'bg-blue-100 text-blue-800 border-blue-200',
    branch: 'معمل الشويفات المركزي (Choueifat Facility)',
    status: 'ACTIVE',
    is_training: false,
    expiry_date: '2028-12-31',
    created_by: 'System Admin',
    contact: '+961 78 846247',
    last_login: 'Yesterday, 02:15 PM',
    created_at: '2024-07-01',
    branches_access: DEFAULT_BRANCH_ACCESS,
  },
];

function readLocalUsers(): EnterpriseUserRecord[] {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = { users: DEFAULT_USERS, last_updated: new Date().toISOString() };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return DEFAULT_USERS;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.users || !Array.isArray(parsed.users) || parsed.users.length === 0) {
      parsed.users = DEFAULT_USERS;
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed.users;
  } catch (err) {
    console.error('[API /api/users] Failed to read local users:', err);
    return DEFAULT_USERS;
  }
}

function writeLocalUsers(users: EnterpriseUserRecord[]): void {
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
    parsed.users = users;
    parsed.last_updated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
  } catch (err) {
    console.error('[API /api/users] Failed to write local users:', err);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || '1300';

    // 1. Attempt reading from Supabase
    try {
      const supabase = getSupabaseServerClient();
      const { data: dbUsers, error } = await supabase
        .from('users')
        .select('*')
        .or(`tenant_id.eq.${tenantId},tenant_id.eq.1300,tenant_id.eq.00000000-0000-0000-0000-000000000001`)
        .order('user_code', { ascending: true });

      if (!error && dbUsers && dbUsers.length > 0) {
        const localList = readLocalUsers();
        const localMap = new Map(localList.map((u) => [u.id, u]));
        const localEmailMap = new Map(localList.filter(u => u.email).map(u => [u.email!.toLowerCase(), u]));

        const mapped: EnterpriseUserRecord[] = dbUsers.map((u: any) => {
          const emailLower = (u.email || '').toLowerCase();
          const localMatch = localMap.get(u.id) || (emailLower ? localEmailMap.get(emailLower) : undefined);
          const effectivePass = localMatch?.password || u.password || (u.pin ? String(u.pin) : undefined);

          return {
            id: u.id || `u-${u.user_code || Date.now()}`,
            tenant_id: String(u.tenant_id || tenantId),
            user_code: String(u.user_code || u.code || ''),
            name: u.name || u.display_name || 'Operator',
            first_name: u.first_name || localMatch?.first_name,
            last_name: u.last_name || localMatch?.last_name,
            email: u.email || localMatch?.email || '',
            password: effectivePass,
            password_hash: localMatch?.password_hash || (effectivePass ? hashPassword(effectivePass) : undefined),
            pin: String(u.pin || localMatch?.pin || effectivePass || ''),
            card_number: String(u.card_number || u.badge_number || ''),
            role: u.role_name || u.role || 'Enterprise Operator',
            role_id: u.role_id || 'r_cashier',
            role_badge: u.role_badge || 'bg-slate-100 text-slate-800 border-slate-200',
            branch: u.branch || 'Choueifat Central Plant',
            status: u.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
            contact: u.contact || u.phone || '',
            last_login: u.last_login || 'Recently',
            branches_access: localMatch?.branches_access || DEFAULT_BRANCH_ACCESS,
            created_at: u.created_at,
            updated_at: u.updated_at,
          };
        });

        writeLocalUsers(mapped);
        return NextResponse.json({ success: true, users: mapped, source: 'supabase' }, { headers: CORS_HEADERS });
      }
    } catch (sbErr) {
      console.warn('[API /api/users] Supabase query bypassed or unavailable, using local persistence:', sbErr);
    }

    // 2. Fallback to local-first database
    const localUsers = readLocalUsers();
    return NextResponse.json({ success: true, users: localUsers, source: 'local' }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('[API /api/users] GET error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Internal server error' }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let currentUsers = readLocalUsers();

    if (body.users && Array.isArray(body.users)) {
      currentUsers = body.users;
    } else if (body.user && typeof body.user === 'object') {
      const incoming: EnterpriseUserRecord = body.user;
      const index = currentUsers.findIndex(
        (u) =>
          u.id === incoming.id ||
          (incoming.user_code && u.user_code === incoming.user_code) ||
          (incoming.email && u.email && u.email.toLowerCase() === incoming.email.toLowerCase())
      );

      const existingUser = index >= 0 ? currentUsers[index] : null;
      const effectivePassword = incoming.password?.trim() || existingUser?.password;
      const effectiveHash = effectivePassword ? hashPassword(effectivePassword) : (incoming.password_hash || existingUser?.password_hash);
      const effectivePin = incoming.pin || effectivePassword || existingUser?.pin || '1001';

      const mergedUser: EnterpriseUserRecord = {
        ...(existingUser || {}),
        ...incoming,
        password: effectivePassword,
        password_hash: effectiveHash,
        pin: effectivePin,
        updated_at: new Date().toISOString(),
      };

      if (index >= 0) {
        currentUsers[index] = mergedUser;
      } else {
        mergedUser.id = incoming.id || `u-${Date.now()}`;
        mergedUser.created_at = new Date().toISOString();
        currentUsers.unshift(mergedUser);
      }

      // If user has a password and email, keep auth store synchronized
      if (effectivePassword && incoming.email) {
        syncSupabaseUserAuth(incoming.email, effectivePassword, mergedUser).catch((err) => {
          console.warn('[API /api/users] syncSupabaseUserAuth non-fatal error:', err);
        });
      }
    } else {
      return NextResponse.json({ success: false, error: 'Invalid body. Expected { user } or { users }.' }, { status: 400, headers: CORS_HEADERS });
    }

    // Write to local persistence
    writeLocalUsers(currentUsers);

    // Asynchronously try upserting to Supabase
    (async () => {
      try {
        const supabase = getSupabaseServerClient();
        const userToSync = body.user || (body.users ? body.users[0] : null);
        if (userToSync) {
          await supabase.from('users').upsert({
            id: userToSync.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userToSync.id)
              ? userToSync.id
              : undefined,
            tenant_id: userToSync.tenant_id || '1300',
            user_code: userToSync.user_code,
            name: userToSync.name,
            email: userToSync.email || null,
            pin: userToSync.pin,
            card_number: userToSync.card_number,
            role: userToSync.role,
            role_id: userToSync.role_id,
            branch: userToSync.branch,
            status: userToSync.status,
            contact: userToSync.contact,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'email' });
        }
      } catch (err) {
        console.warn('[API /api/users] Supabase background sync failed (non-fatal):', err);
      }
    })();

    return NextResponse.json({ success: true, users: currentUsers }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('[API /api/users] POST error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to save user' }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body?.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'User id is required' }, { status: 400, headers: CORS_HEADERS });
    }

    let currentUsers = readLocalUsers();
    currentUsers = currentUsers.filter((u) => u.id !== id);
    writeLocalUsers(currentUsers);

    // Asynchronously delete from Supabase if online
    (async () => {
      try {
        const supabase = getSupabaseServerClient();
        await supabase.from('users').delete().eq('id', id);
      } catch (err) {
        console.warn('[API /api/users] Supabase delete sync failed (non-fatal):', err);
      }
    })();

    return NextResponse.json({ success: true, message: `User ${id} deleted successfully`, users: currentUsers }, { headers: CORS_HEADERS });
  } catch (error: any) {
    console.error('[API /api/users] DELETE error:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Failed to delete user' }, { status: 500, headers: CORS_HEADERS });
  }
}
