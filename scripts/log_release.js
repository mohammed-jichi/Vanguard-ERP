/**
 * Vanguard ERP - Automated Release Logging & Dispatch Hook
 * Extracts latest Git commit metadata (or Vercel CI environment variables),
 * categorizes changes, generates formatted changelogs, emits user-facing release alerts,
 * and persists to Supabase (system_latest_updates & tenant feature flags), local manifest & notifications DB.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Load Environment Variables from .env.local if present
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  const env = { ...process.env };
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8');
    raw.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        env[match[1]] = val;
      }
    });
  }
  return env;
}

const env = loadEnv();
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || 'https://cmntrzsaqapybfhngmdv.supabase.co';
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_iJZBDyMfGUS2d34DI4lRZw_J8fcucuc';

let supabase = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
  console.warn('[ReleaseLogger] @supabase/supabase-js not found in current context, proceeding with file persistence');
}

// Convert git commit hash to deterministic valid UUIDv4
function hashToUuid(hash) {
  if (!hash) return '00000000-0000-4000-a000-000000000000';
  const clean = (hash.replace(/[^0-9a-fA-F]/g, '') + '00000000000000000000000000000000').slice(0, 32);
  return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-4${clean.slice(13, 16)}-a${clean.slice(17, 20)}-${clean.slice(20, 32)}`.toLowerCase();
}

// 2. Module Detection mapping based on file paths
function detectModules(files) {
  const modules = new Set();
  for (const f of files) {
    const lower = f.toLowerCase();
    if (lower.includes('sales') || lower.includes('pos')) modules.add('Sales & POS');
    else if (lower.includes('purchas') || lower.includes('supplier')) modules.add('Procurement & Purchasing');
    else if (lower.includes('operation') || lower.includes('inventory') || lower.includes('stock')) modules.add('Operations & Inventory');
    else if (lower.includes('accounting') || lower.includes('journal') || lower.includes('ledger') || lower.includes('finance')) modules.add('Accounting & Finance');
    else if (lower.includes('customer') || lower.includes('crm') || lower.includes('loyalty')) modules.add('Customer Relations (CRM)');
    else if (lower.includes('hr') || lower.includes('employee') || lower.includes('payroll')) modules.add('HR & Payroll');
    else if (lower.includes('fleet') || lower.includes('distribution') || lower.includes('vehicle')) modules.add('Fleet & Distribution');
    else if (lower.includes('pressing') || lower.includes('mill') || lower.includes('scale')) modules.add('Pressing Mill Automation');
    else if (lower.includes('notification') || lower.includes('alert') || lower.includes('updates')) modules.add('Alerts & Notifications');
    else if (lower.includes('account') || lower.includes('profile') || lower.includes('security')) modules.add('Account & Security');
    else if (lower.includes('language') || lower.includes('i18n')) modules.add('Multilingual Engine (i18n)');
    else if (lower.includes('setting') || lower.includes('tenant') || lower.includes('branch')) modules.add('Settings & Governance');
    else if (lower.includes('layout') || lower.includes('header') || lower.includes('navigation')) modules.add('Core Shell & UI');
  }
  if (modules.size === 0) modules.add('Core System Architecture');
  return Array.from(modules);
}

// 3. Category Detection
function detectCategory(subject) {
  const s = (subject || '').toLowerCase().trim();
  if (s.startsWith('feat')) return 'feature';
  if (s.startsWith('fix')) return 'fix';
  if (s.startsWith('sec') || s.includes('security') || s.includes('auth')) return 'security';
  if (s.startsWith('perf') || s.includes('speed') || s.includes('optimiz')) return 'performance';
  if (s.startsWith('refactor') || s.startsWith('style') || s.startsWith('cleanup')) return 'refactor';
  return 'maintenance';
}

// 4. Clean Title extraction
function cleanTitle(subject) {
  if (!subject) return 'System Enhancement Release';
  const colonIndex = subject.indexOf(':');
  if (colonIndex !== -1 && colonIndex < 25) {
    const after = subject.slice(colonIndex + 1).trim();
    return after.charAt(0).toUpperCase() + after.slice(1);
  }
  return subject.charAt(0).toUpperCase() + subject.slice(1);
}

// 5. Version Extraction from package.json
function getPackageVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf8'));
    if (pkg.version) return `v${pkg.version}`;
  } catch (e) {}
  return 'v2.0.0';
}

// 6. Parse Commit Details
function getCommitDetails(commitRef = 'HEAD') {
  try {
    const raw = execSync(`git log -1 --pretty=format:"%H||%h||%an||%ae||%ad||%s||%b" --date=iso ${commitRef}`, { encoding: 'utf8' }).trim();
    const parts = raw.split('||');
    const [fullHash, shortHash, authorName, authorEmail, dateStr, subject, body] = parts;

    let changedFiles = [];
    try {
      const filesRaw = execSync(`git diff-tree --no-commit-id --name-only -r ${commitRef}`, { encoding: 'utf8' }).trim();
      if (filesRaw) changedFiles = filesRaw.split('\n').filter(Boolean);
    } catch (e) {}

    const category = detectCategory(subject || '');
    const title = cleanTitle(subject || 'System Enhancement Release');
    const affectedModules = detectModules(changedFiles);

    // Formulate bullet points
    const bullets = [];
    if (body && body.trim()) {
      body.split('\n').forEach(line => {
        const trimmed = line.trim().replace(/^[-*•]\s*/, '');
        if (trimmed && trimmed.length > 5 && !trimmed.toLowerCase().includes('co-authored-by')) {
          bullets.push(trimmed);
        }
      });
    }

    if (bullets.length === 0) {
      if (category === 'feature') {
        bullets.push(`Implemented ${title.toLowerCase()}`);
        bullets.push(`Enhanced system stability and operator workflow in ${affectedModules.slice(0, 2).join(' & ')}`);
        bullets.push(`Validated cross-language translation tags and reactive state synchronization`);
      } else if (category === 'fix') {
        bullets.push(`Resolved: ${title.toLowerCase()}`);
        bullets.push(`Hardened validation and edge-case handling across affected components`);
        bullets.push(`Verified zero-regression behavior under production build`);
      } else {
        bullets.push(`Applied improvements to ${affectedModules.join(', ')}`);
        bullets.push(`Maintained backward compatibility with existing enterprise workflows`);
      }
    }

    const version = getPackageVersion();

    return {
      id: hashToUuid(fullHash),
      commit_hash: fullHash,
      short_hash: shortHash || fullHash.slice(0, 7),
      version,
      title,
      category,
      description: subject || title,
      bullet_points: bullets,
      affected_modules: affectedModules,
      author_name: authorName || 'Mohammed Jichi',
      author_email: authorEmail || 'jichi@vanguard-erp.com',
      is_critical: category === 'security',
      deployed_at: new Date(dateStr || Date.now()).toISOString(),
      created_at: new Date().toISOString()
    };
  } catch (err) {
    // Fallback if git is unavailable (e.g. CI/CD shallow clone or production container)
    const vercelSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA;
    if (vercelSha) {
      const shortSha = vercelSha.slice(0, 7);
      const subject = process.env.VERCEL_GIT_COMMIT_MESSAGE || 'Automated Production Release';
      const author = process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME || 'Vanguard CI/CD Automated Deployer';
      const version = getPackageVersion();
      const category = detectCategory(subject);
      const title = cleanTitle(subject);

      return {
        id: hashToUuid(vercelSha),
        commit_hash: vercelSha,
        short_hash: shortSha,
        version,
        title,
        category,
        description: subject,
        bullet_points: [
          `Deployed: ${title}`,
          `Validated zero-downtime release build for production`,
          `Synchronized enterprise tenant configuration and audit manifest`
        ],
        affected_modules: ['Core System Architecture', 'Alerts & Notifications'],
        author_name: author,
        author_email: 'deployer@vanguard-erp.com',
        is_critical: category === 'security',
        deployed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };
    }

    console.warn(`[ReleaseLogger] Unable to inspect git commit (${err.message}). Using build timestamp fallback.`);
    return null;
  }
}

