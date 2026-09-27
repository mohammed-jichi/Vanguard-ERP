import { redirect } from 'next/navigation';

/**
 * Vanguard ERP — Settings Users Route (/settings/users)
 * Forwards directly to the unified backoffice Users console.
 */
export default function SettingsUsersRedirectPage() {
  redirect('/backoffice/settings/users');
}
