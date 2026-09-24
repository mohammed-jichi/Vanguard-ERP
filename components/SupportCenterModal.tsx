'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  Search,
  BookOpen,
  PhoneCall,
  MessageSquare,
  FileText,
  Video,
  Send,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface SupportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportCenterModal({ isOpen, onClose }: SupportCenterModalProps) {
  const { language, dir, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'GUIDES' | 'TICKET' | 'CONTACT'>('GUIDES');
  const [searchQuery, setSearchQuery] = useState('');

  // Ticket Form state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('OPERATIONS');
  const [ticketPriority, setTicketPriority] = useState('NORMAL');
  const [ticketDetails, setTicketDetails] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketRefId, setTicketRefId] = useState('');

  // Keyboard shortcut listener to close on Escape
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

  const guides = [
    {
      id: 'g1',
      title: 'Olive Pressing Mill & Weighbridge Intake Guide',
      titleAr: 'دليل محطة القبان واستلام الزيتون وضبط خطوط العصر',
      category: 'Operations',
      duration: '4 min read',
      tag: 'Core System'
    },
    {
      id: 'g2',
      title: 'POS Cashier & End of Day (Z-Report) Posting',
      titleAr: 'دليل الكاشير وإصدار تقرير الإغلاق المالي اليومي Z-Report',
      category: 'Sales POS',
      duration: '3 min read',
      tag: 'Finance'
    },
    {
      id: 'g3',
      title: 'Dual Currency Settlement & Exchange Rate Matrix',
      titleAr: 'آلية احتساب العملات المتعددة وسعر الصرف اللحظي',
      category: 'Accounting',
      duration: '5 min read',
      tag: 'Accounting'
    },
    {
      id: 'g4',
      title: 'SuperSonic Fleet V-Driver Geolocation Tracking',
      titleAr: 'دليل تتبع مسارات السائقين وتوثيق تسليم البضائع',
      category: 'Logistics',
      duration: '2 min read',
      tag: 'V-Track'
    },
    {
      id: 'g5',
      title: 'Bluetooth & Network Thermal Printer Configuration',
      titleAr: 'إعداد طابعات الإيصالات الحرارية وشبكات العمل الداخلية',
      category: 'Hardware',
      duration: '6 min read',
      tag: 'Hardware'
    }
  ];

  const filteredGuides = guides.filter((g) => {
    const query = searchQuery.toLowerCase();
    return (
      g.title.toLowerCase().includes(query) ||
      g.titleAr.includes(query) ||
      g.category.toLowerCase().includes(query)
    );
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDetails.trim()) return;

    const ref = 'VG-' + Math.floor(100000 + Math.random() * 900000);
    setTicketRefId(ref);
    setTicketSubmitted(true);
  };

  const handleResetTicket = () => {
    setTicketSubject('');
    setTicketDetails('');
    setTicketSubmitted(false);
    setTicketRefId('');
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
        className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 animate-zoomIn flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>{language === 'ar' ? 'مركز الدعم والمساعدة الفنية' : 'Enterprise Support Center'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  24/7 LIVE
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                {language === 'ar'
                  ? 'الأدلة التشغيلية، قنوات الاتصال المباشر، وتذاكر الدعم'
                  : 'Operations manuals, direct emergency channels & support ticketing'}
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

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('GUIDES')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'GUIDES'
                ? 'border-b-primary text-primary bg-white font-extrabold'
                : 'border-b-transparent hover:bg-slate-100 text-slate-600'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{language === 'ar' ? 'الأدلة والمعرفة' : 'Knowledge Base'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('TICKET')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'TICKET'
                ? 'border-b-primary text-primary bg-white font-extrabold'
                : 'border-b-transparent hover:bg-slate-100 text-slate-600'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{language === 'ar' ? 'فتح تذكرة دعم' : 'Submit Ticket'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CONTACT')}
            className={`py-3 px-4 border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'CONTACT'
                ? 'border-b-primary text-primary bg-white font-extrabold'
                : 'border-b-transparent hover:bg-slate-100 text-slate-600'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>{language === 'ar' ? 'الاتصال المباشر' : 'Direct Channels'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
          {/* TAB 1: GUIDES */}
          {activeTab === 'GUIDES' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'ابحث في أدلة التشغيل ومواضيع المساعدة...' : 'Search operational guides, manuals & FAQ...'}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-hidden transition-all text-slate-900"
                />
              </div>

              <div className="space-y-2.5">
                {filteredGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="p-3.5 bg-slate-50/80 hover:bg-amber-50/50 rounded-2xl border border-slate-200/80 hover:border-amber-300 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                          {guide.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">⏱ {guide.duration}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {language === 'ar' ? guide.titleAr : guide.title}
                      </h4>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}

                {filteredGuides.length === 0 && (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    {language === 'ar' ? 'لا توجد أدلة مطابقة لبحثك' : 'No manuals match your search query.'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TICKET */}
          {activeTab === 'TICKET' && (
            <div>
              {ticketSubmitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      {language === 'ar' ? 'تم تسجيل تذكرة الدعم بنجاح' : 'Support Ticket Dispatched'}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {language === 'ar'
                        ? 'تم إرسال طلبك مباشرة إلى مهندسي نظام Vanguard ERP. سيتم التواصل معك خلال 15 دقيقة.'
                        : 'Your issue has been routed to Vanguard Enterprise Engineers. Priority response time: < 15 mins.'}
                    </p>
                  </div>
                  <div className="font-mono text-xs font-black bg-white px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-800 inline-block">
                    Ticket Reference #{ticketRefId}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleResetTicket}
                      className="px-4 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      {language === 'ar' ? 'تقديم تذكرة أخرى' : 'Submit Another Request'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleTicketSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'عنوان المشكلة أو الطلب' : 'Issue / Ticket Subject *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: خطأ في مزامنة القبان مع خط الإنتاج' : 'e.g., Weighbridge Bluetooth intake scale disconnected'}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'ar' ? 'القسم المتأثر' : 'Affected Department'}
                      </label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden text-slate-900"
                      >
                        <option value="OPERATIONS">Olive Pressing & Operations</option>
                        <option value="POS">POS Terminal & Cashier</option>
                        <option value="ACCOUNTING">Accounting & Invoices</option>
                        <option value="FLEET">SuperSonic Fleet & Delivery</option>
                        <option value="HARDWARE">Printers & Scales</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'ar' ? 'درجة الأهمية' : 'Priority Level'}
                      </label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden text-slate-900 font-bold"
                      >
                        <option value="NORMAL">Normal — General Query</option>
                        <option value="HIGH">High — Module Hindered</option>
                        <option value="CRITICAL">Critical — Pressing / POS Stalled</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'تفاصيل المشكلة والخطوات' : 'Detailed Explanation *'}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={ticketDetails}
                      onChange={(e) => setTicketDetails(e.target.value)}
                      placeholder={language === 'ar' ? 'يرجى وصف المشكلة بدقة لمساعدة فريق الدعم...' : 'Please describe the steps leading to the error and any error message displayed...'}
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-primary outline-hidden text-slate-900 custom-scrollbar resize-none"
                    />
                  </div>

                  <div className="pt-1 flex items-center justify-end gap-2.5">
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
                      <span>{language === 'ar' ? 'إرسال التذكرة' : 'Submit Ticket'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: CONTACT */}
          {activeTab === 'CONTACT' && (
            <div className="space-y-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ar' ? 'خط العمليات الساخن (طوارئ المعاصر)' : 'Emergency Operations Hotline'}</span>
                </div>
                <p className="text-base font-mono font-black text-slate-900 pt-1">+961 1 800 244</p>
                <p className="text-[10.5px] text-slate-500">Available 24/7 during harvest & production season.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ar' ? 'فريق الدعم الفني عبر واتساب' : 'Direct WhatsApp Operations Channel'}</span>
                </div>
                <p className="text-xs font-mono font-bold text-slate-800 pt-1">+961 70 982 144</p>
                <p className="text-[10.5px] text-slate-500">Instant media, receipts, and log diagnostics.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>{language === 'ar' ? 'البريد الإلكتروني للأنظمة والترخيص' : 'Enterprise Licensing & System Desk'}</span>
                </div>
                <p className="text-xs font-mono font-bold text-slate-800 pt-1">support@vanguard-erp.com</p>
                <p className="text-[10.5px] text-slate-500">Official inquiries, data migration, and enterprise updates.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-mono">Vanguard ERP v2.6.4 Support Desk</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
