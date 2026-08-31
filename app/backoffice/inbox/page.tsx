'use client';

import React, { useState } from 'react';
import Link from 'next/link';

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
  };
}

export default function OperationalInboxPage() {
  const [activeFolder, setActiveFolder] = useState<'ALL' | 'APPROVAL' | 'ALERT' | 'REPORT' | 'MEMO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  const [messages, setMessages] = useState<InboxMessage[]>([
    {
      id: 'MSG-101',
      category: 'APPROVAL',
      subject: 'PO Approval Required: Batch #88 17.5L Empty Tin Cans Order',
      sender: 'Khaled Al-Masri (Procurement Dept)',
      branch: 'Choueifat Main Facility',
      time: '02:45 PM',
      date: 'Today',
      status: 'PENDING',
      isRead: false,
      priority: 'HIGH',
      content: 'Purchase Order #PO-8801 submitted for 500x heavy-duty 17.5L tin containers for the upcoming autumn olive harvest pressing cycle. Total amount: $3,750.00. Vendor: Taizhou Packaging. Awaiting Manager Approval.',
      details: {
        refCode: 'PO-8801',
        amount: '$3,750.00',
        items: '500x 17.5L Olive Oil Metal Tins (0.32mm thickness)',
      },
    },
    {
      id: 'MSG-102',
      category: 'ALERT',
      subject: 'Void Alert: High-Value Void on Invoice #103225 (9,000,000 LBP)',
      sender: 'Vanguard POS Security Guard',
      branch: 'Choueifat POS Terminal 1',
      time: '11:15 AM',
      date: 'Today',
      status: 'PENDING',
      isRead: false,
      priority: 'HIGH',
      content: 'Cashier Hiba Aloulou performed a void operation on 1x 17.5L Extra Virgin Olive Oil Tin ($100.00 / 9,000,000.00 LBP). Reason provided: تعداد خاطئ (Wrong Count). Please review.',
      details: {
        refCode: 'INV-103225',
        amount: '9,000,000.00 LBP',
        reason: 'تعداد خاطئ (Wrong Count)',
      },
    },
    {
      id: 'MSG-103',
      category: 'APPROVAL',
      subject: 'Credit Limit Extension Request: Al-Baraka Supermarket S.A.R.L',
      sender: 'Ahmad Ali Kassem (Sales Rep)',
      branch: 'Beirut Distribution Hub',
      time: '04:20 PM',
      date: 'Yesterday',
      status: 'PENDING',
      isRead: true,
      priority: 'NORMAL',
      content: 'Sales representative Ahmad Ali requests raising credit ceiling for partner Al-Baraka Supermarket S.A.R.L from $5,000.00 to $7,500.00 for bulk orders. Current account balance: $1,400.00.',
      details: {
        refCode: 'CUST-01',
        amount: '$7,500.00 (Proposed Limit)',
        items: 'Customer AR Account Limit Adjustment',
      },
    },
    {
      id: 'MSG-104',
      category: 'REPORT',
      subject: 'Scheduled EOD Closing Package: All Operating Branches (30-Aug-2026)',
      sender: 'Vanguard Automated Report Engine',
      branch: 'All Branches',
      time: '11:59 PM',
      date: '30 Aug 2026',
      status: 'REVIEWED',
      isRead: true,
      priority: 'NORMAL',
      content: 'Automated End-Of-Day Z-Report successfully closed for all operating branches. Total Gross Sales: $5,290.00. Total Voids: 3 events (10,890,000 LBP). Active customers serviced: 142.',
      details: {
        refCode: 'EOD-20260830',
        amount: '$5,290.00',
        items: 'End of Day Operations Report',
      },
    },
    {
      id: 'MSG-105',
      category: 'MEMO',
      subject: 'Inter-Branch Stock Transfer: 100x Pomegranate Molasses (500ml)',
      sender: 'Hussein Mahdi (Logistics Coordinator)',
      branch: 'Choueifat to Beirut',
      time: '03:10 PM',
      date: '29 Aug 2026',
      status: 'REVIEWED',
      isRead: true,
      priority: 'NORMAL',
      content: 'Dispatched 100 bottles of Grade-A Pomegranate Molasses 500ml from Choueifat Warehouse Tank Room to Beirut Hamra Distribution Center via SuperSonic Van #04.',
      details: {
        refCode: 'TRF-0921',
        items: '100x Pomegranate Molasses 500ml',
      },
    },
  ]);

  const [selectedMessageId, setSelectedMessageId] = useState<string>(messages[0]?.id || '');
  const activeMessage = messages.find((m) => m.id === selectedMessageId) || messages[0];

  const handleApprove = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'APPROVED', isRead: true } : m))
    );
    alert(`Action Approved: ${activeMessage.subject}`);
  };

  const handleReject = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: 'REJECTED', isRead: true } : m))
    );
    alert(`Action Rejected: ${activeMessage.subject}`);
  };

  const filteredMessages = messages.filter((m) => {
    const matchesFolder = activeFolder === 'ALL' || m.category === activeFolder;
    const matchesSearch =
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content.toLowerCase().includes(searchQuery.toLowerCase());
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
      <div className="h-11 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-[#1e3a2b] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            ✉️
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-900 leading-tight">Operations & Approvals Inbox</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            Unread: <strong className="text-[#1e3a2b]">{messages.filter(m => !m.isRead).length}</strong>
          </span>
          <Link
            href="/backoffice/dashboard"
            className="px-2.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors"
          >
            Dashboard ↗
          </Link>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden p-3 gap-3 bg-[#f3f5f8]">
        
        {/* Left Folders */}
        <aside className="w-48 bg-white rounded-xl border border-slate-300/80 p-2.5 space-y-1 shrink-0 shadow-2xs">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Folders
          </div>

          <button
            type="button"
            onClick={() => setActiveFolder('ALL')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
              activeFolder === 'ALL' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>📥 All Messages</span>
            <span className="text-[10px] font-mono">{messages.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder('APPROVAL')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
              activeFolder === 'APPROVAL' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>⏳ Approvals</span>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-900 px-1 py-0.2 rounded font-bold">
              {messages.filter(m => m.category === 'APPROVAL').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder('ALERT')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
              activeFolder === 'ALERT' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
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
              activeFolder === 'REPORT' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>📊 Reports</span>
            <span className="text-[10px] font-mono">{messages.filter(m => m.category === 'REPORT').length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder('MEMO')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors ${
              activeFolder === 'MEMO' ? 'bg-[#1e3a2b] text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>💬 Memos</span>
            <span className="text-[10px] font-mono">{messages.filter(m => m.category === 'MEMO').length}</span>
          </button>
        </aside>

        {/* Middle Message List */}
        <div className="w-80 bg-white rounded-xl border border-slate-300/80 p-2.5 flex flex-col shrink-0 shadow-2xs">
          <div className="space-y-1.5 pb-2 border-b border-slate-200">
            <div className="bg-slate-50 p-1 rounded-lg border border-slate-300 flex items-center gap-1">
              <span className="text-slate-400 text-xs">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 space-y-1.5">
            {filteredMessages.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMessageId(m.id)}
                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                  selectedMessageId === m.id
                    ? 'bg-[#edf2ee] border-[#1e3a2b] shadow-2xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                } ${!m.isRead ? 'border-l-3 border-l-[#1e3a2b]' : ''}`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  {getCategoryBadge(m.category)}
                  <span className="text-[9.5px] font-mono text-slate-400">{m.time}</span>
                </div>

                <h4 className={`text-xs leading-snug line-clamp-1 ${!m.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                  {m.subject}
                </h4>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span className="truncate max-w-[140px]">{m.sender.split('(')[0]}</span>
                  <span className="text-[9px] bg-slate-100 px-1 py-0.2 rounded font-bold">{m.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Detail Pane */}
        <main className="flex-1 bg-white rounded-xl border border-slate-300/80 p-5 flex flex-col justify-between shadow-2xs overflow-y-auto custom-scrollbar">
          {activeMessage ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(activeMessage.category)}
                    <span className="font-mono text-xs text-slate-400">[{activeMessage.id}]</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    activeMessage.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                    activeMessage.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    activeMessage.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    Status: {activeMessage.status}
                  </span>
                </div>

                <h2 className="text-sm font-bold text-slate-900">{activeMessage.subject}</h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div><span className="text-slate-400 block text-[9.5px]">FROM:</span><strong className="text-slate-900">{activeMessage.sender}</strong></div>
                  <div><span className="text-slate-400 block text-[9.5px]">FACILITY:</span><strong className="text-slate-900">{activeMessage.branch}</strong></div>
                  <div><span className="text-slate-400 block text-[9.5px]">TIME:</span><strong className="text-slate-900">{activeMessage.date} {activeMessage.time}</strong></div>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-800 leading-relaxed">
                <p className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  {activeMessage.content}
                </p>

                {activeMessage.details && (
                  <div className="border border-[#1e3a2b]/30 bg-[#f8faf8] rounded-lg p-3 space-y-2">
                    <h4 className="font-bold text-[#1e3a2b] text-[11px] uppercase tracking-wide">Operational Data Record</h4>
                    <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                      {activeMessage.details.refCode && (
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-slate-400 text-[9.5px] block">REF CODE</span>
                          <strong className="text-slate-900">{activeMessage.details.refCode}</strong>
                        </div>
                      )}
                      {activeMessage.details.amount && (
                        <div className="bg-white p-2 rounded border border-slate-200">
                          <span className="text-slate-400 text-[9.5px] block">AMOUNT</span>
                          <strong className="text-[#1e3a2b]">{activeMessage.details.amount}</strong>
                        </div>
                      )}
                      {activeMessage.details.items && (
                        <div className="col-span-2 bg-white p-2 rounded border border-slate-200">
                          <span className="text-slate-400 text-[9.5px] block">DETAILS</span>
                          <strong className="text-slate-900">{activeMessage.details.items}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {activeMessage.category === 'APPROVAL' && activeMessage.status === 'PENDING' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(activeMessage.id)}
                        className="px-4 py-1.5 bg-[#1e3a2b] hover:bg-[#14281e] text-white font-bold rounded-lg text-xs shadow-2xs"
                      >
                        ✓ Approve Request
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(activeMessage.id)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                      >
                        ✕ Reject
                      </button>
                    </>
                  )}

                  {activeMessage.category === 'REPORT' && (
                    <Link
                      href="/backoffice/reportview"
                      className="px-3 py-1.5 bg-[#1e3a2b] text-white font-bold rounded-lg text-xs"
                    >
                      📊 Open in Report Matrix
                    </Link>
                  )}
                </div>

                <div className="text-[10px] font-mono text-slate-400">
                  Southern Olive Oil Products S.A.R.L
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Select a message to view.
            </div>
          )}
        </main>

      </div>

    </div>
  );
}
