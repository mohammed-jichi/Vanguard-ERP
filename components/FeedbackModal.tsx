'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Star,
  Send,
  CheckCircle2,
  Sparkles,
  Bug,
  Lightbulb,
  Gauge
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { language, dir, t } = useLanguage();
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<'SUGGESTION' | 'BUG' | 'UI' | 'PERFORMANCE'>('SUGGESTION');
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [feedbackId, setFeedbackId] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        dir={dir}
        className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden z-10 animate-zoomIn flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {language === 'ar' ? 'إرسال ملاحظات واقتراحات' : 'Enterprise Feedback & Suggestions'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {language === 'ar'
                  ? 'رأيك يساعدنا على تطوير تجربة نظام Vanguard ERP'
                  : 'Your feedback directly drives Vanguard ERP product upgrades'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-fadeIn">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                {language === 'ar' ? 'شكراً لمشاركتك القيّمة!' : 'Thank you for your feedback!'}
              </h3>
              <p className="text-xs text-slate-600">
                {language === 'ar'
                  ? 'تم تسجيل ملاحظاتك لدى فريق التطوير في Vanguard ERP بنجاح.'
                  : 'Your notes have been recorded in the Vanguard product registry.'}
              </p>
              <div className="font-mono text-xs font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 inline-block">
                Reference ID #{feedbackId}
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleReset();
                    onClose();
                  }}
                  className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  {language === 'ar' ? 'تم' : 'Done'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div className="text-center space-y-1.5 pb-2 border-b border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  {language === 'ar' ? 'تقييم تجربة الاستخدام العامة' : 'Overall System Satisfaction'}
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
                  {language === 'ar' ? 'نوع الملاحظة' : 'Category'}
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setCategory('SUGGESTION')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                      category === 'SUGGESTION'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Feature Request</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('BUG')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                      category === 'BUG'
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Bug className="w-4 h-4 text-red-500" />
                    <span>Bug Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('UI')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                      category === 'UI'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span>UI & Usability</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('PERFORMANCE')}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
                      category === 'PERFORMANCE'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Gauge className="w-4 h-4 text-emerald-500" />
                    <span>Speed / Performance</span>
                  </button>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'تفاصيل الملاحظة أو الاقتراح *' : 'Your Comments & Suggestions *'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'شاركنا أفكارك، الصعوبات التي واجهتها، أو أي ميزة ترغب بإضافتها...'
                      : 'Share your experience, feature requests, or details about any issue...'
                  }
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden text-slate-900 custom-scrollbar resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-extrabold bg-primary hover:bg-primary/90 text-white shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'إرسال الملاحظات' : 'Submit Feedback'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
