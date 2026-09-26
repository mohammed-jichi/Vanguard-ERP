const { createClient } = require('@supabase/supabase-js');

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile('.env.local');
  } catch (err) {
    console.warn('Could not load .env.local via loadEnvFile:', err.message);
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  console.log('Connecting to Supabase at:', supabaseUrl);

  const targetEmails = [
    'mohammed.jichi@gmail.com',
    'mohammed@vanguard-erp.com'
  ];

  const targetPassword = '123578951';

  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100
  });

  if (listError) {
    console.error('Failed to list users:', listError);
    process.exit(1);
  }

  console.log(`Retrieved ${usersData.users.length} users from Supabase Auth.`);
  usersData.users.forEach(u => {
    console.log(` - User ID: ${u.id}, Email: ${u.email}, Confirmed: ${Boolean(u.email_confirmed_at)}`);
  });

  let updatedCount = 0;

  for (const email of targetEmails) {
    const matchedUser = usersData.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (matchedUser) {
      console.log(`\nFound existing user for ${email} (ID: ${matchedUser.id}). Updating password and confirming email...`);
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(matchedUser.id, {
        password: targetPassword,
        email_confirm: true
      });

      if (updateError) {
        console.error(`Failed to update password for ${email}:`, updateError);
      } else {
        console.log(`Successfully updated password for ${email} to '${targetPassword}' and confirmed email.`);
        updatedCount++;
      }
    } else {
      console.log(`\nNo existing user found for ${email}. Creating user with confirmed email...`);
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: targetPassword,
        email_confirm: true,
        user_metadata: { full_name: 'Mohammed Jichi', role: 'SUPER_ADMIN' }
      });

      if (createError) {
        console.error(`Failed to create user for ${email}:`, createError);
      } else {
        console.log(`Successfully created user for ${email} (ID: ${createData.user.id}) with password '${targetPassword}'.`);
        updatedCount++;
      }
    }
  }

  console.log(`\nPassword reset process completed. Total accounts updated/created: ${updatedCount}.`);
}

main().catch(err => {
  console.error('Unexpected error during password reset:', err);
  process.exit(1);
});
