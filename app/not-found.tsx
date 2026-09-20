'use client';

import React from 'react';
import StandardUnderDevelopmentPlaceholder from '@/components/StandardUnderDevelopmentPlaceholder';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center">
      <StandardUnderDevelopmentPlaceholder
        moduleTitle="Page or Sub-Route Under Development"
        moduleCategory="NAVIGATION & WORKSPACE"
        description="The requested page or sub-module is currently scheduled for upcoming release deployment. In accordance with Vanguard ERP standards, no blank or unhandled states are displayed."
        backUrl="/backoffice"
        backLabel="Back to Enterprise Hub"
      />
    </div>
  );
}
