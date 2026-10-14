'use client';

import React from 'react';
import AuthenticVanguardSalesWorkstation from '../backoffice/operations/SalesView';

export default function StandaloneVanguardSalesPage() {
  return <AuthenticVanguardSalesWorkstation withSidebar={true} />;
}
