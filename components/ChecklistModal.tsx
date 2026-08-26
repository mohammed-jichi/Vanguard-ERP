'use client';

import React, { useState } from 'react';
import { X, Check, ChevronDown, Video, Pencil, Plus, CheckSquare, Save } from 'lucide-react';

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchTutorial?: () => void;
}

interface ChecklistItem {
  id: number;
  description: string;
  completed: boolean;
}

export default function ChecklistModal({ isOpen, onClose, onWatchTutorial }: ChecklistModalProps) {
  const [isActionsOpen, setIsActionsOpen] = useState<boolean>(false);
  const [activeChecklistTitle, setActiveChecklistTitle] = useState<string>("Month-End Inventory Closing");
  const [isTitleSelectorOpen, setIsTitleSelectorOpen] = useState<boolean>(false);

  // Sub-modal for New Checklist item state
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newDescription, setNewDescription] = useState<string>('');

  // Checklist options list
  const titleOptions = [
    "Month-End Inventory Closing",
    "Daily Tasks",
    "Daily Task"
  ];

  // 9 Exact Checklist Rows with default toggles
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 1,
      description: "Sales and End Of Days. Make sure the sales, End of days and any other revenue that has been earned are entered and POSTED accurately.",
      completed: false
    },
    {
      id: 2,
      description: "Purchases. Make sure that all your Purchase invoices are entered and POSTED for this month before entering the Inventory Adjustment.",
      completed: false
    },
    {
      id: 3,
      description: "Wastages. Make sure that all your wastages are entered and Posted.",
      completed: false
    },
    {
      id: 4,
      description: "Transfers. Verify that all transfers are entered.",
      completed: false
    },
    {
      id: 5,
      description: "Physical Count: Conduct a physical count of all inventory items on hand to verify the actual quantity and condition of the items. Enter it in the Adjustments and export the report to track variances",
      completed: false
    },
    {
      id: 6,
      description: "Adjustments: and amortization: Calculate and record depreciation expenses for fixed assets and amortization expenses for intangible assets.",
      completed: false
    },
    {
      id: 7,
      description: "Generate the Inventory Report. This is needed for the accounting month-closing.",
      completed: false
    },
    {
      id: 8,
      description: "Calculate the cost of goods sold (COGS): Determine the COGS for the period by subtracting the value of ending inventory from the sum of the beginning inventory and purchases.",
      completed: false
    },
    {
      id: 9,
      description: "Analysis and Review: Analyze the inventory performance, trends, and turnover ratios to identify any issues, opportunities for improvement, or potential inventory management adjustments.",
      completed: false
    }
  ]);

  if (!isOpen) return null;

  const toggleItem = (id: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleSetDefault = () => {
    setItems(prev => prev.map(item => ({ ...item, completed: false })));
    alert('Checklist items reset to default state.');
  };

  const handleDeleteRow = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleEditRow = (id: number, currentDesc: string) => {
    const updated = prompt("Edit Checklist Item Description:", currentDesc);
    if (updated !== null && updated.trim() !== '') {
      setItems(prev => prev.map(item => item.id === id ? { ...item, description: updated.trim() } : item));
    }
  };

  const handleSaveNewItem = () => {
    if (!newDescription.trim()) {
      alert("Please enter a checklist description.");
      return;
    }
    const newItem: ChecklistItem = {
      id: Date.now(),
      description: newDescription.trim(),
      completed: false
    };
    setItems(prev => [...prev, newItem]);
    setNewDescription('');
    setShowNewModal(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl font-sans dir-ltr text-left overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 relative">
        
        {/* 1. HEADER & TITLE AREA */}
        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50/50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-lg">Checklist Items</h3>
            </div>
            <p className="text-slate-500 font-semibold text-xs mt-0.5">{activeChecklistTitle}</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onWatchTutorial || (() => alert('Opening Checklist Video Tutorial...'))}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Watch Tutorial</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. ACTION BAR */}
        <div className="bg-slate-100/70 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-800 text-xs">{activeChecklistTitle}</span>

          <div className="flex items-center gap-2">
            {/* GREEN SET DEFAULT BUTTON */}
            <button
              onClick={handleSetDefault}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs text-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Set Default</span>
            </button>

            {/* DARK SLATE ACTIONS DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs text-xs"
              >
                <span>Actions</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {isActionsOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-xl z-50 p-1 space-y-0.5 text-xs font-semibold">
                  <button
                    onClick={() => { setIsTitleSelectorOpen(true); setIsActionsOpen(false); }}
                    className="w-full text-left p-2 hover:bg-amber-50 text-slate-700 hover:text-amber-900 rounded-lg flex items-center gap-2"
                  >
                    <Pencil className="w-3.5 h-3.5 text-amber-600" />
                    <span>Edit Check List</span>
                  </button>
                  <button
                    onClick={() => { setShowNewModal(true); setIsActionsOpen(false); }}
                    className="w-full text-left p-2 hover:bg-amber-50 text-slate-700 hover:text-amber-900 rounded-lg flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    <span>New Check List</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. DATA TABLE AREA */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                {/* MAIN TABLE TITLE ROW WITH IN-PLACE DROPDOWN SELECTOR & + NEW BUTTON */}
                <tr className="bg-slate-800 text-white font-black">
                  <th colSpan={3} className="py-2.5 px-4 text-xs">
                    <div className="flex items-center justify-between">
                      
                      {/* CLICKABLE TITLE / DROPDOWN SELECTOR */}
                      <div className="relative">
                        <button
                          onClick={() => setIsTitleSelectorOpen(!isTitleSelectorOpen)}
                          className="flex items-center gap-2 hover:text-sky-300 transition-colors text-xs font-black"
                        >
                          <span>{activeChecklistTitle}</span>
                          <Pencil className="w-3.5 h-3.5 text-sky-400" />
                        </button>

                        {/* TITLE DROPDOWN SELECTOR MENU */}
                        {isTitleSelectorOpen && (
                          <div className="absolute left-0 mt-2 w-64 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-2xl z-50 p-1 space-y-1 font-semibold text-xs">
                            {titleOptions.map(opt => (
                              <button
                                key={opt}
                                onClick={() => { setActiveChecklistTitle(opt); setIsTitleSelectorOpen(false); }}
                                className={`w-full text-left p-2 rounded-lg transition-colors ${
                                  activeChecklistTitle === opt
                                    ? 'bg-sky-600 text-white font-bold'
                                    : 'hover:bg-slate-100 text-slate-800'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* DARK GRAY + NEW BUTTON */}
                      <button
                        onClick={() => setShowNewModal(true)}
                        className="bg-slate-600 hover:bg-slate-700 text-white font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ New</span>
                      </button>

                    </div>
                  </th>
                </tr>

                {/* COLUMN HEADERS */}
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4 w-[70%] border-r border-slate-200">
                    <div className="flex items-center gap-1 cursor-pointer select-none">
                      <span>Description</span>
                      <span className="text-slate-400 text-[10px]">▲▼</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-4 w-[15%] text-center border-r border-slate-200">
                    <span>Status</span>
                  </th>
                  <th className="py-2.5 px-4 w-[15%] text-center">
                    <span>Actions</span>
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY (RENDER ROWS WITH TOGGLES AND ACTIONS) */}
              <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
                {items.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* DESCRIPTION COLUMN */}
                    <td className="py-3 px-4 leading-relaxed border-r border-slate-200 text-xs font-semibold text-slate-800">
                      {row.description}
                    </td>

                    {/* STATUS TOGGLE COLUMN */}
                    <td className="py-3 px-4 text-center align-middle border-r border-slate-200">
                      <button
                        onClick={() => toggleItem(row.id)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          row.completed ? 'bg-emerald-600' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            row.completed ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>

                    {/* ACTIONS COLUMN (EDIT & DELETE SQUARE BUTTONS) */}
                    <td className="py-3 px-4 text-center align-middle">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* EDIT BUTTON: DARK GRAY (bg-slate-600) */}
                        <button
                          onClick={() => handleEditRow(row.id, row.description)}
                          title="Edit Item"
                          className="bg-slate-600 hover:bg-slate-700 text-white p-1.5 rounded-lg flex items-center justify-center transition-colors shadow-2xs"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* DELETE BUTTON: DARK RED/BROWN (bg-[#5c3a21]) */}
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          title="Delete Item"
                          className="bg-[#5c3a21] hover:bg-amber-900 text-white p-1.5 rounded-lg flex items-center justify-center transition-colors shadow-2xs"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. FOOTER: GRAY DISABLED INPUT BOX AT BOTTOM CENTER (HIGH CONTRAST DARK TEXT) */}
        <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-center">
          <input
            type="text"
            readOnly
            disabled
            value="Aug-2026"
            className="w-32 py-1.5 px-3 bg-gray-200 text-gray-900 font-mono font-black text-xs rounded-xl text-center border border-gray-300 cursor-not-allowed shadow-inner opacity-100 disabled:opacity-100 text-black"
          />
        </div>

      </div>

      {/* 5. "NEW CHECKLIST" SUB-MODAL OVERLAY (NO ROUTING) */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-60 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl font-sans dir-ltr text-left overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            
            {/* SUB-MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">New Checklist</h4>
                <p className="text-slate-500 font-semibold text-xs mt-0.5">Add New Checklist</p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SUB-MODAL BODY */}
            <div className="p-6 space-y-3 text-xs">
              <label className="block text-slate-700 font-extrabold uppercase tracking-wider text-[11px]">
                Checklist Description *
              </label>
              <textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Enter checklist item description..."
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 shadow-2xs resize-none"
              />
            </div>

            {/* SUB-MODAL FOOTER WITH SAVE BUTTON */}
            <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-end">
              <button
                onClick={handleSaveNewItem}
                className="bg-slate-700 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