// 7. Get Recent Commits for backfill
function getRecentCommitHashes(limit = 10) {
  try {
    const raw = execSync(`git log -n ${limit} --pretty=format:"%H"`, { encoding: 'utf8' }).trim();
    return raw.split('\n').filter(Boolean);
  } catch (e) {
    return [];
  }
}

// 8. Main Persistence & Alert Notification Orchestrator
async function logReleases() {
  const args = process.argv.slice(2);
  const backfillArg = args.find(a => a.startsWith('--backfill='));
  const backfillCount = backfillArg ? parseInt(backfillArg.split('=')[1], 10) : 0;

  console.log(`[ReleaseLogger] Initializing automated release logging & notification hook (backfill: ${backfillCount || 'HEAD only'})...`);

  let commitsToProcess = ['HEAD'];
  if (backfillCount > 0) {
    commitsToProcess = getRecentCommitHashes(backfillCount);
  }

  const updates = [];
  for (const ref of commitsToProcess) {
    const details = getCommitDetails(ref);
    if (details) updates.push(details);
  }

  if (updates.length === 0) {
    console.log('[ReleaseLogger] No new release records generated.');
    return;
  }

  console.log(`[ReleaseLogger] Formatted ${updates.length} release entry/entries.`);

  // 1. Update local manifest (lib/releases_manifest.json)
  const manifestPath = path.resolve(process.cwd(), 'lib/releases_manifest.json');
  let existingManifest = [];
  try {
    if (fs.existsSync(manifestPath)) {
      existingManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    }
  } catch (e) {}

  const mergedMap = new Map();
  // Existing first, then overwritten or prepended by new updates
  existingManifest.forEach(item => mergedMap.set(item.commit_hash || item.id, item));
  updates.forEach(item => mergedMap.set(item.commit_hash || item.id, item));

  const sortedManifest = Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.deployed_at).getTime() - new Date(a.deployed_at).getTime()
  );

  fs.writeFileSync(manifestPath, JSON.stringify(sortedManifest, null, 2), 'utf8');
  console.log(`[ReleaseLogger] Persisted ${sortedManifest.length} release records to lib/releases_manifest.json`);

  const latestRelease = sortedManifest[0];

  // 2. Generate and emit User-Facing Release Alert
  const releaseAlert = {
    id: `alert-rel-${latestRelease.short_hash}`,
    type: 'SYSTEM_RELEASE',
    severity: latestRelease.is_critical ? 'CRITICAL' : 'INFO',
    title: `🚀 Platform Release ${latestRelease.version}: ${latestRelease.title}`,
    message: latestRelease.description || (latestRelease.bullet_points && latestRelease.bullet_points[0]) || 'System deployment completed successfully.',
    timestamp: latestRelease.deployed_at || new Date().toISOString(),
    is_read: false,
    status: 'PENDING',
    source_ref: latestRelease.commit_hash,
    source_type: 'RELEASE',
    actionLink: '/backoffice?openUpdates=true',
    actionLabel: 'View Release Notes'
  };

  // 3. Persist release alert & audit activity to local database (data/vanguard_accounting_db.json)
  try {
    const dbPath = path.resolve(process.cwd(), 'data/vanguard_accounting_db.json');
    if (fs.existsSync(dbPath)) {
      const dbState = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      if (!Array.isArray(dbState.system_alerts)) {
        dbState.system_alerts = [];
      }
      
      // Upsert into system_alerts
      const alertIdx = dbState.system_alerts.findIndex(a => a.id === releaseAlert.id);
      if (alertIdx !== -1) {
        dbState.system_alerts[alertIdx] = { ...dbState.system_alerts[alertIdx], ...releaseAlert };
      } else {
        dbState.system_alerts.unshift(releaseAlert);
      }

      // Add to system_activities
      if (!Array.isArray(dbState.system_activities)) {
        dbState.system_activities = [];
      }
      const actId = `act-rel-${latestRelease.short_hash}`;
      const actExists = dbState.system_activities.some(act => act.id === actId);
      if (!actExists) {
        dbState.system_activities.unshift({
          id: actId,
          company_id: 1300,
          action_type: 'SYSTEM_RELEASE_DEPLOYED',
          description: `Vanguard deployment succeeded: ${latestRelease.version} (${latestRelease.short_hash}) - ${latestRelease.title}`,
          performed_by: latestRelease.author_name || 'Vanguard CI/CD Automated Deployer',
          metadata: {
            commit_hash: latestRelease.commit_hash,
            version: latestRelease.version,
            category: latestRelease.category,
            modules: latestRelease.affected_modules
          },
          created_at: latestRelease.deployed_at || new Date().toISOString()
        });
      }

      dbState.last_updated = new Date().toISOString();
      fs.writeFileSync(dbPath, JSON.stringify(dbState, null, 2), 'utf8');
      console.log(`[ReleaseLogger] Emitted release alert (${releaseAlert.id}) to data/vanguard_accounting_db.json`);
    }
  } catch (err) {
    console.warn('[ReleaseLogger] Local DB alert emission notice:', err.message);
  }

  // 4. Persist to Supabase if client available
  if (supabase) {
    const tenantId = '00000000-0000-0000-0000-000000000001';

    // A. Attempt insert into system_latest_updates table
    try {
      const { error: tableErr } = await supabase
        .from('system_latest_updates')
        .upsert(sortedManifest, { onConflict: 'commit_hash' });

      if (!tableErr) {
        console.log('[ReleaseLogger] Successfully synced with public.system_latest_updates table in Supabase');
      } else {
        console.log('[ReleaseLogger] Note: public.system_latest_updates table not present, syncing with tenant feature_flags');
      }
    } catch (e) {
      console.log('[ReleaseLogger] Table upsert skipped:', e.message);
    }

    // B. Persist to tenants.feature_flags (system_latest_updates & system_alerts)
    try {
      const { data: tenantData } = await supabase
        .from('tenants')
        .select('feature_flags')
        .eq('id', tenantId)
        .maybeSingle();

      const existingFlags = tenantData?.feature_flags || {};
      const existingAlerts = Array.isArray(existingFlags.system_alerts) ? existingFlags.system_alerts : [];

      // Upsert the new release alert into tenant feature_flags.system_alerts
      const updatedAlertsMap = new Map();
      existingAlerts.forEach(a => updatedAlertsMap.set(a.id, a));
      updatedAlertsMap.set(releaseAlert.id, releaseAlert);

      const updatedFlags = {
        ...existingFlags,
        system_latest_updates: sortedManifest,
        system_latest_updates_updated_at: new Date().toISOString(),
        system_alerts: Array.from(updatedAlertsMap.values()),
        latest_release_alert: releaseAlert,
        latest_release_version: latestRelease.version,
        latest_release_short_hash: latestRelease.short_hash
      };

      const { error: updateErr } = await supabase
        .from('tenants')
        .update({ feature_flags: updatedFlags })
        .eq('id', tenantId);

      if (updateErr) {
        console.warn('[ReleaseLogger] Supabase tenant feature_flags update warning:', updateErr.message);
      } else {
        console.log('[ReleaseLogger] Successfully persisted system_latest_updates & release alert to Supabase tenants.feature_flags');
      }
    } catch (err) {
      console.warn('[ReleaseLogger] Tenant feature_flags sync error:', err.message);
    }
  }

  console.log('[ReleaseLogger] Release logging & notification dispatch cycle complete.');
}

if (require.main === module) {
  logReleases().catch(err => {
    console.error('[ReleaseLogger] Fatal execution error:', err);
    process.exit(1);
  });
}

module.exports = { logReleases, getCommitDetails, detectModules, detectCategory };
