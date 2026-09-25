'use client';

import React, { useState } from 'react';
import {
  Truck,
  FileCheck,
  Printer,
  CheckCircle2,
  X,
  Plus,
  Search,
  UserCheck,
  ShieldCheck,
  Save,
  RotateCcw
} from 'lucide-react';
import { INITIAL_DISPATCH_PASSES, INITIAL_SETTLEMENTS } from '@/lib/pressingMillData';
import { OilDispatchPass } from '@/types/pressingMill';
import { useLanguage } from '@/lib/LanguageContext';

export default function OilDispatchView() {
  const { t } = useLanguage();
  const [passes, setPasses] = useState<OilDispatchPass[]>(INITIAL_DISPATCH_PASSES);
  
  // New Pass Form
  const [farmerName, setFarmerName] = useState('');
  const [ticketNumber, setTicketNumber] = useState('TK-2026-0143');
  const [tinsReleased, setTinsReleased] = useState<number | ''>(40);
  const [receiverName, setReceiverName] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [authorizedBy, setAuthorizedBy] = useState('Fadi Saade (Foreman)');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedPassForPrint, setSelectedPassForPrint] = useState<OilDispatchPass[] | OilDispatchPass | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreatePass = () => {
    if (!farmerName.trim() || Number(tinsReleased) <= 0) {
      showToast('Please enter grower name and released tins count.');
      return;
    }

    const newPass: OilDispatchPass = {
      id: `DP-${Date.now()}`,
      passNumber: `GP-2026-${String(passes.length + 92).padStart(4, '0')}`,
      date: '2026-09-22',
      farmerName: farmerName.trim(),
      ticketNumber,
      tinsReleased: Number(tinsReleased),
      litersReleased: Number(tinsReleased) * 16,
      receiverName: receiverName.trim() || farmerName.trim(),
      vehiclePlate: vehiclePlate.trim() || 'Grower Private Transport',
      authorizedBy,
      gatePassStatus: 'Approved'
    };

    setPasses([newPass, ...passes]);
    setSelectedPassForPrint(newPass);
    showToast(`Gate Pass ${newPass.passNumber} authorized for dispatch.`);
  };

  return (
    <div className="space-y-6">
      {/* GLOBAL TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">
              {t('pm_dispatch', 'Oil Handover & Gate-Pass Dispatch')}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('dispatch_sub', 'Formal release vouchers for grower tins, security exit inspection, and silo inventory balance deductions')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
            {t('certified_dispatch_gate_01', 'Certified Dispatch Gate #01')}
          </span>
        </div>
      </div>

      {/* CREATE GATE PASS FORM */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>{t('generate_factory_gate_pass', 'Generate Factory Release Gate-Pass')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t('farmer_grower', 'Farmer / Grower Account')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder={t('farmer_placeholder_sample', 'e.g. Michel El-Khoury')}
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t('settlement_ticket_ref', 'Settlement Ticket Ref #')}
            </label>
            <input
              type="text"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t('tins_released_16l', 'Tins Released (16L Standard)')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={tinsReleased}
              onChange={(e) => setTinsReleased(Number(e.target.value) || '')}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t('authorized_receiver_name', 'Authorized Receiver Name')}
            </label>
            <input
              type="text"
              placeholder={t('receiver_placeholder', 'e.g. Driver / Family Representative')}
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t('exit_vehicle_plate', 'Exit Vehicle Plate')}
            </label>
            <input
              type="text"
              placeholder={t('plate_placeholder', 'e.g. M 21908')}
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t('authorizing_plant_supervisor', 'Authorizing Plant Supervisor')}
            </label>
            <input
              type="text"
              value={authorizedBy}
              onChange={(e) => setAuthorizedBy(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              setFarmerName('');
              setReceiverName('');
              setVehiclePlate('');
              setTinsReleased('');
            }}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded cursor-pointer"
          >
            {t('clear_form', 'Clear Form')}
          </button>
          <button
            onClick={handleCreatePass}
            className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('authorize_print_gate_pass', 'Authorize & Print Gate-Pass')}</span>
          </button>
        </div>
      </div>

      {/* DISPATCH PASSES LOG */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          {t('historical_dispatches_title', 'Historical Dispatches & Security Passes')}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-2.5 px-3">{t('pass_num', 'Pass #')}</th>
                <th className="py-2.5 px-3">{t('date', 'Date')}</th>
                <th className="py-2.5 px-3">{t('farmer_grower', 'Grower')}</th>
                <th className="py-2.5 px-3">{t('ticket_ref', 'Ticket Ref')}</th>
                <th className="py-2.5 px-3">{t('tins_handed', 'Tins Handed')}</th>
                <th className="py-2.5 px-3">{t('liters_equivalent', 'Liters Equivalent')}</th>
                <th className="py-2.5 px-3">{t('receiver_driver', 'Receiver / Driver')}</th>
                <th className="py-2.5 px-3">{t('vehicle_plate_label', 'Vehicle Plate')}</th>
                <th className="py-2.5 px-3">{t('status', 'Status')}</th>
                <th className="py-2.5 px-3 text-right">{t('action', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {passes.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">{p.passNumber}</td>
                  <td className="py-2.5 px-3 text-slate-500">{p.date}</td>
                  <td className="py-2.5 px-3 font-semibold">{p.farmerName}</td>
                  <td className="py-2.5 px-3 font-mono">{p.ticketNumber}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700">
                    {p.tinsReleased} {t('tins_word', 'Tins')}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {p.litersReleased} {t('liters_word', 'L')}
                  </td>
                  <td className="py-2.5 px-3">{p.receiverName}</td>
                  <td className="py-2.5 px-3 text-slate-500">{p.vehiclePlate}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {t(p.gatePassStatus, p.gatePassStatus)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedPassForPrint(p)}
                      className="text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
                    >
                      {t('print_pass', 'Print Pass')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT GATE PASS MODAL */}
      {selectedPassForPrint && !Array.isArray(selectedPassForPrint) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 relative text-slate-800">
            <button
              onClick={() => setSelectedPassForPrint(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-slate-200 pb-3 mb-3">
              <h2 className="text-base font-extrabold text-slate-900 uppercase">
                {t('company_name_long', 'Southern Olive Oil Products S.A.R.L')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('gate_pass_subtitle', 'Official Factory Gate Exit & Dispatch Pass')}
              </p>
              <div className="mt-1 font-mono text-xs font-bold">{selectedPassForPrint.passNumber}</div>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">{t('grower_name_label', 'Grower Name:')}</span>
                <span className="font-bold">{selectedPassForPrint.farmerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('authorized_tins_label', 'Authorized Tins:')}</span>
                <span className="font-bold text-emerald-700">
                  {selectedPassForPrint.tinsReleased} {t('standard_tins_16l', 'Standard Tins (16L)')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('total_volume_label', 'Total Volume:')}</span>
                <span className="font-semibold">{selectedPassForPrint.litersReleased} {t('liters_word', 'Liters')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('authorized_receiver_label', 'Authorized Receiver:')}</span>
                <span className="font-semibold">{selectedPassForPrint.receiverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t('vehicle_plate_label', 'Vehicle Plate:')}</span>
                <span className="font-mono">{selectedPassForPrint.vehiclePlate}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1">
                <span className="text-slate-500">{t('approved_by_label', 'Approved By:')}</span>
                <span className="font-bold">{selectedPassForPrint.authorizedBy}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedPassForPrint(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold cursor-pointer"
              >
                {t('close', 'Close')}
              </button>
              <button
                onClick={() => {
                  window.print();
                  setSelectedPassForPrint(null);
                  showToast(t('factory_gate_pass_dispatched', 'Factory gate pass dispatched to printer.'));
                }}
                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t('print_exit_gate_pass', 'Print Exit Gate-Pass')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
