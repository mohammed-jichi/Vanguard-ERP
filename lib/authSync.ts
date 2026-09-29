import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, getSupabaseServerClient } from './supabaseClient';
import type { EnterpriseUserRecord, BranchAccessSetting } from '@/app/api/users/route';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'vanguard_accounting_db.json');

export const DEFAULT_BRANCH_ACCESS: BranchAccessSetting[] = [
  {
    company_name: 'منتوجات زيت وزيتون الجنوب ش.م.م.',
    branch_id: '1300',
    branch_name: 'معمل الشويفات المركزي (Choueifat Facility)',
    enabled: true,
    salesman: 'Mahdi',
    workstation_id: '2000',
  },
];

export const DEFAULT_USERS: EnterpriseUserRecord[] = [
  {
    id: 'u-101',
    tenant_id: '1300',
    user_code: '101',
    name: 'Hussien Jichi',
    first_name: 'Hussien',
    last_name: 'Jichi',
    email: 'jamaljichihusseinmahdi@gmail.com',
    password: '1001',
    password_hash: hashPassword('1001'),
    pin: '1001',
    card_number: 'CRD-1001',
    role: 'Manager',
    role_id: 'r_manager',
    role_badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    branch: 'معمل الشويفات المركزي (Choueifat Facility)',
    status: 'ACTIVE',
    is_training: false,
    expiry_date: '2026-12-10',
    created_by: 'Jamal Jichi',
    contact: '+961 70 112233',
    last_login: 'Today, 11:42 AM',
    created_at: '2024-05-15',
    branches_access: DEFAULT_BRANCH_ACCESS,
  },
  {
    id: 'u-102',
    tenant_id: '1300',
    user_code: '102',
    name: 'Ali Hassan',
    first_name: 'Ali',
    last_name: 'Hassan',
    email: 'ali.hassan@southernolive-lb.com',
    password: '1002',
    password_hash: hashPassword('1002'),
    pin: '1002',
    card_number: 'CRD-1002',
    role: 'Limited Access',
    role_id: 'r_limited',
    role_badge: 'bg-blue-100 text-blue-800 border-blue-200',
    branch: 'معمل الشويفات المركزي (Choueifat Facility)',
    status: 'ACTIVE',
    is_training: false,
    expiry_date: '2027-01-15',
    created_by: 'Jamal Jichi',
    contact: '+961 71 445566',
    last_login: 'Today, 08:15 AM',
    created_at: '2024-06-01',
    branches_access: DEFAULT_BRANCH_ACCESS,
  },
  {
    id: 'u-103',
    tenant_id: '1300',
    user_code: '103',
    name: 'Sarah Khoury',
    first_name: 'Sarah',
    last_name: 'Khoury',
    email: 's.khoury@southernolive-lb.com',
    password: '1003',
    password_hash: hashPassword('1003'),
    pin: '1003',
    card_number: 'CRD-1003',
    role: 'Manager',
    role_id: 'r_manager',
    role_badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    branch: 'معمل الشويفات المركزي (Choueifat Facility)',
    status: 'ACTIVE',
    is_training: true,
    expiry_date: '2026-11-20',
    created_by: 'Jamal Jichi',
    contact: '+961 03 778899',
    last_login: 'Yesterday, 04:30 PM',
    created_at: '2024-06-15',
    branches_access: DEFAULT_BRANCH_ACCESS,
  },
  {
    id: 'u-104',
    tenant_id: '1300',
    user_code: '104',
    name: 'Omar Zaiter',
    first_name: 'Omar',
    last_name: 'Zaiter',
    email: 'omar.z@southernolive-lb.com',
    password: '1004',
    password_hash: hashPassword('1004'),
    pin: '1004',
    card_number: 'CRD-1004',
    role: 'Limited Access',
    role_id: 'r_limited',
    role_badge: 'bg-slate-100 text-slate-800 border-slate-200',
    branch: 'معمل الشويفات المركزي (Choueifat Facility)',
    status: 'INACTIVE',
    is_training: false,
    expiry_date: '2025-08-30',
    created_by: 'Jamal Jichi',
    contact: '+961 76 332211',
    last_login: '2025-08-25, 09:00 AM',
    created_at: '2024-07-01',
    branches_access: DEFAULT_BRANCH_ACCESS,
  },
  {
    id: 'u-105',
    tenant_id: '1300',
    user_code: '105',
    name: 'Nour Mansour',
    first_name: 'Nour',
    last_name: 'Mansour',
    email: 'nour.m@southernolive-lb.com',
    password: '1005',
    password_hash: hashPassword('1005'),
    pin: '1005',
    card_number: 'CRD-1005',
    role: 'Limited Access',
    role_id: 'r_limited',
    role_badge: 'bg-blue-100 text-blue-800 border-blue-200',
    branch: 'معمل الشويفات المركزي (Choueifat Facility)',
    status: 'ACTIVE',
    is_training: true,
    expiry_date: '2026-09-15',
    created_by: 'Jamal Jichi',
    contact: '+961 71 990011',
    last_login: 'Yesterday, 02:15 PM',
    created_at: '2024-07-10',
    branches_access: DEFAULT_BRANCH_ACCESS,
  },
];

