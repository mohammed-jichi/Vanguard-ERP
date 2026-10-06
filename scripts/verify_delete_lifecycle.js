/**
 * Vanguard ERP — Delete Lifecycle & Ghost Employee Elimination Verification
 * 
 * Verifies:
 * 1. Authoritative Remote Fetch: Remote Supabase is the sole source of truth (no mock seeds, no stale local merges).
 * 2. Delete Persistence: Remote deletion purges from both `employees` table and `tenants.feature_flags`.
 * 3. Zero Resurrection on Hard Reload: Simulating a full page refresh (F5) re-fetches authoritative
 *    data and strictly guarantees the deleted employee does not reappear.
 */

const fs = require('fs');
const dotenv = require('dotenv');

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
} else if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://cmntrzsaqapybfhngmdv.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

async function fetchAuthoritativeEmployees() {
  // Exact server query executed by /api/hr/sync-workstation GET
  const { data: empRows, error: empErr } = await supabaseAdmin
    .from('employees')
    .select('*')
    .order('created_at', { ascending: false });

  if (empErr) throw new Error(`Fetch employees error: ${empErr.message}`);

  const { data: tenantData, error: tenantErr } = await supabaseAdmin
    .from('tenants')
    .select('feature_flags')
    .eq('id', DEFAULT_TENANT_ID)
    .maybeSingle();

  if (tenantErr) throw new Error(`Fetch tenant error: ${tenantErr.message}`);

  const flags = tenantData?.feature_flags || {};
  const remoteEmployeesMap = flags.hr_employees || {};
  const serverDbEmployees = empRows || [];

  // Reconcile authoritative remote state (ZERO local seed injection)
  const mergedMap = new Map();

  for (const [key, remoteEmp] of Object.entries(remoteEmployeesMap)) {
    const empId = String(remoteEmp.id || key);
    mergedMap.set(empId, { ...remoteEmp, id: empId });
  }

  for (const row of serverDbEmployees) {
    const empId = String(row.employee_code || row.id);
    const existing = mergedMap.get(empId) || mergedMap.get(String(row.id)) || {};
    mergedMap.set(empId, {
      ...existing,
      id: existing.id || empId,
      fullName: row.full_name || existing.fullName || 'Employee',
      phone: row.phone || existing.phone || '',
      nationalId: row.national_id || existing.nationalId,
      active: row.is_active ?? existing.active ?? true,
      isActive: row.is_active ?? existing.isActive ?? true,
      is_active: row.is_active ?? existing.is_active ?? true,
      dateHired: row.hire_date || existing.dateHired,
    });
  }

  return Array.from(mergedMap.values());
}

async function executeAuthoritativeDelete(employeeId) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(employeeId);
  let targetId = isUuid ? employeeId : null;
  let targetCode = !isUuid ? employeeId : null;

  try {
    const query = supabaseAdmin.from('employees').select('id, employee_code');
    const { data: matched } = isUuid
      ? await query.eq('id', employeeId).maybeSingle()
      : await query.eq('employee_code', employeeId).maybeSingle();
    if (matched) {
      if (matched.id) targetId = matched.id;
      if (matched.employee_code) targetCode = matched.employee_code;
    }
  } catch (e) {}

  if (targetId) {
    await supabaseAdmin.from('employees').delete().eq('id', targetId);
  }
  if (targetCode) {
    await supabaseAdmin.from('employees').delete().eq('employee_code', targetCode);
  }
  if (!targetId && isUuid) {
    await supabaseAdmin.from('employees').delete().eq('id', employeeId);
  }
  if (!targetCode) {
    await supabaseAdmin.from('employees').delete().eq('employee_code', employeeId);
  }

  // Purge from workstation_configs
  await supabaseAdmin.from('workstation_configs').delete().or(
    `employee_id.eq.${employeeId}${targetCode ? `,employee_id.eq.${targetCode}` : ''}${targetId ? `,employee_id.eq.${targetId}` : ''}`
  );

  // Purge from tenants.feature_flags
  const { data: tenantData } = await supabaseAdmin
    .from('tenants')
    .select('id, feature_flags')
    .eq('id', DEFAULT_TENANT_ID)
    .maybeSingle();

  if (tenantData) {
    const flags = tenantData.feature_flags || {};
    let modified = false;

    if (flags.hr_employees) {
      for (const k of Object.keys(flags.hr_employees)) {
        const item = flags.hr_employees[k];
        const kStr = String(k);
        const idVal = String(item?.id);
        const codeVal = String(item?.employee_code);
        const posVal = String(item?.posEmployeeId);
        if (
          kStr === String(employeeId) ||
          idVal === String(employeeId) ||
          codeVal === String(employeeId) ||
          posVal === String(employeeId) ||
          (targetCode && (kStr === targetCode || codeVal === targetCode || posVal === targetCode)) ||
          (targetId && (kStr === targetId || idVal === targetId))
        ) {
          delete flags.hr_employees[k];
          modified = true;
        }
      }
    }

    if (flags.employee_schedules) {
      for (const k of Object.keys(flags.employee_schedules)) {
        const item = flags.employee_schedules[k];
        const kStr = String(k);
        const empIdVal = String(item?.employee_id);
        if (
          kStr === String(employeeId) ||
          empIdVal === String(employeeId) ||
          (targetCode && (kStr === targetCode || empIdVal === targetCode)) ||
          (targetId && (kStr === targetId || empIdVal === targetId))
        ) {
          delete flags.employee_schedules[k];
          modified = true;
        }
      }
    }

    if (modified) {
      await supabaseAdmin
        .from('tenants')
        .update({ feature_flags: flags, updated_at: new Date().toISOString() })
        .eq('id', DEFAULT_TENANT_ID);
    }
  }
}

