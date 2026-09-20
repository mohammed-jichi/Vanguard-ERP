'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Pencil,
  Trash2,
  Plus,
  Save,
  X,
  Monitor,
  Printer,
  Check,
  AlertCircle,
  Network,
  Cpu,
  Layers,
  Sliders
} from 'lucide-react';
import {
  OmegaWorkstation,
  OmegaPhysicalPrinter,
  INITIAL_WORKSTATIONS,
  INITIAL_PHYSICAL_PRINTERS,
  PRINTER_BRANDS,
  WORKSTATION_MENUS,
  WORKSTATION_SCREENS,
  SKIN_STYLES,
  DRAWER_PORTS
} from '@/lib/omegaDeviceData';
import { OMEGA_BRANCHES } from '@/lib/omegaDiscountData';
import { INITIAL_PRICE_MODES } from '@/lib/omegaPriceModeData';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function WorkstationsPrintersView() {
  const [activeTab, setActiveTab] = useState<'workstations' | 'printers'>('workstations');
  const [selectedBranchId, setSelectedBranchId] = useState<number>(1);

  // Data State
  const [workstations, setWorkstations] = useState<OmegaWorkstation[]>(INITIAL_WORKSTATIONS);
  const [printers, setPrinters] = useState<OmegaPhysicalPrinter[]>(INITIAL_PHYSICAL_PRINTERS);

  // Toast Notification System
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'info' });
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3500);
  };

  // Modals
  const [showWorkstationModal, setShowWorkstationModal] = useState<boolean>(false);
  const [editingWorkstation, setEditingWorkstation] = useState<OmegaWorkstation | null>(null);

  const [showPrinterModal, setShowPrinterModal] = useState<boolean>(false);
  const [editingPrinter, setEditingPrinter] = useState<OmegaPhysicalPrinter | null>(null);

  // Workstation Form State
  const [wsName, setWsName] = useState<string>('');
  const [wsIp, setWsIp] = useState<string>('');
  const [wsMenu, setWsMenu] = useState<number>(11);
  const [wsMode, setWsMode] = useState<number>(1);
  const [wsScreen, setWsScreen] = useState<number>(1);
  const [wsDrawer, setWsDrawer] = useState<string>('Null');
  const [wsScale, setWsScale] = useState<string>('-1');
  const [wsTicket, setWsTicket] = useState<number>(1000);
  const [wsSkin, setWsSkin] = useState<number>(-1);
  const [wsIsPda, setWsIsPda] = useState<boolean>(false);
  const [wsIsOmenu, setWsIsOmenu] = useState<boolean>(false);
  const [wsPrintForPda, setWsPrintForPda] = useState<boolean>(false);
  const [wsIsBitfood, setWsIsBitfood] = useState<boolean>(false);
  const [wsCheck1, setWsCheck1] = useState<number>(1);
  const [wsCheck2, setWsCheck2] = useState<number>(2);
  const [wsFastFood1, setWsFastFood1] = useState<number>(1);
  const [wsFastFood2, setWsFastFood2] = useState<number>(2);

  // Printer Form State
  const [prDescription, setPrDescription] = useState<string>('');
  const [prBrandId, setPrBrandId] = useState<number>(1);
  const [prType, setPrType] = useState<number>(1); // 1: IP, 2: Name
  const [prIp, setPrIp] = useState<string>('192.168.0.1');
  const [prName, setPrName] = useState<string>('');
  const [prSeries, setPrSeries] = useState<number>(1); // 1: Thermal, 2: Dot Matrix

  // Open Add Workstation Modal
  const handleOpenAddWorkstation = () => {
    setEditingWorkstation(null);
    const nextNbr = workstations.length > 0 ? Math.max(...workstations.map(w => w.WORKSTATION_NB)) + 1 : 1;
    setWsName(`w${nextNbr}`);
    setWsIp('192.168.1.10' + nextNbr);
    setWsMenu(11);
    setWsMode(1);
    setWsScreen(1);
    setWsDrawer('Null');
    setWsScale('-1');
    setWsTicket(1000);
    setWsSkin(-1);
    setWsIsPda(false);
    setWsIsOmenu(false);
    setWsPrintForPda(false);
    setWsIsBitfood(false);
    setWsCheck1(1);
    setWsCheck2(2);
    setWsFastFood1(1);
    setWsFastFood2(2);
    setShowWorkstationModal(true);
  };

  // Open Edit Workstation Modal
  const handleOpenEditWorkstation = (row: OmegaWorkstation) => {
    setEditingWorkstation(row);
    setWsName(row.WORKSTNAME);
    setWsIp(row.ip_address || '');
    setWsMenu(row.MENU);
    setWsMode(row.MODES);
    setWsScreen(row.MAINSCREEN);
    setWsDrawer(row.CASHDRAWERPORT || 'Null');
    setWsScale(row.SCALEPORT || '-1');
    setWsTicket(row.TICKETNMB || 1000);
    setWsSkin(row.SKINSTYLE);
    setWsIsPda(!!row.is_pda);
    setWsIsOmenu(!!row.is_omenu);
    setWsPrintForPda(!!row.print_for_pda);
    setWsIsBitfood(!!row.is_bitfood);
    setWsCheck1(row.check_1_printer || 1);
    setWsCheck2(row.check_2_printer || 2);
    setWsFastFood1(row.fast_food_1_printer || 1);
    setWsFastFood2(row.fast_food_2_printer || 2);
    setShowWorkstationModal(true);
  };

  // Save Workstation
  const handleSaveWorkstation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim()) {
      showToast('Workstation name is required.', 'warning');
      return;
    }

    if (editingWorkstation) {
      setWorkstations(prev =>
        prev.map(w =>
          w.ID === editingWorkstation.ID
            ? {
                ...w,
                WORKSTNAME: wsName.trim(),
                ip_address: wsIp.trim(),
                MENU: wsMenu,
                MODES: wsMode,
                MAINSCREEN: wsScreen,
                CASHDRAWERPORT: wsDrawer,
                SCALEPORT: wsScale,
                TICKETNMB: wsTicket,
                SKINSTYLE: wsSkin,
                is_pda: wsIsPda,
                is_omenu: wsIsOmenu,
                print_for_pda: wsPrintForPda,
                is_bitfood: wsIsBitfood,
                check_1_printer: wsCheck1,
                check_2_printer: wsCheck2,
                fast_food_1_printer: wsFastFood1,
                fast_food_2_printer: wsFastFood2
              }
            : w
        )
      );
      showToast(`Workstation "${wsName}" updated successfully.`, 'success');
    } else {
      const nextId = workstations.length > 0 ? Math.max(...workstations.map(w => w.ID)) + 1 : 10;
      const nextNbr = workstations.length > 0 ? Math.max(...workstations.map(w => w.WORKSTATION_NB)) + 1 : 1;

      const newWs: OmegaWorkstation = {
        ID: nextId,
        WORKSTATIONID: nextNbr,
        BRAND_ID: 9606,
        BRANCHID: 1,
        WORKSTATION_NB: nextNbr,
        WORKSTNAME: wsName.trim(),
        device_type: 'pc',
        ip_address: wsIp.trim(),
        MENU: wsMenu,
        MODES: wsMode,
        MAINSCREEN: wsScreen,
        CASHDRAWERPORT: wsDrawer,
        SCALEPORT: wsScale,
        TICKETNMB: wsTicket,
        SKINSTYLE: wsSkin,
        is_pda: wsIsPda,
        is_omenu: wsIsOmenu,
        print_for_pda: wsPrintForPda,
        is_bitfood: wsIsBitfood,
        check_1_printer: wsCheck1,
        check_2_printer: wsCheck2,
        fast_food_1_printer: wsFastFood1,
        fast_food_2_printer: wsFastFood2
      };
      setWorkstations(prev => [...prev, newWs]);
      showToast(`Workstation "${wsName}" added successfully.`, 'success');
    }

    setShowWorkstationModal(false);
  };

  // Delete Workstation
  const handleDeleteWorkstation = (row: OmegaWorkstation) => {
    if (confirm(`Are you sure you want to remove workstation "${row.WORKSTNAME}"?`)) {
      setWorkstations(prev => prev.filter(w => w.ID !== row.ID));
      showToast(`Workstation "${row.WORKSTNAME}" removed.`, 'warning');
    }
  };

  // Open Add Printer Modal
  const handleOpenAddPrinter = () => {
    setEditingPrinter(null);
    setPrDescription('');
    setPrBrandId(1);
    setPrType(1);
    setPrIp('192.168.0.1');
    setPrName('');
    setPrSeries(1);
    setShowPrinterModal(true);
  };

  // Open Edit Printer Modal
  const handleOpenEditPrinter = (row: OmegaPhysicalPrinter) => {
    setEditingPrinter(row);
    setPrDescription(row.DESCRIPTION);
    setPrBrandId(row.TYPE_ID || 1);
    setPrType(row.PRINTER_TYPE);
    setPrIp(row.PRINTER_IP || '192.168.0.1');
    setPrName(row.PRINTER_NAME || '');
    setPrSeries(row.PRINTER_SERIES);
    setShowPrinterModal(true);
  };

  // Save Printer
  const handleSavePrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prDescription.trim()) {
      showToast('Printer description is required.', 'warning');
      return;
    }

    const brandObj = PRINTER_BRANDS.find(b => b.id === prBrandId) || { id: 1, description: 'Omega' };

    if (editingPrinter) {
      setPrinters(prev =>
        prev.map(p =>
          p.ID === editingPrinter.ID
            ? {
                ...p,
                DESCRIPTION: prDescription.trim(),
                TYPE_ID: prBrandId,
                PRINTER_TYPE: prType,
                PRINTER_IP: prType === 1 ? prIp.trim() : null,
                PRINTER_NAME: prType === 2 ? prName.trim() : null,
                PRINTER_SERIES: prSeries,
                type: { id: brandObj.id, description: brandObj.description, active: 1 }
              }
            : p
        )
      );
      showToast(`Physical Printer "${prDescription}" updated.`, 'success');
    } else {
      const nextId = printers.length > 0 ? Math.max(...printers.map(p => p.ID)) + 1 : 1;
      const newPr: OmegaPhysicalPrinter = {
        ID: nextId,
        BRAND_ID: 9606,
        BRANCHID: 1,
        DESCRIPTION: prDescription.trim(),
        TYPE_ID: prBrandId,
        PRINTER_TYPE: prType,
        PRINTER_IP: prType === 1 ? prIp.trim() : null,
        PRINTER_NAME: prType === 2 ? prName.trim() : null,
        PRINTER_SERIES: prSeries,
        type: { id: brandObj.id, description: brandObj.description, active: 1 }
      };
      setPrinters(prev => [...prev, newPr]);
      showToast(`Physical Printer "${prDescription}" added.`, 'success');
    }

    setShowPrinterModal(false);
  };

  // Delete Printer
  const handleDeletePrinter = (id: number) => {
    const item = printers.find(p => p.ID === id);
    if (confirm(`Are you sure you want to remove physical printer "${item?.DESCRIPTION || id}"?`)) {
      setPrinters(prev => prev.filter(p => p.ID !== id));
      showToast(`Printer removed.`, 'warning');
    }
  };

  return (
    <div className="w-full min-h-screen bg-background p-4 sm:p-6 lg:p-8 font-sans select-none text-slate-800">
      {/* Toast Alert */}
      {toast.show && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all transform animate-in slide-in-from-top-2 border ${
            toast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : toast.type === 'warning'
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-blue-50 border-blue-300 text-blue-800'
          }`}
        >
          {toast.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600" />
          )}
          <span className="text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Title and Breadcrumb */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Device Preferences</h1>
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
            <Link href="/backoffice" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Device Preferences</span>
          </nav>
        </div>

        {/* Toolbar matching Omega DevicePreferencesView */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
          <div className="w-full sm:w-80">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Select Branch
            </label>
            <select
              value={selectedBranchId}
              onChange={e => setSelectedBranchId(parseInt(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-700 font-medium"
            >
              {OMEGA_BRANCHES.map(b => (
                <option key={b.BRANCHID} value={b.BRANCHID}>
                  {b.BARANCHNAME}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab Navigation matching Omega exact markup */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('workstations')}
            className={`px-5 py-2.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'workstations'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-md'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Monitor className="w-4 h-4" /> Workstations ({workstations.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('printers')}
            className={`px-5 py-2.5 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'printers'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-md'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" /> Physical Printers ({printers.length})
          </button>
        </div>

        {/* TAB 1: WORKSTATIONS TABLE */}
        {activeTab === 'workstations' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider select-none">
                  <tr>
                    <th className="px-4 py-3 w-16">#</th>
                    <th className="px-4 py-3">Workstation</th>
                    <th className="px-4 py-3">Device</th>
                    <th className="px-4 py-3">Type Tag</th>
                    <th className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={handleOpenAddWorkstation}
                        className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded text-xs font-semibold inline-flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.2]" /> Add New
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {workstations.map(row => {
                    const isCloud = row.WORKSTATIONID >= 100 && row.WORKSTATIONID < 1000;
                    const isKitchen = row.WORKSTATIONID >= 1000 && row.WORKSTATIONID < 2000;
                    const isInventory = row.WORKSTATIONID >= 2000;

                    return (
                      <tr key={row.ID} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-500">{row.WORKSTATIONID}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          <span>{row.WORKSTNAME}</span>
                          {row.ip_address && (
                            <span className="block text-[11px] font-mono text-slate-400 font-normal">
                              {row.ip_address}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 uppercase text-xs font-mono">
                          {row.WORKSTATIONID < 100 ? 'pc' : row.device_type}
                        </td>
                        <td className="px-4 py-3">
                          {isCloud && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              POS Cloud
                            </span>
                          )}
                          {isKitchen && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200">
                              Kitchen Monitor
                            </span>
                          )}
                          {isInventory && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                              Inventory
                            </span>
                          )}
                          {!isCloud && !isKitchen && !isInventory && (
                            <span className="text-slate-400 text-xs">Standard POS</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditWorkstation(row)}
                              className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-2xs border border-blue-200 hover:border-blue-600"
                              title="Edit Workstation"
                            >
                              <Pencil className="w-4 h-4 stroke-[2.2]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteWorkstation(row)}
                              className="w-8 h-8 rounded-md bg-red-100 text-red-700 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-2xs border border-red-200 hover:border-red-600"
                              title="Delete Workstation"
                            >
                              <Trash2 className="w-4 h-4 stroke-[2.2]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PHYSICAL PRINTERS TABLE */}
        {activeTab === 'printers' && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200">
                <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider select-none">
                  <tr>
                    <th className="px-4 py-3 w-16">#</th>
                    <th className="px-4 py-3">Physical Printer</th>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">Printer IP / Name</th>
                    <th className="px-4 py-3">Series</th>
                    <th className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={handleOpenAddPrinter}
                        className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded text-xs font-semibold inline-flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.2]" /> New
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {printers.map(row => (
                    <tr key={row.ID} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-500">{row.ID}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{row.DESCRIPTION}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {row.type?.description || 'Omega'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-blue-700">
                        {row.PRINTER_TYPE === 2 ? row.PRINTER_NAME : row.PRINTER_IP}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {row.PRINTER_SERIES === 2 ? 'Dot Matrix' : 'Thermal'}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditPrinter(row)}
                            className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-2xs border border-blue-200 hover:border-blue-600"
                            title="Edit Physical Printer"
                          >
                            <Pencil className="w-4 h-4 stroke-[2.2]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePrinter(row.ID)}
                            className="w-8 h-8 rounded-md bg-red-100 text-red-700 hover:bg-red-600 hover:text-white flex items-center justify-center transition-all shadow-2xs border border-red-200 hover:border-red-600"
                            title="Delete Physical Printer"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: WORKSTATION MODIFY (Exact Omega Template) */}
      {/* ========================================================================= */}
      {showWorkstationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-600" />{' '}
                {editingWorkstation ? `Modify Workstation (${editingWorkstation.WORKSTNAME})` : 'New Workstation'}
              </h3>
              <button
                type="button"
                onClick={() => setShowWorkstationModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full w-7 h-7 flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkstation} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
              {/* Name & IP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    WorkStation Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={wsName}
                    onChange={e => setWsName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. POS Main"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">IP Address</label>
                  <input
                    type="text"
                    value={wsIp}
                    onChange={e => setWsIp(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md font-mono"
                    placeholder="192.168.1.100"
                  />
                </div>
              </div>

              {/* Menu, Mode, Screen */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Menu *</label>
                  <select
                    value={wsMenu}
                    onChange={e => setWsMenu(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                  >
                    {WORKSTATION_MENUS.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mode *</label>
                  <select
                    value={wsMode}
                    onChange={e => setWsMode(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                  >
                    {INITIAL_PRICE_MODES.map(pm => (
                      <option key={pm.MODEID} value={pm.MODEID}>
                        {pm.MODEDESCRIPTION}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Main Screen *</label>
                  <select
                    value={wsScreen}
                    onChange={e => setWsScreen(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                  >
                    {WORKSTATION_SCREENS.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cash Drawer, Scale, Skin */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cash Drawer Port *
                  </label>
                  <select
                    value={wsDrawer}
                    onChange={e => setWsDrawer(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                  >
                    {DRAWER_PORTS.map(port => (
                      <option key={port} value={port}>
                        {port}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Scale Port</label>
                  <select
                    value={wsScale}
                    onChange={e => setWsScale(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                  >
                    <option value="-1">None</option>
                    <option value="COM1">COM1</option>
                    <option value="COM2">COM2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Skin Style</label>
                  <select
                    value={wsSkin}
                    onChange={e => setWsSkin(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                  >
                    {SKIN_STYLES.map(sk => (
                      <option key={sk.id} value={sk.id}>
                        {sk.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Station Roles Checkboxes */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                <span className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Station Roles</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wsIsPda}
                      onChange={e => setWsIsPda(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                    <span>This station is a PDA</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wsIsOmenu}
                      onChange={e => setWsIsOmenu(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                    <span>This station is set For the OMenu App</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wsPrintForPda}
                      onChange={e => setWsPrintForPda(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                    <span>Print Invoices for all PDAs</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wsIsBitfood}
                      onChange={e => setWsIsBitfood(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300"
                    />
                    <span>Bitfood Dispatcher station</span>
                  </label>
                </div>
              </div>

              {/* Physical Printers Routing Section */}
              <div className="border border-slate-200 rounded-md overflow-hidden">
                <div className="bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 border-b border-slate-200">
                  Physical Printer Routing
                </div>
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Check 1 (Main Receipt)
                    </label>
                    <select
                      value={wsCheck1}
                      onChange={e => setWsCheck1(parseInt(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    >
                      <option value={0}>None</option>
                      {printers.map(p => (
                        <option key={p.ID} value={p.ID}>
                          {p.DESCRIPTION} ({p.PRINTER_TYPE === 2 ? p.PRINTER_NAME : p.PRINTER_IP})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Check 2 (Kitchen / Second)
                    </label>
                    <select
                      value={wsCheck2}
                      onChange={e => setWsCheck2(parseInt(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    >
                      <option value={0}>None</option>
                      {printers.map(p => (
                        <option key={p.ID} value={p.ID}>
                          {p.DESCRIPTION} ({p.PRINTER_TYPE === 2 ? p.PRINTER_NAME : p.PRINTER_IP})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Fast Food 1 Printer
                    </label>
                    <select
                      value={wsFastFood1}
                      onChange={e => setWsFastFood1(parseInt(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    >
                      <option value={0}>None</option>
                      {printers.map(p => (
                        <option key={p.ID} value={p.ID}>
                          {p.DESCRIPTION}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Fast Food 2 Printer
                    </label>
                    <select
                      value={wsFastFood2}
                      onChange={e => setWsFastFood2(parseInt(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded bg-white"
                    >
                      <option value={0}>None</option>
                      {printers.map(p => (
                        <option key={p.ID} value={p.ID}>
                          {p.DESCRIPTION}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWorkstationModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Workstation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PHYSICAL PRINTER MODIFY (Exact Omega Template) */}
      {/* ========================================================================= */}
      {showPrinterModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-600" />{' '}
                {editingPrinter ? `Modify Printer (${editingPrinter.DESCRIPTION})` : 'New Physical Printer'}
              </h3>
              <button
                type="button"
                onClick={() => setShowPrinterModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-full w-7 h-7 flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePrinter} className="p-5 space-y-4">
              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={prDescription}
                  onChange={e => setPrDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Invoice, Kitchen, Bar"
                />
              </div>

              {/* Brand & Series */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Brand</label>
                  <select
                    value={prBrandId}
                    onChange={e => setPrBrandId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                  >
                    {PRINTER_BRANDS.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Printer Series
                  </label>
                  <select
                    value={prSeries}
                    onChange={e => setPrSeries(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
                  >
                    <option value={1}>Thermal</option>
                    <option value={2}>Dot Matrix</option>
                  </select>
                </div>
              </div>

              {/* Printer Connection Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Printer Type / Connection
                </label>
                <div className="flex items-center gap-6">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                      type="radio"
                      name="printerConnType"
                      checked={prType === 1}
                      onChange={() => setPrType(1)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Network IP Address</span>
                  </label>

                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                      type="radio"
                      name="printerConnType"
                      checked={prType === 2}
                      onChange={() => setPrType(2)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span>Windows Shared Name</span>
                  </label>
                </div>
              </div>

              {/* IP or Windows Share Name */}
              {prType === 1 ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Printer IP *
                  </label>
                  <input
                    type="text"
                    required
                    value={prIp}
                    onChange={e => setPrIp(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md font-mono"
                    placeholder="192.168.0.1"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Printer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={prName}
                    onChange={e => setPrName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md"
                    placeholder="e.g. \\DESKTOP\ThermalPrinter"
                  />
                </div>
              )}

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrinterModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-md text-sm font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" /> Save Physical Printer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
