'use client';

import React, { useState, useMemo, useEffect } from 'react';
import NewInventoryItemModal from './NewInventoryItemModal';
import {
  Search,
  Plus,
  Filter as FilterIcon,
  Check,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  OMEGA_INVENTORY_ITEMS,
  OMEGA_INVENTORY_CATEGORIES,
  AuthenticInventoryItem
} from '@/lib/omegaInventoryCatalog';

export interface SelectedTransferItemPayload {
  code: string;
  description: string;
  barcode: string;
  qtyTransfered: number;
  unit: string;
  unitCostUsd: number;
  avgCostUsd: number;
  qtyOnHand: number;
  remark: string;
}

interface SearchInventoryItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearch?: string;
  onAddItems: (items: SelectedTransferItemPayload[]) => void;
}

export default function SearchInventoryItemsModal({
  isOpen,
  onClose,
  initialSearch = '',
  onAddItems
}: SearchInventoryItemsModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [catalogItems, setCatalogItems] = useState<AuthenticInventoryItem[]>(OMEGA_INVENTORY_ITEMS);
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState<boolean>(false);
  const [createdItemSuccess, setCreatedItemSuccess] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(0); // 0 = All
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [filterSupplier, setFilterSupplier] = useState<string>('ALL');

  // Row state: quantities, remarks, selection
  const [rowQuantities, setRowQuantities] = useState<Record<string, number | string>>({});
  const [rowRemarks, setRowRemarks] = useState<Record<string, string>>({});
  const [selectedItemCodes, setSelectedItemCodes] = useState<Record<string, boolean>>({});

  // Sync initial search when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery(initialSearch || '');
      setCurrentPage(1);
    }
  }, [isOpen, initialSearch]);

  const pageSize = 15;

  // Filter items matching query & category
  const filteredItems = useMemo(() => {
    return catalogItems.filter((item) => {
      // Category filter
      if (selectedCategoryId !== 0 && item.categoryId !== selectedCategoryId) {
        return false;
      }

      // Text search: matches description, code, or barcode
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchBarcode = item.barcode.toLowerCase().includes(q);
        if (!matchDesc && !matchCode && !matchBarcode) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, selectedCategoryId, catalogItems]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  // Reset page if out of bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Current page slice
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  // Handle select all for current page
  const isAllCurrentSelected = useMemo(() => {
    if (paginatedItems.length === 0) return false;
    return paginatedItems.every((it) => selectedItemCodes[it.code]);
  }, [paginatedItems, selectedItemCodes]);

  const handleToggleSelectAll = (checked: boolean) => {
    const updated = { ...selectedItemCodes };
    paginatedItems.forEach((it) => {
      updated[it.code] = checked;
    });
    setSelectedItemCodes(updated);
  };

  const handleToggleItem = (code: string) => {
    setSelectedItemCodes((prev) => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  const handleQuantityChange = (code: string, val: string) => {
    setRowQuantities((prev) => ({ ...prev, [code]: val }));
    // Auto-select row if quantity entered
    if (val && parseFloat(val) > 0) {
      setSelectedItemCodes((prev) => ({ ...prev, [code]: true }));
    }
  };

  const handleRemarkChange = (code: string, val: string) => {
    setRowRemarks((prev) => ({ ...prev, [code]: val }));
  };

  // Submit selected items
  const handleAddSelected = () => {
    const selectedToTransfer: SelectedTransferItemPayload[] = [];

    // Find all items selected or with positive quantity
    catalogItems.forEach((it) => {
      const isSelected = selectedItemCodes[it.code];
      const rawQty = rowQuantities[it.code];
      const numQty = parseFloat(String(rawQty || '0'));

      if (isSelected || numQty > 0) {
        selectedToTransfer.push({
          code: it.code,
          description: it.description,
          barcode: it.barcode,
          qtyTransfered: numQty > 0 ? numQty : 1, // default 1 if checked without qty
          unit: it.unit || 'KG',
          unitCostUsd: it.unitCostUsd,
          avgCostUsd: it.avgCostUsd,
          qtyOnHand: it.qtyOH,
          remark: rowRemarks[it.code] || ''
        });
      }
    });

    if (selectedToTransfer.length === 0) {
      // If nothing checked, check if there's an active row or notify
      return;
    }

    onAddItems(selectedToTransfer);
    // Reset selection and close
    setSelectedItemCodes({});
    setRowQuantities({});
    setRowRemarks({});
    onClose();
  };

  // Quick reset / New
  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategoryId(0);
    setCurrentPage(1);
    setSelectedItemCodes({});
    setRowQuantities({});
    setRowRemarks({});
  };

  
  // Callback when a new inventory item is created via NewInventoryItemModal
  const handleItemCreated = (newItem: AuthenticInventoryItem, andSelectDirectly?: boolean) => {
    setCatalogItems([...OMEGA_INVENTORY_ITEMS]);

    if (andSelectDirectly) {
      onAddItems([
        {
          code: newItem.code,
          description: newItem.description,
          barcode: newItem.barcode,
          qtyTransfered: 1,
          unit: newItem.unit || 'KG',
          unitCostUsd: newItem.unitCostUsd,
          avgCostUsd: newItem.avgCostUsd,
          qtyOnHand: newItem.qtyOH,
          remark: 'Newly created item'
        }
      ]);
      onClose();
    } else {
      setSearchQuery(newItem.code);
      setSelectedCategoryId(0);
      setCurrentPage(1);
      setSelectedItemCodes((prev) => ({ ...prev, [newItem.code]: true }));
      setRowQuantities((prev) => ({ ...prev, [newItem.code]: 1 }));
      setCreatedItemSuccess(`Item "${newItem.code}" created successfully and selected.`);
      setTimeout(() => setCreatedItemSuccess(null), 4000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl border border-slate-300 flex flex-col max-h-[92vh] overflow-hidden text-slate-800 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* =========================================================================
            1. MODAL HEADER (Matching Omega ERP)
            ========================================================================= */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white">
          <h2 className="text-base font-semibold text-slate-700">
            Search Inventory Items
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition p-1 rounded hover:bg-slate-100"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

                {/* Success notification banner */}
        {createdItemSuccess && (
          <div className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-200" />
              <span>{createdItemSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setCreatedItemSuccess(null)}
              className="text-white hover:text-emerald-100 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}
        {/* =========================================================================
            2. TOP TOOLBAR: Search Input + [+ New] + [Filters] + [Add]
            ========================================================================= */}
        <div className="p-4 pb-3 space-y-3 bg-white">
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                placeholder="Search by description, code, barcode..."
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#337ab7] shadow-2xs"
                autoFocus
              />
            </div>

            {/* + New Button: Opens New Inventory Item Modal */}
            <button
              type="button"
              onClick={() => setIsNewItemModalOpen(true)}
              title="Create New Inventory Item"
              className="px-3.5 py-1.5 bg-[#27ae60] hover:bg-[#219653] text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>

            {/* Filters Button */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-3.5 py-1.5 bg-[#34495e] hover:bg-[#2c3e50] text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <FilterIcon className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Add Button */}
            <button
              type="button"
              onClick={handleAddSelected}
              className="px-4 py-1.5 bg-[#34495e] hover:bg-[#2c3e50] text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Collapsible Advanced Filters */}
          {showAdvancedFilters && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-fade-in">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Category</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    setSelectedCategoryId(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#337ab7]"
                >
                  {OMEGA_INVENTORY_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Supplier</label>
                <select
                  value={filterSupplier}
                  onChange={(e) => setFilterSupplier(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#337ab7]"
                >
                  <option value="ALL">All Suppliers</option>
                  <option value="Abbas & Hussein Dirani">Abbas & Hussein Dirani</option>
                  <option value="Abbas Dirani">Abbas Dirani</option>
                  <option value="B GROUP">B GROUP</option>
                  <option value="C-Way Trading">C-Way Trading</option>
                  <option value="Clatchy">Clatchy</option>
                  <option value="Ezzeddin">Ezzeddin</option>
                  <option value="Koubeissi Est.">Koubeissi Est.</option>
                  <option value="Mrs Randa">Mrs Randa</option>
                  <option value="Safa Bakery">Safa Bakery</option>
                  <option value="Sedi Hisham">Sedi Hisham</option>
                  <option value="SOOL">SOOL</option>
                  <option value="Zahwe">Zahwe</option>
                  <option value="الضيعة">الضيعة</option>
                  <option value="مؤسسة عبده للتجارة">مؤسسة عبده للتجارة</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Location</label>
                <select className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#337ab7]">
                  <option value="0">All Locations</option>
                  <option value="1">Choueifat Main Facility</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* =========================================================================
            3. CATEGORY CAROUSEL TABS (Matching Omega ERP)
            ========================================================================= */}
        <div className="border-y border-slate-200 bg-white flex items-center px-1">
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 transition"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center flex-1 overflow-x-auto custom-scrollbar divide-x divide-slate-200">
            {OMEGA_INVENTORY_CATEGORIES.map((cat) => {
              const isActive = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setCurrentPage(1);
                  }}
                  className={`px-5 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 border-b-2 border-[#337ab7]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 transition"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* =========================================================================
            4. INVENTORY ITEMS TABLE (Matching Screenshot Columns & Styling)
            ========================================================================= */}
        <div className="flex-1 overflow-y-auto min-h-[360px] custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-white border-b border-slate-200 text-slate-700 font-bold shadow-2xs">
              <tr>
                <th className="py-2.5 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={isAllCurrentSelected}
                    onChange={(e) => handleToggleSelectAll(e.target.checked)}
                    className="rounded text-[#337ab7] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3 text-center">QtyOH</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3 text-center w-28">Quantity</th>
                <th className="py-2.5 px-3 w-44">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    No inventory items match your search.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const isChecked = !!selectedItemCodes[item.code];
                  const qtyVal = rowQuantities[item.code] !== undefined ? rowQuantities[item.code] : '';
                  const remarkVal = rowRemarks[item.code] || '';

                  return (
                    <tr
                      key={item.code}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isChecked ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleItem(item.code)}
                          className="rounded text-[#337ab7] focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {item.description}
                      </td>
                      <td className="py-2 px-3 font-mono font-bold text-slate-700">
                        {item.code}
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-slate-600">
                        {item.qtyOH}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-600">
                        {item.unit}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <input
                          type="number"
                          step="any"
                          value={qtyVal}
                          onChange={(e) => handleQuantityChange(item.code, e.target.value)}
                          placeholder=""
                          className="w-24 px-2 py-1 text-center bg-white border border-slate-300 rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#337ab7] shadow-2xs"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={remarkVal}
                          onChange={(e) => handleRemarkChange(item.code, e.target.value)}
                          placeholder=""
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-[#337ab7] shadow-2xs"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* =========================================================================
            5. PAGINATION FOOTER (Matching Screenshot « 1 2 3 4 »)
            ========================================================================= */}
        <div className="py-3 px-4 border-t border-slate-200 bg-white flex items-center justify-center gap-1.5">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 border border-slate-300 rounded text-xs text-[#337ab7] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            «
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
            const isActive = currentPage === pg;
            return (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`px-3 py-1 text-xs rounded transition font-medium ${
                  isActive
                    ? 'border border-[#337ab7] bg-white text-[#337ab7] font-bold shadow-2xs'
                    : 'border border-slate-300 text-[#337ab7] hover:bg-slate-50'
                }`}
              >
                {pg}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="px-2.5 py-1 border border-slate-300 rounded text-xs text-[#337ab7] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            »
          </button>
        </div>

        {/* =========================================================================
            NEW INVENTORY ITEM CREATION MODAL (Authentic Omega NewItemInv)
            ========================================================================= */}
        {isNewItemModalOpen && (
          <NewInventoryItemModal
            isOpen={isNewItemModalOpen}
            onClose={() => setIsNewItemModalOpen(false)}
            onItemCreated={handleItemCreated}
            initialCategory={selectedCategoryId || 2}
          />
        )}
      </div>
    </div>
  );
}
