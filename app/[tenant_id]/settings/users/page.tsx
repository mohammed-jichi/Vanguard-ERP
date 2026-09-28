'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import UsersManagementConsole from '@/components/settings/UsersManagementConsole';

/**
 * Vanguard ERP — Dynamic Workspace Users Route (/[tenant_id]/settings/users)
 * Master Omega-style Users Management Console with streamlined modal layout.
 */
export default function TenantUsersManagementPage() {
  const params = useParams();
  const tenantId = typeof params?.tenant_id === 'string' ? params.tenant_id : undefined;

  return <UsersManagementConsole initialTenantId={tenantId} />;
}
