'use client';

import React from 'react';
import AuthenticOmegaSalesWorkstation from '../backoffice/operations/SalesView';

export default function StandaloneOmegaSalesPage() {
  return <AuthenticOmegaSalesWorkstation withOmegaSidebar={true} />;
}
