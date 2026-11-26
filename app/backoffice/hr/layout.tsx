'use client';

import React from 'react';

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return <div className="w-full min-w-0">{children}</div>;
}
