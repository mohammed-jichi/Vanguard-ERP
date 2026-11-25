import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseClient';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Creates an ERP user or a team member (employee) for a tenant.
 *
 * - erp_user: best-effort row in the global `users` table (no tenant column), and the tenant roster entry in
 *   tenants.feature_flags.erp_users (this roster is what the Organization page lists).
 * - team_member: row in `employees` with tenant_id; role/email metadata in tenants.feature_flags.staff_meta.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = String(body?.id || DEFAULT_TENANT_ID);
    const kind = body?.kind;
    const p = body?.person || {};
    const name = String(p.name || '').trim();
    const email = String(p.email || '').trim().toLowerCase();
    const phone = String(p.phone || '').trim();
    const role = String(p.role || (kind === 'erp_user' ? 'Accountant' : 'Staff')).trim();

    if (!['erp_user', 'team_member'].includes(kind)) {
      return NextResponse.json({ success: false, error: "kind must be 'erp_user' or 'team_member'" }, { status: 400 });
    }
    if (!name) return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
    if (kind === 'erp_user' && !email) return NextResponse.json({ success: false, error: 'Email is required for ERP users' }, { status: 400 });

    const supabase = getSupabaseServerClient();
    const { data: tenant, error: readErr } = await supabase.from('tenants').select('feature_flags').eq('id', tenantId).maybeSingle();
    if (readErr) return NextResponse.json({ success: false, error: readErr.message }, { status: 500 });
    if (!tenant) return NextResponse.json({ success: false, error: `Tenant ${tenantId} not found` }, { status: 404 });

    const flags: Record<string, any> = { ...((tenant.feature_flags as Record<string, any>) || {}) };
    let person: any;
    let linkedToUsersTable = false;

    if (kind === 'erp_user') {
      const roster: any[] = Array.isArray(flags.erp_users) ? flags.erp_users : [];
      if (roster.some((u) => String(u.email || '').toLowerCase() === email)) {
        return NextResponse.json({ success: false, error: 'An ERP user with this email already exists for this tenant' }, { status: 409 });
      }
      let userId: string | null = null;
      try {
        const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
        if (existing?.id) {
          userId = existing.id;
          linkedToUsersTable = true;
        } else {
          const { data: created, error: insErr } = await supabase
            .from('users')
            .insert({ full_name: name, email, role, phone: phone || null })
            .select('id')
            .maybeSingle();
          if (!insErr && created?.id) {
            userId = created.id;
            linkedToUsersTable = true;
          }
        }
      } catch (e) {
        // roster-only fallback
      }
      person = {
        id: userId || `erp-${Date.now()}`,
        name,
        email,
        phone,
        role,
        status: p.status === 'Inactive' ? 'Inactive' : 'Active',
        created_at: new Date().toISOString()
      };
      flags.erp_users = [...roster, person];
    } else {
      const code = `EMP-${Date.now().toString().slice(-6)}`;
      const { data: emp, error: empErr } = await supabase
        .from('employees')
        .insert({ tenant_id: tenantId, full_name: name, phone: phone || null, employee_code: code, is_active: p.status !== 'Inactive' })
        .select('id, full_name, phone, is_active, employee_code')
        .maybeSingle();
      if (empErr || !emp) {
        return NextResponse.json({ success: false, error: empErr?.message || 'Employee insert returned no row (blocked by RLS policy?)' }, { status: 500 });
      }
      const meta: Record<string, any> = flags.staff_meta && typeof flags.staff_meta === 'object' ? { ...flags.staff_meta } : {};
      meta[emp.id] = { role, email };
      flags.staff_meta = meta;
      person = {
        id: emp.id,
        name: emp.full_name,
        phone: emp.phone || '',
        email,
        role,
        status: emp.is_active === false ? 'Inactive' : 'Active',
        code: emp.employee_code
      };
    }

    const { data: updated, error: updErr } = await supabase
      .from('tenants')
      .update({ feature_flags: flags, updated_at: new Date().toISOString() })
      .eq('id', tenantId)
      .select('id');
    if (updErr) return NextResponse.json({ success: false, error: updErr.message }, { status: 500 });
    if (!updated || updated.length === 0) {
      return NextResponse.json({ success: false, error: 'Tenant update wrote no rows (blocked by RLS policy?)' }, { status: 403 });
    }
    return NextResponse.json({ success: true, person, linkedToUsersTable });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error creating person' }, { status: 500 });
  }
}
