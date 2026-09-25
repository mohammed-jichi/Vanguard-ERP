'use client';

import React, { Suspense } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import UnifiedFeedbackSurveysConsole from '@/components/modules/feedback/UnifiedFeedbackSurveysConsole';

function FeedbackLoadingFallback() {
  const { t } = useLanguage();
  return (
    <div className="p-8 text-center text-slate-400 font-semibold">
      {t('loading_feedback_surveys', 'Loading Feedback & Surveys...')}
    </div>
  );
}

export default function FeedbackSurveysPage() {
  const { dir } = useLanguage();
  return (
    <div dir={dir} className="w-full min-h-screen bg-background text-foreground">
      <Suspense fallback={<FeedbackLoadingFallback />}>
        <UnifiedFeedbackSurveysConsole />
      </Suspense>
    </div>
  );
}
