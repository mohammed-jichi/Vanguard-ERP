'use client';

import React from 'react';
import UsersManagementConsole from '@/components/settings/UsersManagementConsole';

/**
 * Vanguard ERP — Backoffice Settings Users Route (/backoffice/settings/users)
 * Directly renders the unified Omega-style Users Management Console with integrated virtual keyboard.
 * Eliminates duplicate orphan files across workspace and backoffice routes.
 */
export default function BackofficeUsersSettingsPage() {
  return <UsersManagementConsole />;
}
