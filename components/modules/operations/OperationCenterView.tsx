'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useTenant } from '@/lib/TenantContext';
import { toast } from '@/lib/toast';
import { 
  Package, Box, Activity, Plus, Search, CheckCircle2, 
  Settings, AlertCircle, ChevronDown, ListFilter, Beaker
} from 'lucide-react';

interface Unit {
  id: string;
  name: string;
  code: string;
}

interface Material {
  id: string;
  name: string;
  unit_id: string;
  current_stock: number;
  reorder_level: number;
  cost_per_unit: number;
}

interface Recipe {
  id: string;
  recipe_name: string;
  output_item_name: string;
  default_batch_size: number;
}

interface Batch {
  id: string;
  batch_number: string;
  recipe_id: string;
  output_item_name: string;
  quantity_produced: number;
  status: 'draft' | 'completed';
  production_date: string;
}

export function OperationCenterView() {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id || 'default-tenant';

  const [activeTab, setActiveTab] = useState<'materials' | 'production' | 'qc'>('materials');
  const [loading, setLoading] = useState(true);

  // Data State
  const [units, setUnits] = useState<Unit[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  // Modal States
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showQcModal, setShowQcModal] = useState(false);

  // Form States
  const [newUnit, setNewUnit] = useState({ name: '', code: '' });
  const [newMaterial, setNewMaterial] = useState({ name: '', unit_id: '', current_stock: 0, reorder_level: 0, cost_per_unit: 0 });
  const [newRecipe, setNewRecipe] = useState({ recipe_name: '', output_item_name: '', default_batch_size: 1 });
  const [newBatch, setNewBatch] = useState({ batch_number: '', recipe_id: '', output_item_name: '', quantity_produced: 0, production_date: new Date().toISOString().split('T')[0] });
  const [newQc, setNewQc] = useState({ batch_id: '', test_name: '', test_value: '', is_passed: true });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, mRes, rRes, bRes] = await Promise.all([
        supabase.from('units_of_measure').select('*').eq('tenant_id', tenantId),
        supabase.from('raw_materials').select('*').eq('tenant_id', tenantId),
        supabase.from('production_recipes').select('*').eq('tenant_id', tenantId),
        supabase.from('production_batches').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false })
      ]);

      if (uRes.data) setUnits(uRes.data);
      if (mRes.data) setMaterials(mRes.data);
      if (rRes.data) setRecipes(rRes.data);
      if (bRes.data) setBatches(bRes.data);
    } catch (err: any) {
      toast.error('Failed to load operation center data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) fetchData();
  }, [tenantId]);

  const handleAddUnit = async () => {
    if (!newUnit.name || !newUnit.code) return toast.error('Unit name and code are required');
    const { data, error } = await supabase.from('units_of_measure').insert([{ ...newUnit, tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setUnits([...units, data]);
    setShowUnitModal(false);
    setNewUnit({ name: '', code: '' });
    toast.success('Unit added successfully');
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.unit_id) return toast.error('Material name and unit are required');
    const { data, error } = await supabase.from('raw_materials').insert([{ ...newMaterial, tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setMaterials([...materials, data]);
    setShowMaterialModal(false);
    setNewMaterial({ name: '', unit_id: '', current_stock: 0, reorder_level: 0, cost_per_unit: 0 });
    toast.success('Material added successfully');
  };

  const handleAddRecipe = async () => {
    if (!newRecipe.recipe_name || !newRecipe.output_item_name) return toast.error('Recipe name and output item are required');
    const { data, error } = await supabase.from('production_recipes').insert([{ ...newRecipe, tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setRecipes([...recipes, data]);
    setShowRecipeModal(false);
    setNewRecipe({ recipe_name: '', output_item_name: '', default_batch_size: 1 });
    toast.success('Recipe added successfully');
  };

  const handleAddBatch = async () => {
    if (!newBatch.batch_number || !newBatch.output_item_name) return toast.error('Batch number and output item are required');
    const { data, error } = await supabase.from('production_batches').insert([{ ...newBatch, status: 'draft', tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setBatches([data, ...batches]);
    setShowBatchModal(false);
    setNewBatch({ batch_number: '', recipe_id: '', output_item_name: '', quantity_produced: 0, production_date: new Date().toISOString().split('T')[0] });
    toast.success('Batch created in Draft status');
  };

  const handleCompleteBatch = async (batch: Batch) => {
    try {
      // 1. Mark batch as completed
      const { error: batchErr } = await supabase.from('production_batches').update({ status: 'completed' }).eq('id', batch.id);
      if (batchErr) throw batchErr;

      // 2. If it has a recipe, deduct raw materials
      if (batch.recipe_id) {
        const { data: ingredients } = await supabase.from('recipe_ingredients').select('*').eq('recipe_id', batch.recipe_id);
        if (ingredients && ingredients.length > 0) {
          for (const ing of ingredients) {
            const material = materials.find(m => m.id === ing.raw_material_id);
            if (material) {
              const deduction = Number(ing.quantity_required) * Number(batch.quantity_produced);
              await supabase.from('raw_materials').update({ current_stock: material.current_stock - deduction }).eq('id', material.id);
            }
          }
        }
      }
      
      // Update local state
      toast.success(`Batch ${batch.batch_number} marked as Completed`);
      fetchData(); // Refresh all
    } catch (err: any) {
      toast.error('Error completing batch: ' + err.message);
    }
  };

  const handleAddQc = async () => {
    if (!newQc.batch_id || !newQc.test_name) return toast.error('Batch and Test Name are required');
    const { error } = await supabase.from('quality_checks').insert([{ ...newQc, tenant_id: tenantId }]);
    if (error) return toast.error(error.message);
    setShowQcModal(false);
    setNewQc({ batch_id: '', test_name: '', test_value: '', is_passed: true });
    toast.success('Quality Check recorded');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            Operation Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage dynamic units, materials, recipes, and production batches.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-max">
        {[
          { id: 'materials', label: 'Materials & Units', icon: Box },
          { id: 'production', label: 'Production & Batches', icon: Package },
          { id: 'qc', label: 'Quality Control', icon: Beaker },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-500">Loading operation center data...</div>
        ) : (
          <>
            {activeTab === 'materials' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Raw Materials Inventory</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setShowUnitModal(true)} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Manage Units
                    </button>
                    <button onClick={() => setShowMaterialModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Material
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="py-3 px-4 font-medium">Name</th>
                        <th className="py-3 px-4 font-medium">Unit</th>
                        <th className="py-3 px-4 font-medium text-right">Stock</th>
                        <th className="py-3 px-4 font-medium text-right">Cost/Unit</th>
                        <th className="py-3 px-4 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {materials.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-slate-500">No raw materials found. Add one dynamically.</td></tr>
                      )}
                      {materials.map(m => {
                        const unit = units.find(u => u.id === m.unit_id);
                        const isLowStock = m.current_stock <= m.reorder_level;
                        return (
                          <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 font-medium text-slate-900">{m.name}</td>
                            <td className="py-3 px-4 text-slate-600">{unit?.code || '-'}</td>
                            <td className="py-3 px-4 text-right font-medium">{m.current_stock}</td>
                            <td className="py-3 px-4 text-right">${m.cost_per_unit}</td>
                            <td className="py-3 px-4 text-center">
                              {isLowStock ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                                  <AlertCircle className="w-3 h-3" /> Low Stock
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                  <CheckCircle2 className="w-3 h-3" /> OK
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'production' && (
              <div className="p-6">
                 <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Production Batches</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setShowRecipeModal(true)} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 flex items-center gap-2">
                      <ListFilter className="w-4 h-4" /> Manage Recipes
                    </button>
                    <button onClick={() => setShowBatchModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> New Batch
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {batches.length === 0 && <div className="col-span-full py-8 text-center text-slate-500">No batches recorded.</div>}
                  {batches.map(batch => (
                    <div key={batch.id} className="border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-900">{batch.batch_number}</span>
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${batch.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {batch.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">Output: <span className="font-medium text-slate-900">{batch.output_item_name}</span></p>
                      <p className="text-sm text-slate-600 mb-4">Qty: <span className="font-medium text-slate-900">{batch.quantity_produced}</span></p>
                      
                      {batch.status === 'draft' && (
                        <button onClick={() => handleCompleteBatch(batch)} className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg flex justify-center items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Complete Batch
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'qc' && (
              <div className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                <Beaker className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-xl font-bold text-slate-700 mb-2">Quality Control Logs</h2>
                <p className="text-slate-500 mb-6 max-w-md text-center text-sm">Dynamically record QC parameters for completed batches to assure traceability and quality standards.</p>
                <button onClick={() => setShowQcModal(true)} className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" /> Record New QC Test
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      
      {/* Unit Modal */}
      {showUnitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Dynamic Unit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Name</label>
                <input type="text" value={newUnit.name} onChange={e => setNewUnit({...newUnit, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Kilograms" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Code</label>
                <input type="text" value={newUnit.code} onChange={e => setNewUnit({...newUnit, code: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. KG" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowUnitModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddUnit} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save Unit</button>
            </div>
          </div>
        </div>
      )}

      {/* Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Raw Material</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Material Name</label>
                <input type="text" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Organic Olives" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <select value={newMaterial.unit_id} onChange={e => setNewMaterial({...newMaterial, unit_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="">Select Unit...</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
                  <input type="number" value={newMaterial.current_stock} onChange={e => setNewMaterial({...newMaterial, current_stock: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" min="0" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label>
                  <input type="number" value={newMaterial.reorder_level} onChange={e => setNewMaterial({...newMaterial, reorder_level: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cost / Unit ($)</label>
                  <input type="number" value={newMaterial.cost_per_unit} onChange={e => setNewMaterial({...newMaterial, cost_per_unit: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" min="0" step="0.01" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowMaterialModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddMaterial} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save Material</button>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Modal */}
      {showRecipeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Production Recipe</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recipe Name</label>
                <input type="text" value={newRecipe.recipe_name} onChange={e => setNewRecipe({...newRecipe, recipe_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Standard Olive Oil Press" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Output Item Name</label>
                <input type="text" value={newRecipe.output_item_name} onChange={e => setNewRecipe({...newRecipe, output_item_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Extra Virgin Olive Oil" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowRecipeModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddRecipe} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save Recipe</button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Initialize Production Batch</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batch Number</label>
                <input type="text" value={newBatch.batch_number} onChange={e => setNewBatch({...newBatch, batch_number: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. BATCH-001" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Output Item (or link Recipe)</label>
                <select 
                  value={newBatch.recipe_id} 
                  onChange={e => {
                    const r = recipes.find(x => x.id === e.target.value);
                    setNewBatch({...newBatch, recipe_id: e.target.value, output_item_name: r ? r.output_item_name : ''});
                  }} 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white mb-2"
                >
                  <option value="">Custom (No Recipe)...</option>
                  {recipes.map(r => <option key={r.id} value={r.id}>{r.recipe_name}</option>)}
                </select>
                <input type="text" value={newBatch.output_item_name} onChange={e => setNewBatch({...newBatch, output_item_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Output Item Name" disabled={!!newBatch.recipe_id} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Produced</label>
                <input type="number" value={newBatch.quantity_produced} onChange={e => setNewBatch({...newBatch, quantity_produced: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" min="1" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowBatchModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddBatch} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Initialize Batch</button>
            </div>
          </div>
        </div>
      )}

      {/* QC Modal */}
      {showQcModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Record Quality Check</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batch</label>
                <select value={newQc.batch_id} onChange={e => setNewQc({...newQc, batch_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                  <option value="">Select Batch...</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.batch_number} - {b.output_item_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Test Name</label>
                <input type="text" value={newQc.test_name} onChange={e => setNewQc({...newQc, test_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Acidity Level" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Test Value</label>
                <input type="text" value={newQc.test_value} onChange={e => setNewQc({...newQc, test_value: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 0.8%" />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="is_passed" checked={newQc.is_passed} onChange={e => setNewQc({...newQc, is_passed: e.target.checked})} className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                <label htmlFor="is_passed" className="text-sm font-medium text-slate-700">Passed Quality Standard</label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowQcModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddQc} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save Record</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
