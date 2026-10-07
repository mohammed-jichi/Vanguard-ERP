'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Star,
  Send,
  CheckCircle2,
  Sparkles,
  Bug,
  Lightbulb,
  Gauge
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import ModalShell from './ModalShell';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { dir, t } = useLanguage();
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<'SUGGESTION' | 'BUG' | 'UI' | 'PERFORMANCE'>('SUGGESTION');
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [feedbackId, setFeedbackId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const id = 'FB-' + Math.floor(1000 + Math.random() * 9000);
    setFeedbackId(id);
    setSubmitted(true);
  };

  const handleReset = () => {
    setComment('');
    setRating(5);
    setSubmitted(false);
    setFeedbackId('');
  };

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-lg"
      dir={dir}
      icon={<MessageSquare className="w-5 h-5 text-emerald-700" />}
      title={t('feedback_suggestions_title', 'Enterprise Feedback & Suggestions')}
      subtitle={t('feedback_suggestions_sub', 'Your feedback directly drives Vanguard ERP product upgrades')}
      bodyClassName="p-6"
    >
      {submitted ? (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-sm">
            {t('thank_you_feedback', 'Thank you for your feedback!')}
          </h3>
          <p className="text-xs text-slate-600">
            {t('feedback_recorded_registry', 'Your notes have been recorded in the Vanguard product registry.')}
          </p>
          <div className="font-mono text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 inline-block">
            {t('reference_id_hash', 'Reference ID #')}{feedbackId}
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              {t('done', 'Done')}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="text-center space-y-1.5 pb-2 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              {t('overall_system_satisfaction', 'Overall System Satisfaction')}
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              {t('category', 'Category')}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => setCategory('SUGGESTION')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  category === 'SUGGESTION'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>{t('feature_request', 'Feature Request')}</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('BUG')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  category === 'BUG'
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Bug className="w-4 h-4 text-red-500" />
                <span>{t('bug_report', 'Bug Report')}</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('UI')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  category === 'UI'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>{t('ui_usability', 'UI & Usability')}</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('PERFORMANCE')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  category === 'PERFORMANCE'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Gauge className="w-4 h-4 text-emerald-500" />
                <span>{t('speed_performance', 'Speed / Performance')}</span>
              </button>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              {t('comments_suggestions_req', 'Your Comments & Suggestions *')}
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('feedback_placeholder', 'Share your experience, feature requests, or details about any issue...')}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-600 outline-hidden text-slate-900 custom-scrollbar resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('submit_feedback', 'Submit Feedback')}</span>
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}