export function hashPassword(password: string): string {
  if (!password) return '';
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function verifyPassword(
  attempt: string,
  storedPassword?: string | null,
  storedHash?: string | null,
  pin?: string | null
): boolean {
  if (!attempt) return false;
  const trimmed = attempt.trim();

  // 1. Plaintext match
  if (storedPassword && storedPassword === trimmed) {
    return true;
  }

  // 2. Hash match against storedHash
  const attemptHash = hashPassword(trimmed);
  if (storedHash && storedHash.toLowerCase() === attemptHash.toLowerCase()) {
    return true;
  }

  // 3. Match against storedPassword if it's already a SHA-256 hash
  if (storedPassword && storedPassword.toLowerCase() === attemptHash.toLowerCase()) {
    return true;
  }

  // 4. Match against PIN (for POS/Kiosk operator numeric logins)
  if (pin && pin.trim() === trimmed) {
    return true;
  }

  // 5. Default credentials fallback for initial demo/factory accounts
  if ((!storedPassword && !storedHash) && (trimmed === '123456' || trimmed === '1001' || trimmed === 'admin123')) {
    return true;
  }

  return false;
}

export function getSupabaseAdminClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;
  return createClient(SUPABASE_URL, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function readLocalUsers(): EnterpriseUserRecord[] {
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
    console.error('[authSync] Failed to read local users:', err);
    return DEFAULT_USERS;
  }
}

export function writeLocalUsers(users: EnterpriseUserRecord[]): void {
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
    console.error('[authSync] Failed to write local users:', err);
  }
}

