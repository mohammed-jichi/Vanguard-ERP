/**
 * Vanguard ERP - System Activities & Audit Logging Engine
 * Centralized audit trail for Super Admin operations, tenant onboarding,
 * feature flag updates, branding changes, and workspace access events.
 */

import { supabase } from './supabaseClient';

export interface SystemActivity {
  id: string;
  tenant_id?: string;
  tenantId?: string;
  company_id?: number | null;
  companyId?: number | null;
  action_type: string;
  actionType?: string;
  description: string;
  performed_by: string;
  performedBy?: string;
  metadata?: any;
  created_at: string;
  createdAt?: string;
}

export interface PaginatedActivitiesResult {
  data: SystemActivity[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const STORAGE_KEY = 'vanguard_system_activities_cache';

const INITIAL_FALLBACK_ACTIVITIES: SystemActivity[] = [
  {
    id: 'act-seed-01',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    company_id: 1300,
    action_type: 'WORKSPACE_PREVIEW',
    description: 'دخول ومعاينة مساحة العمل لمؤسسة منتوجات زيت وزيتون الجنوب (#1300) والتحقق من سلامة توجيه الروابط بدون 404',
    performed_by: 'Super Admin (Mohammed Jichi)',
    metadata: { route: '/1300/dashboard' },
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString() // 15 mins ago
  },
  {
    id: 'act-seed-02',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    company_id: 1300,
    action_type: 'FEATURE_FLAGS_ENFORCED',
    description: 'تطبيق وفحص حراسة المسارات (Route Guards) للوحدات المخصصة وحجب الوحدات المقيدة تلقائياً',
    performed_by: 'System Engine (Vanguard)',
    metadata: { guard: 'ACTIVE' },
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 1.5 hours ago
  },
  {
    id: 'act-seed-03',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    company_id: 1300,
    action_type: 'BRANDING_UPDATED',
    description: 'تحديث الهوية البصرية وتثبيت السمة الرسمية (#123b70 Vanguard Navy) مع شعار المؤسسة الرسمي',
    performed_by: 'Super Admin (Mohammed Jichi)',
    metadata: { color: '#123b70' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() // 6 hours ago
  },
  {
    id: 'act-seed-04',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    company_id: 1300,
    action_type: 'MODULES_CONFIGURED',
    description: 'تأكيد تفعيل كافة الوحدات التسع (المبيعات، العمليات، العملاء، الاستبيانات، الولاء، المحاسبة، الموارد البشرية، الأسطول، وخدمة العملاء)',
    performed_by: 'Super Admin (Mohammed Jichi)',
    metadata: { modulesCount: 9 },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: 'act-seed-05',
    tenant_id: '00000000-0000-0000-0000-000000000001',
    company_id: 1300,
    action_type: 'TENANT_INITIALIZED',
    description: 'تأسيس مساحة العمل الرئيسية للمؤسسة المعتمدة برقم الترخيص 1300 وضبط تسلسل التراخيص التلقائي',
    performed_by: 'Super Admin (System Owner)',
    metadata: { companyId: 1300, tier: 'ENTERPRISE' },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
  }
];

let memoryFallbackActivities: SystemActivity[] = [...INITIAL_FALLBACK_ACTIVITIES];

function getCachedActivities(): SystemActivity[] {
  if (typeof window === 'undefined') {
    return memoryFallbackActivities;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_ACTIVITIES));
      return INITIAL_FALLBACK_ACTIVITIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FALLBACK_ACTIVITIES;
  } catch (e) {
    return memoryFallbackActivities.length > 0 ? memoryFallbackActivities : INITIAL_FALLBACK_ACTIVITIES;
  }
}

function saveCachedActivities(list: SystemActivity[]) {
  const sliced = list.slice(0, 200);
  memoryFallbackActivities = sliced;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sliced));
  } catch (e) {}
}

/**
 * Inserts a new system activity log entry both to Supabase and client fallback cache.
 */
