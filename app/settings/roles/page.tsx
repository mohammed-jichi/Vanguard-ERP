import { redirect } from 'next/navigation';

/**
 * Vanguard ERP — Settings Roles Route (/settings/roles)
 * Forwards directly to the unified backoffice Roles & Permissions console.
 */
export default function SettingsRolesRedirectPage() {
  redirect('/backoffice/settings/roles');
}