export function updateUserInLocalDb(
  email: string,
  newPassword: string,
  userId?: string,
  userData?: Partial<EnterpriseUserRecord>
): { success: boolean; user?: EnterpriseUserRecord } {
  try {
    const users = readLocalUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    const pHash = hashPassword(newPassword);

    let foundIdx = -1;
    if (userId) {
      foundIdx = users.findIndex((u) => u.id === userId);
    }
    if (foundIdx === -1 && cleanEmail) {
      foundIdx = users.findIndex((u) => (u.email || '').trim().toLowerCase() === cleanEmail);
    }

    if (foundIdx >= 0) {
      const existing = users[foundIdx];
      users[foundIdx] = {
        ...existing,
        ...(userData || {}),
        password: newPassword,
        password_hash: pHash,
        pin: newPassword,
        updated_at: new Date().toISOString(),
      };
      writeLocalUsers(users);
      return { success: true, user: users[foundIdx] };
    } else {
      // User not in local list -> register them
      const nextUserCode = (users.length > 0 ? Math.max(...users.map((u) => parseInt(u.user_code, 10) || 100)) + 1 : 101).toString();
      const newUser: EnterpriseUserRecord = {
        id: userId || `u-${Date.now()}`,
        tenant_id: userData?.tenant_id || '1300',
        user_code: userData?.user_code || nextUserCode,
        name: userData?.name || cleanEmail.split('@')[0],
        first_name: userData?.first_name,
        last_name: userData?.last_name,
        email: cleanEmail,
        password: newPassword,
        password_hash: pHash,
        pin: newPassword,
        card_number: userData?.card_number || `CRD-${nextUserCode}`,
        role: userData?.role || 'Manager',
        role_id: userData?.role_id || 'r_manager',
        role_badge: userData?.role_badge || 'bg-emerald-100 text-emerald-800 border-emerald-200',
        branch: userData?.branch || 'معمل الشويفات المركزي (Choueifat Facility)',
        status: userData?.status || 'ACTIVE',
        is_training: userData?.is_training ?? false,
        branches_access: userData?.branches_access || DEFAULT_BRANCH_ACCESS,
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      users.unshift(newUser);
      writeLocalUsers(users);
      return { success: true, user: newUser };
    }
  } catch (err) {
    console.error('[authSync] Failed to update user in local db:', err);
    return { success: false };
  }
}

export async function syncSupabaseUserAuth(
  email: string,
  password: string,
  userData?: {
    userId?: string;
    name?: string;
    tenant_id?: string;
    pin?: string;
  }
): Promise<{ success: boolean; updatedAuth: boolean; updatedDb: boolean; error?: string }> {
  let updatedAuth = false;
  let updatedDb = false;
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, updatedAuth: false, updatedDb: false, error: 'Email is required' };
  }

  // 1. Supabase Auth Admin API (if SUPABASE_SERVICE_ROLE_KEY is configured)
  const adminClient = getSupabaseAdminClient();
  if (adminClient) {
    try {
      let targetAuthId = userData?.userId;
      const isUuid = targetAuthId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetAuthId);

      if (isUuid) {
        const { error: updateErr } = await adminClient.auth.admin.updateUserById(targetAuthId, {
          password: password,
          email_confirm: true,
        });
        if (!updateErr) {
          updatedAuth = true;
        }
      }

      if (!updatedAuth) {
        // List users to locate by email
        const { data: usersData, error: listErr } = await adminClient.auth.admin.listUsers();
        if (!listErr && usersData?.users) {
          const matched = usersData.users.find(
            (u) => (u.email || '').toLowerCase() === cleanEmail
          );
          if (matched) {
            const { error: updErr } = await adminClient.auth.admin.updateUserById(matched.id, {
              password: password,
              email_confirm: true,
              user_metadata: {
                ...matched.user_metadata,
                name: userData?.name || matched.user_metadata?.name,
                tenant_id: userData?.tenant_id || matched.user_metadata?.tenant_id || '1300',
              },
            });
            if (!updErr) updatedAuth = true;
          } else {
            // User does not exist in Supabase auth.users -> create them so login succeeds!
            const { error: createErr } = await adminClient.auth.admin.createUser({
              email: cleanEmail,
              password: password,
              email_confirm: true,
              user_metadata: {
                name: userData?.name || 'Vanguard User',
                tenant_id: userData?.tenant_id || '1300',
              },
            });
            if (!createErr) updatedAuth = true;
          }
        }
      }
    } catch (authAdminErr) {
      console.warn('[authSync] Supabase Auth Admin API sync error:', authAdminErr);
    }
  }

  // 2. Supabase database tables (users & profiles)
  try {
    const serverClient = getSupabaseServerClient();
    const pHash = hashPassword(password);
    const pin = userData?.pin || password;

    await serverClient
      .from('users')
      .upsert(
        {
          id: userData?.userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userData.userId)
            ? userData.userId
            : undefined,
          email: cleanEmail,
          pin: pin,
          password_hash: pHash,
          name: userData?.name,
          tenant_id: userData?.tenant_id || '1300',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      );

    updatedDb = true;
  } catch (dbErr) {
    console.warn('[authSync] Supabase DB sync error:', dbErr);
  }

  return { success: true, updatedAuth, updatedDb };
}