export async function logSystemActivity(params: {
  tenantId?: string;
  companyId?: number | string | null;
  actionType: string;
  description: string;
  performedBy?: string;
  metadata?: any;
}): Promise<{ success: boolean; activity?: SystemActivity; error?: string }> {
  try {
    const nowIso = new Date().toISOString();
    const newEntry: SystemActivity = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      tenant_id: params.tenantId || '00000000-0000-0000-0000-000000000001',
      tenantId: params.tenantId || '00000000-0000-0000-0000-000000000001',
      company_id: params.companyId ? Number(params.companyId) : null,
      companyId: params.companyId ? Number(params.companyId) : null,
      action_type: params.actionType,
      actionType: params.actionType,
      description: params.description,
      performed_by: params.performedBy || 'Super Admin (System Owner)',
      performedBy: params.performedBy || 'Super Admin (System Owner)',
      metadata: params.metadata || {},
      created_at: nowIso,
      createdAt: nowIso
    };

    // 1. Prepend to local storage cache immediately
    const cached = getCachedActivities();
    const updatedCache = [newEntry, ...cached];
    saveCachedActivities(updatedCache);

    // 2. Insert into Supabase database
    try {
      const { error } = await supabase.from('system_activities').insert([
        {
          tenant_id: newEntry.tenant_id,
          company_id: newEntry.company_id,
          action_type: newEntry.action_type,
          description: newEntry.description,
          performed_by: newEntry.performed_by,
          metadata: newEntry.metadata,
          created_at: newEntry.created_at
        }
      ]);

      if (error) {
        console.warn('Notice: Logged to local cache, Supabase insert notice:', error.message);
      }
    } catch (dbErr: any) {
      console.warn('Notice: Logged to local cache, Supabase connection notice:', dbErr?.message);
    }

    return { success: true, activity: newEntry };
  } catch (err: any) {
    console.error('Exception in logSystemActivity:', err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Fetches the latest N activities (default 10) for the dashboard widget.
 */
export async function getRecentSystemActivities(limit = 10): Promise<SystemActivity[]> {
  try {
    const { data, error } = await supabase
      .from('system_activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data && Array.isArray(data) && data.length > 0) {
      const formatted: SystemActivity[] = data.map((row: any) => ({
        ...row,
        tenantId: row.tenant_id,
        companyId: row.company_id,
        actionType: row.action_type,
        performedBy: row.performed_by,
        createdAt: row.created_at
      }));

      // Merge local new entries that might not be synced
      const cached = getCachedActivities();
      const dbIds = new Set(formatted.map(item => item.id));
      const unsynced = cached.filter(item => !dbIds.has(item.id));
      const combined = [...unsynced, ...formatted]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);

      return combined;
    }
  } catch (err) {
    console.warn('Supabase recent activities fetch notice, using fallback cache');
  }

  // Fallback to cached activities
  const fallback = getCachedActivities();
  return fallback.slice(0, limit);
}

/**
 * Fetches server-side paginated activities for the dedicated `/admin/activity` page.
 */
export async function getPaginatedSystemActivities(
  page = 1,
  pageSize = 20
): Promise<PaginatedActivitiesResult> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    const { data, error, count } = await supabase
      .from('system_activities')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data && Array.isArray(data) && data.length > 0) {
      const total = count !== null && count !== undefined ? count : data.length;
      const formatted: SystemActivity[] = data.map((row: any) => ({
        ...row,
        tenantId: row.tenant_id,
        companyId: row.company_id,
        actionType: row.action_type,
        performedBy: row.performed_by,
        createdAt: row.created_at
      }));

      return {
        data: formatted,
        totalCount: total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
        currentPage: page,
        pageSize
      };
    }
  } catch (err) {
    console.warn('Supabase paginated activities fetch notice, using fallback cache');
  }

  // Fallback to local cached array
  const cached = getCachedActivities();
  const total = cached.length;
  const paginatedSlice = cached.slice(from, to + 1);

  return {
    data: paginatedSlice,
    totalCount: total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    currentPage: page,
    pageSize
  };
}

/**
 * Returns user-friendly styling badge tokens and Arabic labels for action types.
 */
export function getActionBadgeConfig(actionType: string): {
  labelAr: string;
  badgeClass: string;
  icon: string;
} {
  const normalized = (actionType || '').toUpperCase();

  switch (normalized) {
    case 'MODULES_UPDATED':
    case 'MODULES_CONFIGURED':
      return {
        labelAr: 'تهيئة الوحدات',
        badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/60',
        icon: '⚙️'
      };
    case 'BRANDING_UPDATED':
      return {
        labelAr: 'تحديث الهوية',
        badgeClass: 'bg-sky-950/80 text-sky-300 border-sky-500/60',
        icon: '🎨'
      };
    case 'TENANT_CREATED':
    case 'TENANT_INITIALIZED':
      return {
        labelAr: 'ترخيص جديد',
        badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60',
        icon: '✨'
      };
    case 'WORKSPACE_PREVIEW':
    case 'WORKSPACE_LAUNCH':
      return {
        labelAr: 'دخول مساحة العمل',
        badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-500/60',
        icon: '🚀'
      };
    case 'FEATURE_FLAGS_ENFORCED':
      return {
        labelAr: 'حراسة الصلاحيات',
        badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/60',
        icon: '🛡️'
      };
    default:
      return {
        labelAr: 'عملية نظام',
        badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
        icon: '📝'
      };
  }
}
