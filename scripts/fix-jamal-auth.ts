import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_EMAIL = 'jamaljichihusseinmahdi@gmail.com'.toLowerCase();
const TARGET_PASSWORD = '123456';

async function executeFix() {
  console.log(`Setting password to "${TARGET_PASSWORD}" and confirming email for ${TARGET_EMAIL}...`);

  // 1. List users from Supabase Auth
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) {
    console.error("Error fetching auth users:", listError);
    process.exit(1);
  }

  const existingUser = users.find(u => u.email?.toLowerCase() === TARGET_EMAIL);

  if (existingUser) {
    console.log(`Found user ${existingUser.id}. Updating credentials...`);
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      password: TARGET_PASSWORD,
      email_confirm: true,
      user_metadata: {
        ...existingUser.user_metadata,
        email_verified: true,
        full_name: 'Hussien Jichi'
      }
    });

    if (error) {
      console.error("Supabase update error:", error);
      process.exit(1);
    }
    console.log("Supabase Auth updated successfully for:", data.user.email);
  } else {
    console.log("User not found in Supabase Auth. Creating new confirmed user...");
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: TARGET_EMAIL,
      password: TARGET_PASSWORD,
      email_confirm: true,
      user_metadata: {
        full_name: 'Hussien Jichi',
        email_verified: true
      }
    });

    if (error) {
      console.error("Supabase create error:", error);
      process.exit(1);
    }
    console.log("Supabase Auth user created successfully:", data.user.email);
  }

  // 2. Sync local JSON database
  const dbPath = path.resolve('data/vanguard_accounting_db.json');
  if (fs.existsSync(dbPath)) {
    const localDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    if (localDb.users) {
      localDb.users = localDb.users.map((u: any) => {
        if (u.email?.toLowerCase() === TARGET_EMAIL) {
          return {
            ...u,
            password: TARGET_PASSWORD,
            is_active: true,
            status: 'Active',
            email_confirmed: true,
            email_verified: true
          };
        }
        return u;
      });
      fs.writeFileSync(dbPath, JSON.stringify(localDb, null, 2), 'utf8');
      console.log("Synced data/vanguard_accounting_db.json successfully.");
    }
  }
}

executeFix().catch(console.error);
