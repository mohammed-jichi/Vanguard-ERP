'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useTenant } from '@/lib/TenantContext';
import { toast } from '@/lib/toast';
import { 
  Users, Building2, MapPin, Tag, Plus, Search, 
  AlertTriangle, CheckCircle2, HeadphonesIcon, 
  CreditCard, FileText, X
} from 'lucide-react';

interface Category { id: string; name: string; discount_rate: number; }
interface Zone { id: string; zone_name: string; }
interface Customer {
  id: string; account_code: string; full_name: string; company_name: string;
  category_id: string; zone_id: string; phone: string; address: string;
  credit_limit: number; current_balance: number; payment_terms: string;
  is_wholesale: boolean; status: string;
}
interface Transaction {
  id: string; transaction_type: string; amount: number; balance_after: number;
  reference_no: string; transaction_date: string;
}
interface Ticket {
  id: string; subject: string; status: string; priority: string; created_at: string;
  customer_id: string;
}

export function CustomerManagementView() {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id || 'default-tenant';

  const [activeTab, setActiveTab] = useState<'directory' | 'wholesale' | 'support'>('directory');
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<Category[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Modals
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  
  // Selected state for Modals
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerLedger, setCustomerLedger] = useState<Transaction[]>([]);

  // Forms
  const [newCat, setNewCat] = useState({ name: '', discount_rate: 0 });
  const [newZone, setNewZone] = useState({ zone_name: '', description: '' });
  const [newCustomer, setNewCustomer] = useState({
    account_code: '', full_name: '', company_name: '', category_id: '', zone_id: '',
    phone: '', address: '', credit_limit: 0, payment_terms: 'Net 30', is_wholesale: false
  });
  const [newTx, setNewTx] = useState({ transaction_type: 'payment', amount: 0, reference_no: '', notes: '' });
  const [newTicket, setNewTicket] = useState({ customer_id: '', subject: '', description: '', priority: 'low' });

  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, zoneRes, custRes, tktRes] = await Promise.all([
        supabase.from('customer_categories').select('*').eq('tenant_id', tenantId),
        supabase.from('customer_zones').select('*').eq('tenant_id', tenantId),
        supabase.from('customers').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
        supabase.from('customer_feedback_tickets').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false })
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (zoneRes.data) setZones(zoneRes.data);
      if (custRes.data) setCustomers(custRes.data);
      if (tktRes.data) setTickets(tktRes.data);
    } catch (err: any) {
      toast.error('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (tenantId) fetchData(); }, [tenantId]);

  const handleAddCategory = async () => {
    if (!newCat.name) return toast.error('Category name is required');
    const { data, error } = await supabase.from('customer_categories').insert([{ ...newCat, tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setCategories([...categories, data]);
    setShowCategoryModal(false); setNewCat({ name: '', discount_rate: 0 });
    toast.success('Category added');
  };

  const handleAddZone = async () => {
    if (!newZone.zone_name) return toast.error('Zone name is required');
    const { data, error } = await supabase.from('customer_zones').insert([{ ...newZone, tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setZones([...zones, data]);
    setShowZoneModal(false); setNewZone({ zone_name: '', description: '' });
    toast.success('Zone added');
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.full_name || !newCustomer.account_code) return toast.error('Name and Account Code required');
    const { data, error } = await supabase.from('customers').insert([{ ...newCustomer, current_balance: 0, status: 'active', tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setCustomers([data, ...customers]);
    setShowCustomerModal(false);
    setNewCustomer({ account_code: '', full_name: '', company_name: '', category_id: '', zone_id: '', phone: '', address: '', credit_limit: 0, payment_terms: 'Net 30', is_wholesale: false });
    toast.success('Customer created successfully');
  };

  const loadLedger = async (customer: Customer) => {
    const { data, error } = await supabase.from('customer_transactions').select('*').eq('customer_id', customer.id).order('transaction_date', { ascending: false });
    if (!error && data) setCustomerLedger(data);
  };

  const handleAddTransaction = async () => {
    if (!selectedCustomer) return;
    if (newTx.amount <= 0) return toast.error('Amount must be greater than zero');
    
    // Calculate new balance: if invoice, balance increases. If payment/return, balance decreases. (Assumption based on standard AR)
    let amountChange = newTx.transaction_type === 'invoice' ? newTx.amount : -newTx.amount;
    const newBalance = Number(selectedCustomer.current_balance) + amountChange;

    try {
      // Insert Transaction
      const { error: txErr } = await supabase.from('customer_transactions').insert([{
        tenant_id: tenantId, customer_id: selectedCustomer.id,
        transaction_type: newTx.transaction_type, amount: newTx.amount, balance_after: newBalance,
        reference_no: newTx.reference_no, notes: newTx.notes
      }]);
      if (txErr) throw txErr;

      // Update Customer
      const { error: cErr } = await supabase.from('customers').update({ current_balance: newBalance }).eq('id', selectedCustomer.id);
      if (cErr) throw cErr;

      // Warnings for credit limit (non-blocking)
      if (selectedCustomer.is_wholesale && selectedCustomer.credit_limit > 0 && newBalance > selectedCustomer.credit_limit) {
        toast.warning(`Notice: Transaction exceeds ${selectedCustomer.full_name}'s credit limit!`, 8000);
      } else {
        toast.success('Transaction logged successfully');
      }

      setShowTransactionModal(false);
      setNewTx({ transaction_type: 'payment', amount: 0, reference_no: '', notes: '' });
      fetchData(); // Refresh all to get updated balance
    } catch (err: any) {
      toast.error('Transaction error: ' + err.message);
    }
  };

  const handleAddTicket = async () => {
    if (!newTicket.customer_id || !newTicket.subject) return toast.error('Customer and Subject required');
    const { data, error } = await supabase.from('customer_feedback_tickets').insert([{ ...newTicket, status: 'open', tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setTickets([data, ...tickets]);
    setShowTicketModal(false);
    setNewTicket({ customer_id: '', subject: '', description: '', priority: 'low' });
    toast.success('Support ticket created');
  };

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(search.toLowerCase()) || 
    c.account_code.toLowerCase().includes(search.toLowerCase()) ||
    (c.company_name && c.company_name.toLowerCase().includes(search.toLowerCase()))
  );
  
  const wholesaleCustomers = filteredCustomers.filter(c => c.is_wholesale);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Customer Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage categories, wholesale accounts, and support tickets dynamically.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-max">
        {[
          { id: 'directory', label: 'Directory', icon: Users },
          { id: 'wholesale', label: 'Wholesale Accounts', icon: Building2 },
          { id: 'support', label: 'Support & Feedback', icon: HeadphonesIcon },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-500">Loading customer data...</div>
        ) : (
          <>
            {/* DIRECTORY TAB */}
            {activeTab === 'directory' && (
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCategoryModal(true)} className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Category
                    </button>
                    <button onClick={() => setShowZoneModal(true)} className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Zone
                    </button>
                    <button onClick={() => setShowCustomerModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Customer
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="py-3 px-4 font-medium">Account</th>
                        <th className="py-3 px-4 font-medium">Name</th>
                        <th className="py-3 px-4 font-medium">Category / Zone</th>
                        <th className="py-3 px-4 font-medium">Phone</th>
                        <th className="py-3 px-4 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {filteredCustomers.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-slate-500">No customers found.</td></tr>
                      )}
                      {filteredCustomers.map(c => {
                        const cat = categories.find(x => x.id === c.category_id);
                        const zone = zones.find(x => x.id === c.zone_id);
                        return (
                          <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 font-medium text-slate-900">{c.account_code}</td>
                            <td className="py-3 px-4 text-slate-900">
                              <div>{c.full_name}</div>
                              {c.company_name && <div className="text-xs text-slate-500">{c.company_name}</div>}
                            </td>
                            <td className="py-3 px-4 text-slate-600">
                              <div>{cat?.name || '-'}</div>
                              <div className="text-xs text-slate-400">{zone?.zone_name || '-'}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{c.phone || '-'}</td>
                            <td className="py-3 px-4 text-center">
                              {c.status === 'active' ? 
                                <span className="inline-flex px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium">Active</span> :
                                <span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">Inactive</span>
                              }
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* WHOLESALE TAB */}
            {activeTab === 'wholesale' && (
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Wholesale Partners & Credit Lines</h2>
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input type="text" placeholder="Search wholesale..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wholesaleCustomers.length === 0 && <div className="col-span-full py-8 text-center text-slate-500">No wholesale accounts found.</div>}
                  {wholesaleCustomers.map(c => {
                    const overLimit = c.credit_limit > 0 && c.current_balance > c.credit_limit;
                    return (
                      <div key={c.id} className={`border rounded-xl p-4 shadow-sm transition-shadow ${overLimit ? 'border-rose-200 bg-rose-50' : 'border-slate-200'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-900 truncate">{c.company_name || c.full_name}</span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded">{c.payment_terms}</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">{c.account_code}</p>
                        
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-slate-600">Balance:</span>
                          <span className={`text-sm font-bold ${overLimit ? 'text-rose-600' : 'text-slate-900'}`}>${c.current_balance.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-slate-600">Credit Limit:</span>
                          <span className="text-sm font-medium text-slate-700">${c.credit_limit > 0 ? c.credit_limit.toFixed(2) : 'Unlimited'}</span>
                        </div>

                        {overLimit && (
                          <div className="mb-4 flex items-center gap-1 text-xs text-rose-600 font-medium">
                            <AlertTriangle className="w-3 h-3" /> Credit Limit Exceeded
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedCustomer(c); setShowTransactionModal(true); }} className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex justify-center items-center gap-1">
                            <CreditCard className="w-3 h-3" /> Add Tx
                          </button>
                          <button onClick={() => { setSelectedCustomer(c); loadLedger(c); }} className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex justify-center items-center gap-1 border border-slate-200">
                            <FileText className="w-3 h-3" /> Ledger
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* SUPPORT TAB */}
            {activeTab === 'support' && (
              <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Support Tickets & Feedback</h2>
                  <button onClick={() => setShowTicketModal(true)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Ticket
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="py-3 px-4 font-medium">Date</th>
                        <th className="py-3 px-4 font-medium">Customer</th>
                        <th className="py-3 px-4 font-medium">Subject</th>
                        <th className="py-3 px-4 font-medium text-center">Priority</th>
                        <th className="py-3 px-4 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {tickets.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-slate-500">No support tickets found.</td></tr>
                      )}
                      {tickets.map(t => {
                        const cust = customers.find(c => c.id === t.customer_id);
                        return (
                          <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-600">{new Date(t.created_at).toLocaleDateString()}</td>
                            <td className="py-3 px-4 font-medium text-slate-900">{cust?.full_name || 'Unknown'}</td>
                            <td className="py-3 px-4 text-slate-800">{t.subject}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold uppercase ${
                                t.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                                t.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                t.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                              }`}>{t.priority}</span>
                            </td>
                            <td className="py-3 px-4 text-center">
                               <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold uppercase ${
                                t.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                                t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                              }`}>{t.status.replace('_', ' ')}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Customer Category</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
                <input type="text" value={newCat.name} onChange={e => setNewCat({...newCat, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. VIP Retail" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default Discount Rate (%)</label>
                <input type="number" value={newCat.discount_rate} onChange={e => setNewCat({...newCat, discount_rate: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="0" max="100" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCategoryModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddCategory} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {showZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Geographical Zone</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Zone Name</label>
                <input type="text" value={newZone.zone_name} onChange={e => setNewZone({...newZone, zone_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. North Region" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowZoneModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddZone} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {showCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Customer Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Code</label>
                <input type="text" value={newCustomer.account_code} onChange={e => setNewCustomer({...newCustomer, account_code: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="CUST-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name (Contact)</label>
                <input type="text" value={newCustomer.full_name} onChange={e => setNewCustomer({...newCustomer, full_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name (Optional)</label>
                <input type="text" value={newCustomer.company_name} onChange={e => setNewCustomer({...newCustomer, company_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Acme Corp" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input type="text" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select value={newCustomer.category_id} onChange={e => setNewCustomer({...newCustomer, category_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Zone / Region</label>
                <select value={newCustomer.zone_id} onChange={e => setNewCustomer({...newCustomer, zone_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="">None</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.zone_name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 flex items-center gap-2 py-2 border-y border-slate-100 my-2">
                <input type="checkbox" id="is_whole" checked={newCustomer.is_wholesale} onChange={e => setNewCustomer({...newCustomer, is_wholesale: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                <label htmlFor="is_whole" className="text-sm font-medium text-slate-700">This is a Wholesale / B2B Account</label>
              </div>
              {newCustomer.is_wholesale && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Credit Limit ($)</label>
                    <input type="number" value={newCustomer.credit_limit} onChange={e => setNewCustomer({...newCustomer, credit_limit: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms</label>
                    <input type="text" value={newCustomer.payment_terms} onChange={e => setNewCustomer({...newCustomer, payment_terms: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Net 30, COD, etc." />
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowCustomerModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddCustomer} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Save Profile</button>
            </div>
          </div>
        </div>
      )}

      {showTransactionModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Log Transaction</h3>
            <p className="text-sm text-slate-500 mb-4">Account: {selectedCustomer.full_name}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select value={newTx.transaction_type} onChange={e => setNewTx({...newTx, transaction_type: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="invoice">Invoice (Increase Balance)</option>
                  <option value="payment">Payment (Decrease Balance)</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="return">Return / Credit</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                <input type="number" value={newTx.amount} onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" min="0" step="0.01" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reference No (Optional)</label>
                <input type="text" value={newTx.reference_no} onChange={e => setNewTx({...newTx, reference_no: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="INV-00123" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowTransactionModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddTransaction} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Post Transaction</button>
            </div>
          </div>
        </div>
      )}

      {selectedCustomer && customerLedger.length > 0 && !showTransactionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Account Ledger</h3>
                <p className="text-sm text-slate-500">{selectedCustomer.full_name} ({selectedCustomer.account_code})</p>
              </div>
              <button onClick={() => setCustomerLedger([])} className="p-2 text-slate-400 hover:text-slate-700"><X className="w-5 h-5"/></button>
            </div>
            <div className="flex-1 overflow-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Ref</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {customerLedger.map(tx => (
                      <tr key={tx.id} className="border-b border-slate-100">
                        <td className="py-3 px-4">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-mono text-xs">{tx.reference_no || '-'}</td>
                        <td className="py-3 px-4 capitalize">{tx.transaction_type}</td>
                        <td className="py-3 px-4 text-right">${tx.amount}</td>
                        <td className="py-3 px-4 text-right font-medium">${tx.balance_after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>
        </div>
      )}

      {showTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">New Support Ticket</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                <select value={newTicket.customer_id} onChange={e => setNewTicket({...newTicket, customer_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="">Select Customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject / Issue</label>
                <input type="text" value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Late Delivery" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowTicketModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddTicket} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Create Ticket</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
