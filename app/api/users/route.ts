import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'vanguard_accounting_db.json');

export interface EnterpriseUserRecord {
  id: string;
  tenant_id: string;
  user_code: string;
  name: string;
  email?: string;
  pin: string;
  card_number: string;
  role: string;
  role_id: string;
  role_badge?: string;
  branch: string;
  status: 'ACTIVE' | 'INACTIVE';
  contact?: string;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_USERS: EnterpriseUserRecord[] = [
  {
    id: 'u-101',
    tenant_id: '1300',
    user_code: '101',
    name: 'Jichi Mohammed',
    email: 'mohammed@vanguard-erp.com',
    pin: '1001',
    card_number: 'CRD-1001',
    role: 'General Operations & Mill Manager',
    role_id: 'r_ops',
    role_badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    branch: 'Choueifat Central Plant',
    status: 'ACTIVE',
    contact: '+961 70 112233',
    last_login: 'Today, 11:42 AM',
    created_at: new Date().toISOString(),
  },
  {
    id: 'u-102',
    tenant_id: '1300',
    user_code: '102',
    name: 'Ali Hassan',
    email: 'ali.hassan@southernolive-lb.com',
    pin: '1002',
    card_number: 'CRD-1002',
    role: 'Super Administrator',
    role_id: 'r_super',
    role_badge: 'bg-red-100 text-red-800 border-red-200',
    branch: 'Choueifat Production Mill',
    status: 'ACTIVE',
    contact: '+961 71 445566',
    last_login: 'Today, 08:15 AM',
    created_at: new Date().toISOString(),
  },
  {
    id: 'u-103',
    tenant_id: '1300',
    user_code: '103',
    name: 'Sarah Khoury',
    email: 's.khoury@southernolive-lb.com',
    pin: '1003',
    card_number: 'CRD-1003',
    role: 'Senior Financial Accountant',
    role_id: 'r_accountant',
    role_badge: 'bg-amber-100 text-amber-800 border-amber-200',
    branch: 'Beirut Corporate Hub',
    status: 'ACTIVE',
    contact: '+961 03 778899',
    last_login: 'Yesterday, 04:30 PM',
    created_at: new Date().toISOString(),
  },
  {
    id: 'u-104',
    tenant_id: '1300',
    user_code: '104',
    name: 'Omar Zaiter',
    email: 'omar.z@southernolive-lb.com',
    pin: '1004',
    card_number: 'CRD-1004',
    role: 'POS Terminal Cashier',
    role_id: 'r_cashier',
    role_badge: 'bg-blue-100 text-blue-800 border-blue-200',
    branch: 'Choueifat Cashier Desk',
    status: 'ACTIVE',
    contact: '+961 76 332211',
    last_login: 'Today, 09:00 AM',
    created_at: new Date().toISOString(),
  },
  {
    id: 'u-105',
    tenant_id: '1300',
    user_code: '105',
    name: 'Hussein Baydoun',
    email: 'h.baydoun@southernolive-lb.com',
    pin: '1005',
    card_number: 'CRD-1005',
    role: 'SuperSonic Fleet Lead & Driver',
    role_id: 'r_driver',
    role_badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    branch: 'Distribution Fleet',
    status: 'ACTIVE',
    contact: '+961 70 889900',
    last_login: 'Today, 07:45 AM',
    created_at: new Date().toISOString(),
  },
  {
    id: 'u-106',
    tenant_id: '1300',
    user_code: '106',
    name: 'Nour Mansour',
    email: 'nour.m@southernolive-lb.com',
    pin: '1006',
    card_number: 'CRD-1006',
    role: 'Commercial Field Sales Representative',
    role_id: 'r_sales',
    role_badge: 'bg-purple-100 text-purple-800 border-purple-200',
    branch: 'South Lebanon District',
    status: 'ACTIVE',
    contact: '+961 71 990011',
    last_login: 'Yesterday, 02:15 PM',
    created_at: new Date().toISOString(),
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
        const mapped: EnterpriseUserRecord[] = dbUsers.map((u: any) => ({
          id: u.id || `u-${u.user_code || Date.now()}`,
          tenant_id: String(u.tenant_id || tenantId),
          user_code: String(u.user_code || u.code || ''),
          name: u.name || u.display_name || 'Operator',
          email: u.email || '',
          pin: String(u.pin || u.password_hash || ''),
          card_number: String(u.card_number || u.badge_number || ''),
          role: u.role_name || u.role || 'Enterprise Operator',
          role_id: u.role_id || 'r_cashier',
          role_badge: u.role_badge || 'bg-slate-100 text-slate-800 border-slate-200',
          branch: u.branch || 'Choueifat Central Plant',
          status: u.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
          contact: u.contact || u.phone || '',
          last_login: u.last_login || 'Recently',
          created_at: u.created_at,
          updated_at: u.updated_at,
        }));

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
      const index = currentUsers.findIndex((u) => u.id === incoming.id || (incoming.user_code && u.user_code === incoming.user_code));
      if (index >= 0) {
        currentUsers[index] = {
          ...currentUsers[index],
          ...incoming,
          updated_at: new Date().toISOString(),
        };
      } else {
        currentUsers.unshift({
          ...incoming,
          id: incoming.id || `u-${Date.now()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
            id: userToSync.id,
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
          });
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
