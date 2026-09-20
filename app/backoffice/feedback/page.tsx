'use client';

import React, { Suspense } from 'react';
import UnifiedFeedbackSurveysConsole from '@/components/modules/feedback/UnifiedFeedbackSurveysConsole';

export default function FeedbackSurveysPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-semibold">Loading Feedback &amp; Surveys...</div>}>
      <UnifiedFeedbackSurveysConsole />
    </Suspense>
  );
}
