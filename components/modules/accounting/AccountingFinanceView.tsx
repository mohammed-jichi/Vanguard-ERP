'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useTenant } from '@/lib/TenantContext';
import { toast } from '@/lib/toast';
import { 
  Briefcase, Wallet, Landmark, TrendingUp, TrendingDown, 
  ArrowRightLeft, Plus, Search, FileText, CheckCircle2,
  PieChart, DollarSign, Activity
} from 'lucide-react';

interface FinAccount { id: string; account_name: string; account_type: string; account_number?: string; current_balance: number; currency: string; }
interface Category { id: string; category_name: string; }
interface Expense { id: string; category_id: string; paid_from_account_id: string; amount: number; payment_method: string; recipient: string; expense_date: string; notes: string; }
interface BankTx { id: string; account_id: string; transaction_type: string; amount: number; statement_date: string; notes: string; }
interface JournalEntry { id: string; entry_number: string; entry_date: string; description: string; }

export function AccountingFinanceView() {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id || 'default-tenant';

  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'banking' | 'reports' | 'journal'>('overview');
  const [loading, setLoading] = useState(true);

  const [accounts, setAccounts] = useState<FinAccount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [transactions, setTransactions] = useState<BankTx[]>([]);

  // Modals
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);

  // Forms
  const [newAccount, setNewAccount] = useState({ account_name: '', account_type: 'bank', currency: 'USD', current_balance: 0 });
  const [newCat, setNewCat] = useState({ category_name: '', description: '' });
  const [newExpense, setNewExpense] = useState({ category_id: '', paid_from_account_id: '', amount: 0, payment_method: 'bank_transfer', recipient: '', expense_date: new Date().toISOString().split('T')[0], notes: '' });
  const [newTransfer, setNewTransfer] = useState({ from_account_id: '', to_account_id: '', amount: 0, statement_date: new Date().toISOString().split('T')[0], notes: '' });
  
  // Journal Entry Form
  const [newJournal, setNewJournal] = useState({ entry_number: '', entry_date: new Date().toISOString().split('T')[0], description: '' });
  const [journalLines, setJournalLines] = useState([{ account_id: '', debit: 0, credit: 0, memo: '' }, { account_id: '', debit: 0, credit: 0, memo: '' }]);

  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accRes, catRes, expRes, txRes] = await Promise.all([
        supabase.from('financial_accounts').select('*').eq('tenant_id', tenantId),
        supabase.from('expense_categories').select('*').eq('tenant_id', tenantId),
        supabase.from('operating_expenses').select('*').eq('tenant_id', tenantId).order('expense_date', { ascending: false }),
        supabase.from('bank_transactions').select('*').eq('tenant_id', tenantId).order('statement_date', { ascending: false })
      ]);
      if (accRes.data) setAccounts(accRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (expRes.data) setExpenses(expRes.data);
      if (txRes.data) setTransactions(txRes.data);
    } catch (err: any) {
      toast.error('Failed to load accounting data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (tenantId) fetchData(); }, [tenantId]);

  const handleAddAccount = async () => {
    if (!newAccount.account_name) return toast.error('Account name required');
    const { data, error } = await supabase.from('financial_accounts').insert([{ ...newAccount, tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setAccounts([...accounts, data]);
    setShowAccountModal(false); setNewAccount({ account_name: '', account_type: 'bank', currency: 'USD', current_balance: 0 });
    toast.success('Account added');
  };

  const handleAddCategory = async () => {
    if (!newCat.category_name) return toast.error('Category name required');
    const { data, error } = await supabase.from('expense_categories').insert([{ ...newCat, tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setCategories([...categories, data]);
    setShowCategoryModal(false); setNewCat({ category_name: '', description: '' });
    toast.success('Category added');
  };

  const handleAddExpense = async () => {
    if (!newExpense.category_id || !newExpense.paid_from_account_id || newExpense.amount <= 0) return toast.error('Valid Category, Account, and Amount required');
    try {
      const account = accounts.find(a => a.id === newExpense.paid_from_account_id);
      if (!account) throw new Error("Account not found");

      // 1. Record Expense
      const { data: exp, error: expErr } = await supabase.from('operating_expenses').insert([{ ...newExpense, tenant_id: tenantId }]).select().single();
      if (expErr) throw expErr;

      // 2. Deduct Balance
      const newBalance = Number(account.current_balance) - Number(newExpense.amount);
      await supabase.from('financial_accounts').update({ current_balance: newBalance }).eq('id', account.id);

      // 3. Log Bank Tx
      await supabase.from('bank_transactions').insert([{
        tenant_id: tenantId, account_id: account.id, transaction_type: 'withdrawal',
        amount: newExpense.amount, statement_date: newExpense.expense_date, notes: `Expense: ${newExpense.notes}`
      }]);

      toast.success('Expense recorded and balance updated');
      setShowExpenseModal(false);
      setNewExpense({ category_id: '', paid_from_account_id: '', amount: 0, payment_method: 'bank_transfer', recipient: '', expense_date: new Date().toISOString().split('T')[0], notes: '' });
      fetchData();
    } catch(err:any) { toast.error(err.message); }
  };

  const handleTransfer = async () => {
    if (!newTransfer.from_account_id || !newTransfer.to_account_id || newTransfer.amount <= 0) return toast.error('Valid accounts and amount required');
    if (newTransfer.from_account_id === newTransfer.to_account_id) return toast.error('Cannot transfer to the same account');

    try {
      const fromAcc = accounts.find(a => a.id === newTransfer.from_account_id);
      const toAcc = accounts.find(a => a.id === newTransfer.to_account_id);
      if (!fromAcc || !toAcc) throw new Error("Accounts not found");

      const fromBalance = Number(fromAcc.current_balance) - Number(newTransfer.amount);
      const toBalance = Number(toAcc.current_balance) + Number(newTransfer.amount);

      // Update Balances
      await supabase.from('financial_accounts').update({ current_balance: fromBalance }).eq('id', fromAcc.id);
      await supabase.from('financial_accounts').update({ current_balance: toBalance }).eq('id', toAcc.id);

      // Log withdrawal
      await supabase.from('bank_transactions').insert([{
        tenant_id: tenantId, account_id: fromAcc.id, transaction_type: 'transfer',
        amount: newTransfer.amount, statement_date: newTransfer.statement_date, notes: `Transfer to ${toAcc.account_name}: ${newTransfer.notes}`
      }]);
      // Log deposit
      await supabase.from('bank_transactions').insert([{
        tenant_id: tenantId, account_id: toAcc.id, transaction_type: 'deposit',
        amount: newTransfer.amount, statement_date: newTransfer.statement_date, notes: `Transfer from ${fromAcc.account_name}: ${newTransfer.notes}`
      }]);

      toast.success('Transfer completed successfully');
      setShowTransferModal(false);
      setNewTransfer({ from_account_id: '', to_account_id: '', amount: 0, statement_date: new Date().toISOString().split('T')[0], notes: '' });
      fetchData();
    } catch(err:any) { toast.error(err.message); }
  };

  const handleAddJournalEntry = async () => {
    const totalDebit = journalLines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
    const totalCredit = journalLines.reduce((sum, line) => sum + Number(line.credit || 0), 0);

    if (totalDebit !== totalCredit) return toast.error(`Debits (${totalDebit}) must equal Credits (${totalCredit})`);
    if (totalDebit === 0) return toast.error('Entry cannot be zero');
    if (!newJournal.entry_number || !newJournal.description) return toast.error('Entry number and description required');

    for (const line of journalLines) {
      if (!line.account_id) return toast.error('All lines must have an account selected');
    }

    try {
      const { data: entry, error: entryErr } = await supabase.from('journal_entries').insert([{ ...newJournal, tenant_id: tenantId }]).select().single();
      if (entryErr) throw entryErr;

      const linesToInsert = journalLines.map(line => ({
        entry_id: entry.id,
        account_id: line.account_id,
        debit: Number(line.debit || 0),
        credit: Number(line.credit || 0),
        memo: line.memo
      }));

      const { error: lineErr } = await supabase.from('journal_lines').insert(linesToInsert);
      if (lineErr) throw lineErr;

      // Update actual account balances dynamically based on journal (Simplification: Debit increases Bank/Cash, Credit decreases)
      for (const line of journalLines) {
        const acc = accounts.find(a => a.id === line.account_id);
        if (acc) {
          // Standard asset accounting: Debit increases, Credit decreases
          const delta = Number(line.debit || 0) - Number(line.credit || 0);
          const newBal = Number(acc.current_balance) + delta;
          await supabase.from('financial_accounts').update({ current_balance: newBal }).eq('id', acc.id);
        }
      }

      toast.success('Journal Entry posted successfully');
      setShowJournalModal(false);
      setNewJournal({ entry_number: '', entry_date: new Date().toISOString().split('T')[0], description: '' });
      setJournalLines([{ account_id: '', debit: 0, credit: 0, memo: '' }, { account_id: '', debit: 0, credit: 0, memo: '' }]);
      fetchData();
    } catch (err:any) { toast.error(err.message); }
  };

  const addJournalLine = () => {
    setJournalLines([...journalLines, { account_id: '', debit: 0, credit: 0, memo: '' }]);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-emerald-600" />
            Accounting & Finance
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage dynamic banks, cash vaults, expenses, and ledgers.</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-max overflow-x-auto max-w-full">
        {[
          { id: 'overview', label: 'Overview', icon: PieChart },
          { id: 'banking', label: 'Accounts & Banking', icon: Landmark },
          { id: 'expenses', label: 'Operating Expenses', icon: TrendingDown },
          { id: 'journal', label: 'Journal Entries', icon: FileText },
          { id: 'reports', label: 'Financial Reports', icon: Activity },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex whitespace-nowrap items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-500">Loading financial data...</div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-6">Financial Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {accounts.map(acc => (
                    <div key={acc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                      <div className="flex items-center gap-2 text-slate-500 mb-2">
                        {acc.account_type === 'bank' ? <Landmark className="w-4 h-4 text-blue-500"/> : <Wallet className="w-4 h-4 text-emerald-500"/>}
                        <span className="text-sm font-medium uppercase tracking-wider">{acc.account_type.replace('_', ' ')}</span>
                      </div>
                      <div className="font-bold text-slate-900 truncate">{acc.account_name}</div>
                      <div className="text-2xl font-bold text-slate-800 mt-2">
                        {acc.currency} {acc.current_balance.toLocaleString()}
                      </div>
                    </div>
                  ))}
                  {accounts.length === 0 && <div className="col-span-full text-slate-500 py-4">No accounts configured yet.</div>}
                </div>
                
                <h3 className="font-semibold text-slate-700 mb-4">Recent Transactions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Account</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {transactions.slice(0,10).map(tx => {
                        const acc = accounts.find(a => a.id === tx.account_id);
                        return (
                          <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4">{new Date(tx.statement_date).toLocaleDateString()}</td>
                            <td className="py-3 px-4 font-medium text-slate-900">{acc?.account_name}</td>
                            <td className="py-3 px-4 capitalize">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${tx.transaction_type === 'deposit' ? 'bg-emerald-100 text-emerald-700' : tx.transaction_type === 'withdrawal' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                                {tx.transaction_type}
                              </span>
                            </td>
                            <td className={`py-3 px-4 text-right font-bold ${tx.transaction_type === 'withdrawal' ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {tx.transaction_type === 'withdrawal' ? '-' : '+'}${tx.amount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{tx.notes}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BANKING TAB */}
            {activeTab === 'banking' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Accounts & Banking</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setShowTransferModal(true)} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 flex items-center gap-2">
                      <ArrowRightLeft className="w-4 h-4" /> Transfer Funds
                    </button>
                    <button onClick={() => setShowAccountModal(true)} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> New Account
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="py-3 px-4 font-medium">Account Name</th>
                        <th className="py-3 px-4 font-medium">Type</th>
                        <th className="py-3 px-4 font-medium">Account Number</th>
                        <th className="py-3 px-4 font-medium text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {accounts.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-slate-500">No accounts configured.</td></tr>}
                      {accounts.map(acc => (
                        <tr key={acc.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                            {acc.account_type === 'bank' ? <Landmark className="w-4 h-4 text-slate-400"/> : <Wallet className="w-4 h-4 text-slate-400"/>}
                            {acc.account_name}
                          </td>
                          <td className="py-3 px-4 text-slate-600 uppercase text-xs">{acc.account_type.replace('_', ' ')}</td>
                          <td className="py-3 px-4 text-slate-600 font-mono">{acc.account_number || 'N/A'}</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-800">{acc.currency} {acc.current_balance.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* EXPENSES TAB */}
            {activeTab === 'expenses' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Operating Expenses</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCategoryModal(true)} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Category
                    </button>
                    <button onClick={() => setShowExpenseModal(true)} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" /> Record Expense
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="py-3 px-4 font-medium">Date</th>
                        <th className="py-3 px-4 font-medium">Category</th>
                        <th className="py-3 px-4 font-medium">Paid From</th>
                        <th className="py-3 px-4 font-medium">Recipient</th>
                        <th className="py-3 px-4 font-medium text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {expenses.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-500">No expenses recorded.</td></tr>}
                      {expenses.map(exp => {
                        const cat = categories.find(c => c.id === exp.category_id);
                        const acc = accounts.find(a => a.id === exp.paid_from_account_id);
                        return (
                          <tr key={exp.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-600">{exp.expense_date}</td>
                            <td className="py-3 px-4 font-medium text-slate-900">{cat?.category_name}</td>
                            <td className="py-3 px-4 text-slate-600">{acc?.account_name}</td>
                            <td className="py-3 px-4 text-slate-800">{exp.recipient}</td>
                            <td className="py-3 px-4 text-right font-bold text-rose-600">-${exp.amount.toLocaleString()}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* JOURNAL TAB */}
            {activeTab === 'journal' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Journal Entries</h2>
                  <button onClick={() => setShowJournalModal(true)} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Journal Entry
                  </button>
                </div>
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-16 h-16 mb-4 opacity-50" />
                  <p>View historical journal entries here.</p>
                </div>
              </div>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'reports' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-6">Financial Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-6 border border-slate-200 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100">
                    <div className="text-emerald-700 font-bold mb-2">Total Operating Expenses</div>
                    <div className="text-3xl font-bold text-slate-900">${expenses.reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}</div>
                  </div>
                  <div className="p-6 border border-slate-200 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-blue-700 font-bold mb-2">Total Available Cash & Bank</div>
                    <div className="text-3xl font-bold text-slate-900">${accounts.reduce((sum, a) => sum + Number(a.current_balance), 0).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      
      {/* Add Account Modal */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Financial Account</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                <input type="text" value={newAccount.account_name} onChange={e => setNewAccount({...newAccount, account_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Main Bank, HQ Safe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                  <select value={newAccount.account_type} onChange={e => setNewAccount({...newAccount, account_type: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                    <option value="bank">Bank Account</option>
                    <option value="cash_vault">Cash Vault / Register</option>
                    <option value="petty_cash">Petty Cash</option>
                    <option value="credit">Credit Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Opening Balance</label>
                  <input type="number" value={newAccount.current_balance} onChange={e => setNewAccount({...newAccount, current_balance: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowAccountModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddAccount} className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Save Account</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Expense Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                <input type="text" value={newCat.category_name} onChange={e => setNewCat({...newCat, category_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Office Supplies, Fuel" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddCategory} className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Record Operating Expense</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select value={newExpense.category_id} onChange={e => setNewExpense({...newExpense, category_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option value="">Select Category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Paid From (Deduct Balance)</label>
                <select value={newExpense.paid_from_account_id} onChange={e => setNewExpense({...newExpense, paid_from_account_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option value="">Select Account...</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.account_name} (Bal: {a.current_balance})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                  <input type="number" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                  <input type="date" value={newExpense.expense_date} onChange={e => setNewExpense({...newExpense, expense_date: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipient / Vendor</label>
                <input type="text" value={newExpense.recipient} onChange={e => setNewExpense({...newExpense, recipient: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowExpenseModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddExpense} className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Post Expense</button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Transfer Funds</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">From Account (Withdrawal)</label>
                <select value={newTransfer.from_account_id} onChange={e => setNewTransfer({...newTransfer, from_account_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option value="">Select Source Account...</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.account_name} (Bal: {a.current_balance})</option>)}
                </select>
              </div>
              <div className="flex justify-center my-2"><ArrowRightLeft className="w-5 h-5 text-slate-400 rotate-90" /></div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">To Account (Deposit)</label>
                <select value={newTransfer.to_account_id} onChange={e => setNewTransfer({...newTransfer, to_account_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option value="">Select Destination Account...</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.account_name} (Bal: {a.current_balance})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                <input type="number" value={newTransfer.amount} onChange={e => setNewTransfer({...newTransfer, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" min="0" step="0.01" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowTransferModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleTransfer} className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Process Transfer</button>
            </div>
          </div>
        </div>
      )}

      {/* Journal Entry Modal */}
      {showJournalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Post Journal Entry</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Entry Number</label>
                  <input type="text" value={newJournal.entry_number} onChange={e => setNewJournal({...newJournal, entry_number: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" placeholder="JV-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <input type="text" value={newJournal.description} onChange={e => setNewJournal({...newJournal, description: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
            </div>
            
            <div className="border border-slate-200 rounded-lg overflow-hidden mb-4">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                  <tr>
                    <th className="px-3 py-2">Account</th>
                    <th className="px-3 py-2 text-right">Debit</th>
                    <th className="px-3 py-2 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {journalLines.map((line, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="p-2">
                        <select value={line.account_id} onChange={e => {
                          const newLines = [...journalLines]; newLines[idx].account_id = e.target.value; setJournalLines(newLines);
                        }} className="w-full px-2 py-1 text-sm border border-slate-300 rounded outline-none focus:ring-1 focus:ring-emerald-500 bg-white">
                          <option value="">Select Account...</option>
                          {accounts.map(a => <option key={a.id} value={a.id}>{a.account_name}</option>)}
                        </select>
                      </td>
                      <td className="p-2">
                        <input type="number" value={line.debit} onChange={e => {
                          const newLines = [...journalLines]; newLines[idx].debit = Number(e.target.value); newLines[idx].credit = 0; setJournalLines(newLines);
                        }} className="w-full px-2 py-1 text-sm text-right border border-slate-300 rounded outline-none focus:ring-1 focus:ring-emerald-500" min="0" />
                      </td>
                      <td className="p-2">
                        <input type="number" value={line.credit} onChange={e => {
                          const newLines = [...journalLines]; newLines[idx].credit = Number(e.target.value); newLines[idx].debit = 0; setJournalLines(newLines);
                        }} className="w-full px-2 py-1 text-sm text-right border border-slate-300 rounded outline-none focus:ring-1 focus:ring-emerald-500" min="0" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-2 bg-slate-50 text-center">
                <button onClick={addJournalLine} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">+ Add Line</button>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm font-bold text-slate-800 bg-slate-100 p-3 rounded-lg mb-6">
              <span>Total</span>
              <div className="flex gap-16">
                <span className={journalLines.reduce((s,l)=>s+l.debit,0) !== journalLines.reduce((s,l)=>s+l.credit,0) ? 'text-rose-600' : 'text-emerald-600'}>
                  DR: {journalLines.reduce((s,l)=>s+l.debit,0)}
                </span>
                <span className={journalLines.reduce((s,l)=>s+l.debit,0) !== journalLines.reduce((s,l)=>s+l.credit,0) ? 'text-rose-600' : 'text-emerald-600'}>
                  CR: {journalLines.reduce((s,l)=>s+l.credit,0)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowJournalModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddJournalEntry} className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Post Entry</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
