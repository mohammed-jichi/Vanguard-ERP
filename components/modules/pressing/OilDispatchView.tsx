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

export default function OilDispatchView() {
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
            <h2 className="text-base font-bold text-slate-900">Oil Handover &amp; Gate-Pass Dispatch</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal release vouchers for grower tins, security exit inspection, and silo inventory balance deductions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded text-xs font-semibold">
            Certified Dispatch Gate #01
          </span>
        </div>
      </div>

      {/* CREATE GATE PASS FORM */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600" />
          <span>Generate Factory Release Gate-Pass</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Farmer / Grower Account <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Michel El-Khoury"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Settlement Ticket Ref #
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
              Tins Released (16L Standard) <span className="text-rose-500">*</span>
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
              Authorized Receiver Name
            </label>
            <input
              type="text"
              placeholder="e.g. Driver / Family Representative"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Exit Vehicle Plate
            </label>
            <input
              type="text"
              placeholder="e.g. M 21908"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Authorizing Plant Supervisor
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
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded"
          >
            Clear Form
          </button>
          <button
            onClick={handleCreatePass}
            className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Authorize &amp; Print Gate-Pass</span>
          </button>
        </div>
      </div>

      {/* DISPATCH PASSES LOG */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Historical Dispatches &amp; Security Passes</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                <th className="py-2.5 px-3">Pass #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Grower</th>
                <th className="py-2.5 px-3">Ticket Ref</th>
                <th className="py-2.5 px-3">Tins Handed</th>
                <th className="py-2.5 px-3">Liters Equivalent</th>
                <th className="py-2.5 px-3">Receiver / Driver</th>
                <th className="py-2.5 px-3">Vehicle Plate</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {passes.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-900 font-mono">{p.passNumber}</td>
                  <td className="py-2.5 px-3 text-slate-500">{p.date}</td>
                  <td className="py-2.5 px-3 font-semibold">{p.farmerName}</td>
                  <td className="py-2.5 px-3 font-mono">{p.ticketNumber}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-700">{p.tinsReleased} Tins</td>
                  <td className="py-2.5 px-3 text-slate-600">{p.litersReleased} L</td>
                  <td className="py-2.5 px-3">{p.receiverName}</td>
                  <td className="py-2.5 px-3 text-slate-500">{p.vehiclePlate}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {p.gatePassStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setSelectedPassForPrint(p)}
                      className="text-slate-700 hover:text-slate-900 font-semibold"
                    >
                      Print Pass
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
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center border-b border-slate-200 pb-3 mb-3">
              <h2 className="text-base font-extrabold text-slate-900 uppercase">
                Southern Olive Oil Products S.A.R.L
              </h2>
              <p className="text-xs text-slate-500">Official Factory Gate Exit &amp; Dispatch Pass</p>
              <div className="mt-1 font-mono text-xs font-bold">{selectedPassForPrint.passNumber}</div>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Grower Name:</span>
                <span className="font-bold">{selectedPassForPrint.farmerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authorized Tins:</span>
                <span className="font-bold text-emerald-700">{selectedPassForPrint.tinsReleased} Standard Tins (16L)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Volume:</span>
                <span className="font-semibold">{selectedPassForPrint.litersReleased} Liters</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authorized Receiver:</span>
                <span className="font-semibold">{selectedPassForPrint.receiverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vehicle Plate:</span>
                <span className="font-mono">{selectedPassForPrint.vehiclePlate}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1">
                <span className="text-slate-500">Approved By:</span>
                <span className="font-bold">{selectedPassForPrint.authorizedBy}</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedPassForPrint(null)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setSelectedPassForPrint(null);
                  showToast('Factory gate pass dispatched to printer.');
                }}
                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Exit Gate-Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