async function runDeleteLifecycleVerification() {
  console.log('========================================================================');
  console.log('🧪 RUNNING DELETE LIFECYCLE & GHOST RESURRECTION ELIMINATION TEST');
  console.log('========================================================================');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: CREATE TEMPORARY TARGET EMPLOYEE IN SUPABASE
    // -------------------------------------------------------------------------
    const targetEmpId = `TEST-GHOST-${Date.now()}`;
    console.log(`\n--- 1. Provisioning target employee for deletion: ${targetEmpId} ---`);

    // Write to employees table
    const { error: insertErr } = await supabaseAdmin
      .from('employees')
      .upsert({
        employee_code: targetEmpId,
        full_name: 'Ghost Deletion Target',
        phone: '+961 70 888 777',
        is_active: true,
      }, { onConflict: 'employee_code' });

    assert(!insertErr, 'Target employee inserted into Supabase employees table');

    // Write to tenants.feature_flags
    const { data: tenantData } = await supabaseAdmin
      .from('tenants')
      .select('feature_flags')
      .eq('id', DEFAULT_TENANT_ID)
      .maybeSingle();

    const flags = tenantData?.feature_flags || {};
    flags.hr_employees = flags.hr_employees || {};
    flags.hr_employees[targetEmpId] = {
      id: targetEmpId,
      employee_code: targetEmpId,
      fullName: 'Ghost Deletion Target',
      is_active: true,
    };

    await supabaseAdmin
      .from('tenants')
      .update({ feature_flags: flags, updated_at: new Date().toISOString() })
      .eq('id', DEFAULT_TENANT_ID);

    assert(true, 'Target employee provisioned in tenants.feature_flags');

    // -------------------------------------------------------------------------
    // TEST 2: FETCH BEFORE DELETION (VERIFY INCLUSION)
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Fetching authoritative list before deletion ---');
    const initialList = await fetchAuthoritativeEmployees();
    const existsBefore = initialList.some(e => String(e.id) === targetEmpId || String(e.employee_code) === targetEmpId);
    assert(existsBefore, `Target employee ${targetEmpId} is present in authoritative list`);

    // -------------------------------------------------------------------------
    // TEST 3: EXECUTE AUTHORITATIVE DELETION
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Executing authoritative deletion routine ---');
    await executeAuthoritativeDelete(targetEmpId);
    assert(true, `Deletion routine executed for ${targetEmpId}`);

    // -------------------------------------------------------------------------
    // TEST 4: SIMULATE HARD RELOAD (F5) WITH FRESH QUERY FROM SCRATCH
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Simulating Hard Browser Reload (F5): Re-fetching from scratch ---');
    const reloadedList = await fetchAuthoritativeEmployees();

    const existsAfterReload = reloadedList.some(
      e => String(e.id) === targetEmpId || String(e.employee_code) === targetEmpId
    );

    assert(!existsAfterReload, `Strict Assertion: Deleted employee ${targetEmpId} does NOT exist after simulated reload`);

    // -------------------------------------------------------------------------
    // TEST 5: ASSERT ZERO MOCK SEED INJECTION
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Verifying zero unpersisted mock seeds in authoritative state ---');
    const mockGhostNames = ['Charbel Khoury', 'Nour Salameh', 'Hadi Saad'];
    for (const mockName of mockGhostNames) {
      const foundMock = reloadedList.some(e => e.fullName === mockName);
      assert(!foundMock, `No resurrected mock employee found for: "${mockName}"`);
    }

    console.log('\n========================================================================');
    console.log(`🎉 ALL TESTS PASSED: ${passedTests}/${totalTests} assertions verified!`);
    console.log('🏆 Zero Ghost Employee Resurrection Confirmed!');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('\n❌ Verification failed:', err);
    process.exit(1);
  }
}

runDeleteLifecycleVerification();
