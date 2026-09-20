'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface InboxMessage {
  id: string;
  category: 'APPROVAL' | 'ALERT' | 'REPORT' | 'MEMO';
  subject: string;
  sender: string;
  branch: string;
  time: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVIEWED';
  isRead: boolean;
  priority: 'HIGH' | 'NORMAL';
  content: string;
  details?: {
    refCode?: string;
    amount?: string;
    items?: string;
    reason?: string;
    voucherId?: string;
    expenseId?: string;
  };
  linked_voucher_id?: string;
  linked_expense_id?: string;
  action_performed_by?: string;
  action_performed_at?: string;
  action_notes?: string;
}

function OperationalInboxContent() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get('id') || searchParams.get('messageId');
  const folderParam = (searchParams.get('folder') || searchParams.get('category') || '').toUpperCase();
  const modalParam = searchParams.get('modal') || searchParams.get('dialog');

  const [activeFolder, setActiveFolder] = useState<'ALL' | 'APPROVAL' | 'ALERT' | 'REPORT' | 'MEMO'>(() => {
    if (['APPROVAL', 'ALERT', 'REPORT', 'MEMO'].includes(folderParam)) {
      return folderParam as any;
    }
    return 'ALL';
  });

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || searchParams.get('search') || '');
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [selectedMessageId, setSelectedMessageId] = useState<string>('');

  const fetchInbox = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/inbox');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setMessages(data.data);

        // Check if deep-linked message exists
        if (idParam) {
          const match = data.data.find((m: InboxMessage) => m.id === idParam || m.details?.refCode === idParam);
          if (match) {
            setSelectedMessageId(match.id);
          } else {
            setActionFeedback({
              type: 'error',
              message: `Notice: Message "${idParam}" was not found or already completed. Showing active inbox list.`
            });
            if (data.data.length > 0) {
              setSelectedMessageId(data.data[0].id);
            }
          }
        } else if (data.data.length > 0 && !selectedMessageId) {
          setSelectedMessageId(data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching inbox:', err);
    } finally {
      setLoading(false);
    }
  }, [idParam, selectedMessageId]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  useEffect(() => {
    if (modalParam) {
      setActionFeedback({
        type: 'success',
        message: `Notice: Detailed modal "${modalParam}" is staged for the upcoming sprint. Showing main inbox list.`
      });
    }
  }, [modalParam]);

  const activeMessage = messages.find((m) => m.id === selectedMessageId) || messages[0];

  const handleApprove = async (id: string) => {
    try {
      setIsSubmitting(true);
      setActionFeedback(null);
      const res = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'APPROVE',
          notes: 'Approved and verified by General Operations Manager',
          user: 'Mohammed Jichi (General Operations Manager)'
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: 'APPROVED',
                  isRead: true,
                  action_performed_by: 'Mohammed Jichi (General Operations Manager)',
                  action_performed_at: new Date().toISOString()
                }
              : m
          )
        );
        setActionFeedback({
          type: 'success',
          message: data.message || 'Action Approved: Posted to General Ledger and account balances updated!'
        });
        setTimeout(() => setActionFeedback(null), 6000);
      } else {
        setActionFeedback({
          type: 'error',
          message: data.error || 'Failed to approve request'
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Communication error during approval'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setIsSubmitting(true);
      setActionFeedback(null);
      const res = await fetch('/api/inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action: 'REJECT',
          notes: 'Authorization declined during operations review',
          user: 'Mohammed Jichi (General Operations Manager)'
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  status: 'REJECTED',
                  isRead: true,
                  action_performed_by: 'Mohammed Jichi (General Operations Manager)',
                  action_performed_at: new Date().toISOString()
                }
              : m
          )
        );
        setActionFeedback({
          type: 'success',
          message: data.message || 'Action Rejected: Rejection recorded in audit trail.'
        });
        setTimeout(() => setActionFeedback(null), 6000);
      } else {
        setActionFeedback({
          type: 'error',
          message: data.error || 'Failed to reject request'
        });
      }
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Communication error during rejection'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMessages = messages.filter((m) => {
    const matchesFolder = activeFolder === 'ALL' || m.category === activeFolder;
    const matchesSearch =
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.details?.refCode && m.details.refCode.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesBranch = selectedBranch === 'ALL' || m.branch.includes(selectedBranch);
    return matchesFolder && matchesSearch && matchesBranch;
  });

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'APPROVAL':
        return <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-300">⏳ Approval</span>;
      case 'ALERT':
        return <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px] border border-red-300">🛡️ Alert</span>;
      case 'REPORT':
        return <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-300">📊 Report</span>;
      case 'MEMO':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">💬 Memo</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-80px)] select-none text-left font-sans">
      
      {/* Top Bar */}
      <div className="h-11 bg-card border-b border-border px-4 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-xs">
            ✉️
          </div>
          <div>
            <h1 className="text-xs font-bold text-foreground leading-tight">Operations & Approvals Inbox</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchInbox}
            disabled={loading}
            className="px-2.5 py-0.5 bg-card hover:bg-muted text-foreground text-xs font-semibold rounded-lg border border-border transition-colors flex items-center gap-1 shadow-2xs"
            title="Refresh inbox data"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>Refresh</span>
          </button>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
            Unread: <strong className="text-primary">{messages.filter(m => !m.isRead).length}</strong>
          </span>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
            Pending Approvals: <strong className="text-amber-700">{messages.filter(m => m.category === 'APPROVAL' && m.status === 'PENDING').length}</strong>
          </span>
          <Link
            href="/backoffice"
            className="px-2.5 py-0.5 bg-muted hover:bg-muted/80 text-foreground text-xs font-bold rounded-lg border border-border transition-colors"
          >
            Main Hub ↗
          </Link>
        </div>
      </div>

      {/* Action Feedback Toast */}
      {actionFeedback && (
        <div
          className={`mx-3 mt-2 p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between shadow-sm animate-fadeIn ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-red-50 text-red-900 border-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{actionFeedback.type === 'success' ? '✅' : '⚠️'}</span>
            <span>{actionFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-xs text-slate-500 hover:text-slate-800 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3 bg-background">
        
        {/* Left Folders */}
        <aside className="w-48 bg-card rounded-xl border border-border p-2.5 space-y-1 shrink-0 shadow-2xs">
          <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Folders
          </div>

          <button
            type="button"
            onClick={() => setActiveFolder('ALL')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
              activeFolder === 'ALL' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground hover:bg-muted'
            }`}
          >
            <span>📥 All Messages</span>
            <span className="text-[10px] font-mono">{messages.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder('APPROVAL')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
              activeFolder === 'APPROVAL' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground hover:bg-muted'
            }`}
          >
            <span>⏳ Approvals</span>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-900 px-1 py-0.2 rounded font-bold">
              {messages.filter(m => m.category === 'APPROVAL' && m.status === 'PENDING').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder('ALERT')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
              activeFolder === 'ALERT' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground hover:bg-muted'
            }`}
          >
            <span>🛡️ Void & Control</span>
            <span className="text-[10px] font-mono bg-red-500/20 text-red-900 px-1 py-0.2 rounded font-bold">
              {messages.filter(m => m.category === 'ALERT').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder('REPORT')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
              activeFolder === 'REPORT' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground hover:bg-muted'
            }`}
          >
            <span>📊 Reports</span>
            <span className="text-[10px] font-mono">{messages.filter(m => m.category === 'REPORT').length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder('MEMO')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
              activeFolder === 'MEMO' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground hover:bg-muted'
            }`}
          >
            <span>💬 Memos</span>
            <span className="text-[10px] font-mono">{messages.filter(m => m.category === 'MEMO').length}</span>
          </button>
        </aside>

        {/* Middle Message List */}
        <div className="w-80 bg-card rounded-xl border border-border p-2.5 flex flex-col shrink-0 shadow-2xs">
          <div className="space-y-1.5 pb-2 border-b border-border">
            <div className="bg-muted/50 p-1.5 rounded-lg border border-border flex items-center gap-1.5">
              <span className="text-muted-foreground text-xs">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subject, ref, sender..."
                className="w-full bg-transparent text-xs text-foreground placeholder-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 space-y-1.5">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Loading database messages...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">No messages in folder.</div>
            ) : (
              filteredMessages.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMessageId(m.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedMessageId === m.id
                      ? 'bg-muted border-border shadow-2xs'
                      : 'bg-card border-border hover:bg-muted/40'
                  } ${!m.isRead ? 'border-l-3 border-l-primary' : ''}`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    {getCategoryBadge(m.category)}
                    <span className="text-[9.5px] font-mono text-muted-foreground">{m.time}</span>
                  </div>

                  <h4 className={`text-xs leading-snug line-clamp-1 ${!m.isRead ? 'font-bold text-foreground' : 'font-semibold text-muted-foreground'}`}>
                    {m.subject}
                  </h4>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono mt-1">
                    <span className="truncate max-w-[140px]">{m.sender.split('(')[0]}</span>
                    <span className="text-[9px] bg-muted px-1 py-0.2 rounded font-bold">{m.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        <main className="flex-1 bg-card rounded-xl border border-border p-5 flex flex-col justify-between shadow-2xs overflow-y-auto custom-scrollbar">
          {activeMessage ? (
            <div className="space-y-4">
              <div className="border-b border-border pb-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(activeMessage.category)}
                    <span className="font-mono text-xs text-muted-foreground">[{activeMessage.id}]</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    activeMessage.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    activeMessage.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-300' :
                    activeMessage.status === 'PENDING' ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' :
                    'bg-muted text-muted-foreground border-border'
                  }`}>
                    Status: {activeMessage.status}
                  </span>
                </div>

                <h2 className="text-sm font-bold text-foreground">{activeMessage.subject}</h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg border border-border">
                  <div><span className="text-muted-foreground/70 block text-[9.5px]">FROM:</span><strong className="text-foreground">{activeMessage.sender}</strong></div>
                  <div><span className="text-muted-foreground/70 block text-[9.5px]">FACILITY:</span><strong className="text-foreground">{activeMessage.branch}</strong></div>
                  <div><span className="text-muted-foreground/70 block text-[9.5px]">TIME:</span><strong className="text-foreground">{activeMessage.date} {activeMessage.time}</strong></div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-foreground leading-relaxed">
                <p className="p-3 bg-muted/30 rounded-lg border border-border">
                  {activeMessage.content}
                </p>

                {/* Structured Details Card */}
                {activeMessage.details && (
                  <div className="border border-border bg-card rounded-lg p-3 space-y-2 shadow-2xs">
                    <h4 className="font-bold text-primary text-[11px] uppercase tracking-wide">Operational Data Record</h4>
                    <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                      {activeMessage.details.refCode && (
                        <div className="bg-muted/40 p-2 rounded border border-border">
                          <span className="text-muted-foreground text-[9.5px] block">REF CODE</span>
                          <strong className="text-foreground">{activeMessage.details.refCode}</strong>
                        </div>
                      )}
                      {activeMessage.details.amount && (
                        <div className="bg-muted/40 p-2 rounded border border-border">
                          <span className="text-muted-foreground text-[9.5px] block">AMOUNT</span>
                          <strong className="text-primary font-bold">{activeMessage.details.amount}</strong>
                        </div>
                      )}
                      {activeMessage.details.items && (
                        <div className="col-span-2 bg-muted/40 p-2 rounded border border-border">
                          <span className="text-muted-foreground text-[9.5px] block">DETAILS</span>
                          <strong className="text-foreground">{activeMessage.details.items}</strong>
                        </div>
                      )}
                      {activeMessage.details.reason && (
                        <div className="col-span-2 bg-amber-50 p-2 rounded border border-amber-200 text-amber-900">
                          <span className="text-amber-700 text-[9.5px] block">NOTE / REASON</span>
                          <strong>{activeMessage.details.reason}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Audit Sign-off Confirmation Box */}
                {activeMessage.action_performed_by && (
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-300 text-emerald-900 space-y-1">
                    <div className="font-bold text-xs flex items-center gap-1.5">
                      <span>✓ Audit Sign-Off Recorded</span>
                    </div>
                    <div className="text-[11px] font-mono">
                      Action performed by: <strong>{activeMessage.action_performed_by}</strong>
                    </div>
                    {activeMessage.action_performed_at && (
                      <div className="text-[10px] text-emerald-700 font-mono">
                        Timestamp: {new Date(activeMessage.action_performed_at).toLocaleString()}
                      </div>
                    )}
                    {activeMessage.action_notes && (
                      <div className="text-[10px] text-emerald-800 mt-1 italic">
                        Notes: &quot;{activeMessage.action_notes}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {activeMessage.category === 'APPROVAL' && activeMessage.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleApprove(activeMessage.id)}
                        className="px-4 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        {isSubmitting ? <span className="animate-spin">🔄</span> : <span>✓</span>}
                        <span>Approve Request & Post to GL</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleReject(activeMessage.id)}
                        className="px-3.5 py-1.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold rounded-lg text-xs transition-colors"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}

                  {activeMessage.linked_voucher_id && (
                    <Link
                      href="/backoffice/accounting?tab=module1"
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg text-xs border border-border"
                    >
                      📑 View in Journal Vouchers ↗
                    </Link>
                  )}

                  {activeMessage.linked_expense_id && (
                    <Link
                      href="/backoffice/accounting?tab=module2"
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg text-xs border border-border"
                    >
                      💰 View in Expenses & Purchases ↗
                    </Link>
                  )}

                  {activeMessage.category === 'REPORT' && (
                    <Link
                      href="/backoffice/reportview"
                      className="px-3 py-1.5 bg-primary text-primary-foreground font-bold rounded-lg text-xs"
                    >
                      📊 Open in Report Matrix
                    </Link>
                  )}
                </div>

                <div className="text-[10px] font-mono text-muted-foreground">
                  Southern Olive Oil Products S.A.R.L (#1300)
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
              Select a message to view.
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

export default function OperationalInboxPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading Operations Inbox...</div>}>
      <OperationalInboxContent />
    </Suspense>
  );
}
