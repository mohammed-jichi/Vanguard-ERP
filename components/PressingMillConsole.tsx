"use client";

import React, { useState } from "react";
import { 
  Plus, 
  Eye, 
  FileText, 
  RotateCcw, 
  Save, 
  CheckCircle2, 
  Scale, 
  Layers, 
  Database, 
  DollarSign,
  Printer,
  X,
  Gauge,
  Thermometer,
  Activity,
  Flame,
  Droplets,
  AlertCircle,
  Truck,
  QrCode,
  Calendar,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Download
} from "lucide-react";

interface ScaleTicket {
  id: string;
  ticketNumber: string;
  date: string;
  farmerName: string;
  farmerPhone: string;
  oliveType: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  acidity: number | string;
  targetTank: string;
  feeType: "cash" | "in_kind";
  feeAmount: string;
  estimatedOilKg: number;
  estimatedTins: string;
  pomaceKg: number;
  status: "Weighed" | "In_Queue" | "Pressing" | "Settled";
}

export default function PressingMillPage() {
  const [activeTab, setActiveTab] = useState<"intake" | "batches" | "tanks" | "settlement">("intake");

  // بيانات نموذج استلام الزيتون والقبان
  const [intakeDate, setIntakeDate] = useState("2026-09-22");
  const [farmerName, setFarmerName] = useState("");
  const [farmerPhone, setFarmerPhone] = useState("");
  const [oliveType, setOliveType] = useState("بلدي - Souri");
  const [grossWeight, setGrossWeight] = useState<number | "">("");
  const [tareWeight, setTareWeight] = useState<number | "">("");
  const [acidity, setAcidity] = useState<number | "">("");
  const [targetTank, setTargetTank] = useState("Tank 01 (Extra Virgin)");
  const [feeType, setFeeType] = useState<"cash" | "in_kind">("in_kind");
  const [retentionPct, setRetentionPct] = useState<number>(10); // 10% رَدّة عينية افتراضية
  const [cashFeePerKg, setCashFeePerKg] = useState<number>(0.08); // 0.08$ للكيلو

  // UI Modals & Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ScaleTicket | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [tankFilter, setTankFilter] = useState<"all" | "extra_virgin" | "virgin" | "settling">("all");

  // الحسابات التلقائية
  const netWeight = typeof grossWeight === "number" && typeof tareWeight === "number" 
    ? Math.max(0, grossWeight - tareWeight) 
    : 0;

  // تقدير وسطي لإنتاج الزيت (مثلاً 20%)
  const estimatedOilKg = Math.round(netWeight * 0.20);
  const estimatedTins = (estimatedOilKg / 15.0).toFixed(1);

  // حساب الأجرة
  const calculatedFeeCash = (netWeight * Number(cashFeePerKg || 0)).toFixed(2);
  const calculatedFeeOil = (estimatedOilKg * (Number(retentionPct || 0) / 100)).toFixed(1);

  // السجلات المخزنة لقبان المعصرة
  const [tickets, setTickets] = useState<ScaleTicket[]>([
    {
      id: "T-1001",
      ticketNumber: "TK-2026-0089",
      date: "2026-09-22",
      farmerName: "أبو حسن جابر (بساتين حاصبيا)",
      farmerPhone: "03-452189 | بيك آب تويوتا 145920",
      oliveType: "بلدي - Souri",
      grossWeight: 4850,
      tareWeight: 1400,
      netWeight: 3450,
      acidity: 0.55,
      targetTank: "Tank 01 (Extra Virgin)",
      feeType: "in_kind",
      feeAmount: "69.0 KG Oil (10%)",
      estimatedOilKg: 690,
      estimatedTins: "46.0",
      pomaceKg: 1380,
      status: "Pressing"
    },
    {
      id: "T-1002",
      ticketNumber: "TK-2026-0088",
      date: "2026-09-22",
      farmerName: "ميشال الخوري (كفرمتى)",
      farmerPhone: "70-881234 | مرسيدس شاحنة 21908",
      oliveType: "نبالي - Nabali",
      grossWeight: 6200,
      tareWeight: 1800,
      netWeight: 4400,
      acidity: 0.72,
      targetTank: "Tank 02 (Virgin)",
      feeType: "cash",
      feeAmount: "$352.00 USD ($0.08/kg)",
      estimatedOilKg: 880,
      estimatedTins: "58.7",
      pomaceKg: 1760,
      status: "Settled"
    },
    {
      id: "T-1003",
      ticketNumber: "TK-2026-0087",
      date: "2026-09-21",
      farmerName: "تعاونية مزارعي الشوف",
      farmerPhone: "05-501192 | جرار زراعي 4401",
      oliveType: "شامي - Shami",
      grossWeight: 3100,
      tareWeight: 950,
      netWeight: 2150,
      acidity: 0.95,
      targetTank: "Tank 03 (Commercial)",
      feeType: "in_kind",
      feeAmount: "43.0 KG Oil (10%)",
      estimatedOilKg: 430,
      estimatedTins: "28.7",
      pomaceKg: 860,
      status: "Settled"
    }
  ]);

  // الخزانات الفولاذية المقاومة للصدأ 1-16
  const tanks = [
    { id: "TK-01", name: "Tank 01", category: "extra_virgin", title: "Extra Virgin - Choueifat First Cold Press", capacity: 15000, current: 12400, acidity: 0.42, temp: 16.2, nitrogen: true, status: "Active Filling" },
    { id: "TK-02", name: "Tank 02", category: "extra_virgin", title: "Extra Virgin - Hasbaya Heritage Souri", capacity: 15000, current: 14100, acidity: 0.38, temp: 15.9, nitrogen: true, status: "Full / Cured" },
    { id: "TK-03", name: "Tank 03", category: "virgin", title: "Virgin Olive Oil - Nabali Mountain Lot", capacity: 12000, current: 9600, acidity: 0.75, temp: 16.5, nitrogen: true, status: "Active" },
    { id: "TK-04", name: "Tank 04", category: "settling", title: "Intake Decanter Settling Tank A", capacity: 8000, current: 5200, acidity: 0.60, temp: 18.0, nitrogen: false, status: "Settling (Day 3/10)" },
    { id: "TK-05", name: "Tank 05", category: "extra_virgin", title: "Single Estate High-Polyphenol Premium", capacity: 10000, current: 6500, acidity: 0.28, temp: 15.5, nitrogen: true, status: "Active" },
    { id: "TK-06", name: "Tank 06", category: "settling", title: "Intake Decanter Settling Tank B", capacity: 8000, current: 3100, acidity: 0.70, temp: 18.2, nitrogen: false, status: "Settling (Day 1/10)" },
    { id: "TK-07", name: "Tank 07", category: "virgin", title: "Commercial Virgin Blend 2026", capacity: 20000, current: 17800, acidity: 0.85, temp: 17.0, nitrogen: true, status: "Ready for Bottling" },
    { id: "TK-08", name: "Tank 08", category: "extra_virgin", title: "Clean / Nitrogen Blanketed Ready", capacity: 15000, current: 0, acidity: 0.0, temp: 16.0, nitrogen: true, status: "Sanitized & Empty" }
  ];

  const filteredTanks = tanks.filter(t => {
    if (tankFilter === "all") return true;
    return t.category === tankFilter;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const createTicketObject = (customStatus: ScaleTicket["status"] = "Weighed"): ScaleTicket => {
    const nextNum = `TK-2026-${String(tickets.length + 90).padStart(4, "0")}`;
    return {
      id: `T-${Date.now()}`,
      ticketNumber: nextNum,
      date: intakeDate,
      farmerName: farmerName.trim() || "عميل غير محدد (مزارع محلي)",
      farmerPhone: farmerPhone.trim() || "غير مسجل",
      oliveType,
      grossWeight: Number(grossWeight) || 0,
      tareWeight: Number(tareWeight) || 0,
      netWeight,
      acidity: acidity || 0.6,
      targetTank,
      feeType,
      feeAmount: feeType === "in_kind" ? `${calculatedFeeOil} KG Oil (${retentionPct}%)` : `$${calculatedFeeCash} USD`,
      estimatedOilKg,
      estimatedTins,
      pomaceKg: Math.round(netWeight * 0.40),
      status: customStatus
    };
  };

  const handleQueueToLine = () => {
    if (netWeight <= 0) {
      showToast("يرجى إدخال وزن إجمالي وفارغ صحيح للقبان أولاً!");
      return;
    }
    const t = createTicketObject("In_Queue");
    setTickets([t, ...tickets]);
    showToast(`تم إدراج شحنة [${t.farmerName}] بوزن ${t.netWeight} KG في طابور خط العصر مباشرة.`);
    setActiveTab("batches");
  };

  const handleSaveDraft = () => {
    if (netWeight <= 0) {
      showToast("يرجى إدخال أوزان القبان لحفظ المسودة!");
      return;
    }
    const t = createTicketObject("Weighed");
    setTickets([t, ...tickets]);
    showToast(`تم حفظ مسودة تذكرة القبان برقم ${t.ticketNumber}`);
  };

  const handleSaveAndPrint = () => {
    if (netWeight <= 0) {
      showToast("يرجى إدخال أوزان القبان لحفظ وطباعة الإيصال!");
      return;
    }
    const t = createTicketObject("Weighed");
    setTickets([t, ...tickets]);
    setSelectedTicket(t);
    setShowTicketModal(true);
    showToast(`تم تسجيل القبان بنجاح: تذكرة #${t.ticketNumber}`);
  };

  const handleClearForm = () => {
    setGrossWeight("");
    setTareWeight("");
    setFarmerName("");
    setFarmerPhone("");
    setAcidity("");
    showToast("تم تصفير حقول القبان بنجاح.");
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen p-4 md:p-6 text-slate-800 font-sans">
      {/* GLOBAL FLOATING TOAST */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white mr-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. التبويبات العلوية بنمط Vanguard */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6 overflow-x-auto text-sm">
        <button
          onClick={() => setActiveTab("intake")}
          className={`px-4 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
            activeTab === "intake"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          }`}
        >
          Olive Intake & Scale (استلام القبان)
        </button>
        <button
          onClick={() => setActiveTab("batches")}
          className={`px-4 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
            activeTab === "batches"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          }`}
        >
          Active Pressing Lines (خطوط العصر)
        </button>
        <button
          onClick={() => setActiveTab("tanks")}
          className={`px-4 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
            activeTab === "tanks"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          }`}
        >
          Stainless Tanks Matrix (الخزانات 1-50)
        </button>
        <button
          onClick={() => setActiveTab("settlement")}
          className={`px-4 py-1.5 rounded-full font-medium transition-all whitespace-nowrap ${
            activeTab === "settlement"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
          }`}
        >
          Settlements & Fees (الأجرة والردة)
        </button>
      </div>

      {/* 2. ترويسة الشاشة وأزرار العمليات العلوية */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-slate-700" />
            <h1 className="text-xl font-bold text-slate-900">
              Pressing Mill Operations Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage olive reception weighbridge, pressing line queues, stainless tank allocations, and settlement fees.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => {
              setActiveTab("intake");
              handleClearForm();
            }}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded-md shadow-sm transition"
          >
            <Plus className="w-4 h-4" /> New Intake
          </button>
          <button 
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-2 rounded-md shadow-sm transition"
          >
            <Eye className="w-4 h-4" /> Preview Log
          </button>
          <button 
            onClick={() => {
              const previewTicket = tickets[0] || createTicketObject("Weighed");
              setSelectedTicket(previewTicket);
              setShowTicketModal(true);
            }}
            className="flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-2 rounded-md shadow-sm transition"
          >
            <FileText className="w-4 h-4" /> Supporting Ticket
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: كرت استلام الزيتون والقبان الرئيسي
          ========================================================================= */}
      {activeTab === "intake" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-6">
            {/* الصف الأول: التاريخ، نوع الزيتون، الحساب */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={intakeDate}
                  onChange={(e) => setIntakeDate(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Olive Variety / النوع
                </label>
                <select
                  value={oliveType}
                  onChange={(e) => setOliveType(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
                >
                  <option value="بلدي - Souri">بلدي (Souri)</option>
                  <option value="نبالي - Nabali">نبالي (Nabali)</option>
                  <option value="شامي - Shami">شامي (Shami)</option>
                  <option value="مخلط - Mixed">مخلط تجاري</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Tank / الخزان المستهدف
                </label>
                <select
                  value={targetTank}
                  onChange={(e) => setTargetTank(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
                >
                  <option value="Tank 01 (Extra Virgin)">Tank 01 (Extra Virgin)</option>
                  <option value="Tank 02 (Virgin)">Tank 02 (Virgin - Southern Grove)</option>
                  <option value="Tank 03 (Commercial)">Tank 03 (Commercial High Phenol)</option>
                  <option value="Tank 04 (Settling)">Tank 04 (General Intake Settling)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Acidity Test (حموضة %)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 0.6 %"
                  value={acidity}
                  onChange={(e) => setAcidity(Number(e.target.value) || "")}
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>

            {/* الصف الثاني: بيانات المزارع / المورد */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Farmer / Client Name (اسم المزارع أو المورد) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="أدخل اسم المزارع أو الجهة الموردة..."
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number & Vehicle Plate (رقم الهاتف / رقم الآلية)
                </label>
                <input
                  type="text"
                  placeholder="03-XXXXXX | بيك آب مرسيدس..."
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>

            {/* الصف الثالث: وزنات القبان والأوزان الصافية */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" /> Weighbridge Measurement (وزن القبان الصافي)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gross Weight (الوزن الإجمالي - كغ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value) || "")}
                    className="w-full text-sm font-semibold border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tare Weight (الوزن الفارغ للسيارة/الصناديق - كغ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={tareWeight}
                    onChange={(e) => setTareWeight(Number(e.target.value) || "")}
                    className="w-full text-sm font-semibold border border-slate-300 rounded px-3 py-1.5 focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div className="bg-white border border-slate-200 rounded p-2.5 flex flex-col justify-center">
                  <span className="text-[11px] font-semibold text-slate-500">Net Olive Weight (صافي وزن الزيتون)</span>
                  <span className="text-lg font-bold text-slate-900">{netWeight.toLocaleString()} KG</span>
                </div>
              </div>
            </div>

            {/* الصف الرابع: احتساب الأجرة والردة العينية */}
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-amber-600" /> Milling Fee Agreement (اتفاقية الأجرة والردة)
                </h3>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="feeType"
                      checked={feeType === "in_kind"}
                      onChange={() => setFeeType("in_kind")}
                      className="accent-slate-900"
                    />
                    <span>ردّة عينية (In-Kind Oil %)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="feeType"
                      checked={feeType === "cash"}
                      onChange={() => setFeeType("cash")}
                      className="accent-slate-900"
                    />
                    <span>أجرة نقدية (Cash Fee)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {feeType === "in_kind" ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Retention Percentage (نسبة الردة من الزيت %)
                    </label>
                    <input
                      type="number"
                      value={retentionPct}
                      onChange={(e) => setRetentionPct(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      المستقطع للمعصرة: ~{calculatedFeeOil} كغ زيت
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Cash Rate ($ per KG Olive)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={cashFeePerKg}
                      onChange={(e) => setCashFeePerKg(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded px-2.5 py-1.5 focus:outline-none focus:border-slate-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      إجمالي الأجرة: ${calculatedFeeCash} USD
                    </span>
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded p-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 block">Est. Total Oil Yield</span>
                  <span className="text-base font-bold text-emerald-700">~{estimatedOilKg} KG</span>
                  <span className="text-[11px] text-slate-500 block">تقريباً {estimatedTins} تنكة (16L)</span>
                </div>

                <div className="bg-white border border-slate-200 rounded p-2.5">
                  <span className="text-[11px] font-semibold text-slate-500 block">Subproduct / Pomace (الجفت)</span>
                  <span className="text-base font-bold text-amber-800">~{Math.round(netWeight * 0.40)} KG</span>
                  <span className="text-[11px] text-slate-500 block">جاهز للتحويل لوقود التدفئة والكومبوست</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. شريط الأزرار والإجراءات السفلي المطابق لقالب Vanguard */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="text-xs">
              <span className="text-slate-500 font-semibold block">Total Estimated Yield Summary:</span>
              <span className="text-sm font-bold text-slate-900">
                {netWeight.toLocaleString()} KG Olives ➔ ~{estimatedOilKg} KG Virgin Olive Oil ({estimatedTins} Tins)
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              <button 
                onClick={handleClearForm}
                className="flex items-center gap-1 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-md text-xs font-semibold text-slate-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear
              </button>

              <button 
                onClick={handleQueueToLine}
                className="flex items-center gap-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs font-semibold transition shadow-sm"
              >
                <Layers className="w-3.5 h-3.5" /> Queue to Line
              </button>

              <button 
                onClick={handleSaveDraft}
                className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-xs font-semibold transition shadow-sm"
              >
                <Save className="w-3.5 h-3.5" /> Save Draft Ticket
              </button>

              <button 
                onClick={handleSaveAndPrint}
                className="flex items-center gap-1 px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-md text-xs font-semibold transition shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Save & Print Scale Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: خطوط العصر النشطة (ACTIVE PRESSING LINES)
          ========================================================================= */}
      {activeTab === "batches" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line 01 Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Line 01 - Choueifat Continuous Decanter</h2>
                    <span className="text-[11px] text-slate-500">Alfa Laval 3-Phase Continuous Line • Capacity 4.5 T/hr</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  RUNNING
                </span>
              </div>

              {/* Current Batch Info */}
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Current Batch:</span>
                  <span className="font-bold text-slate-900">Abu Hassan Souri (#TK-2026-0089)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Batch Weight:</span>
                  <span className="font-bold text-slate-900">3,450 KG • 20% Yield Target</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: "68%" }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Progress: 68% Extracted</span>
                  <span>Est. Completion: 24 mins</span>
                </div>
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] mb-1">
                    <Thermometer className="w-3.5 h-3.5 text-rose-500" /> Malaxer Temp
                  </div>
                  <span className="text-base font-bold text-slate-900">26.8 °C</span>
                  <span className="text-[10px] text-emerald-600 block">Cold Press OK</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] mb-1">
                    <Gauge className="w-3.5 h-3.5 text-blue-500" /> Decanter Speed
                  </div>
                  <span className="text-base font-bold text-slate-900">3,200 RPM</span>
                  <span className="text-[10px] text-slate-500 block">Stable Feed</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] mb-1">
                    <Droplets className="w-3.5 h-3.5 text-emerald-600" /> Output Flow
                  </div>
                  <span className="text-base font-bold text-emerald-700">620 L/hr</span>
                  <span className="text-[10px] text-slate-500 block">Into Tank 01</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => showToast("تم تسجيل قراءة الحساسات وإعادة معايرة خلاط العجن.")}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-semibold"
                >
                  Log Telemetry
                </button>
                <button 
                  onClick={() => showToast("تم إيقاف الخط مؤقتاً لغسيل فواصل الطرد المركزي.")}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold"
                >
                  Pause for Wash
                </button>
              </div>
            </div>

            {/* Line 02 Card */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Line 02 - South Plant Cold Extraction</h2>
                    <span className="text-[11px] text-slate-500">Pieralisi 2-Phase Ecological Unit • Capacity 3.2 T/hr</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                  RUNNING
                </span>
              </div>

              {/* Current Batch Info */}
              <div className="bg-slate-50 p-3 rounded-md border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Current Batch:</span>
                  <span className="font-bold text-slate-900">Khoury Souri Mountain (#TK-2026-0088)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Batch Weight:</span>
                  <span className="font-bold text-slate-900">4,400 KG • 21.5% Actual Yield</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: "91%" }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Progress: 91% Completed</span>
                  <span>Est. Completion: 8 mins</span>
                </div>
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] mb-1">
                    <Thermometer className="w-3.5 h-3.5 text-rose-500" /> Malaxer Temp
                  </div>
                  <span className="text-base font-bold text-slate-900">25.4 °C</span>
                  <span className="text-[10px] text-emerald-600 block">Ultra Cold</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] mb-1">
                    <Gauge className="w-3.5 h-3.5 text-blue-500" /> Decanter Speed
                  </div>
                  <span className="text-base font-bold text-slate-900">3,450 RPM</span>
                  <span className="text-[10px] text-slate-500 block">2-Phase Eco</span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <div className="flex items-center justify-center gap-1 text-slate-500 text-[11px] mb-1">
                    <Droplets className="w-3.5 h-3.5 text-emerald-600" /> Output Flow
                  </div>
                  <span className="text-base font-bold text-emerald-700">740 L/hr</span>
                  <span className="text-[10px] text-slate-500 block">Into Tank 02</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => showToast("تم تسجيل عينة فحص جودة الزيت الصاعد.")}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded text-xs font-semibold"
                >
                  Sample Acid Test
                </button>
                <button 
                  onClick={() => showToast("الدفعة التالية جاهزة للتحميل في قادوس الاستقبال.")}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-semibold"
                >
                  Load Next Hopper
                </button>
              </div>
            </div>
          </div>

          {/* Active Hopper Queue Table */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" /> Olive Hopper Waiting Queue (طابور انتظار العصر)
              </h2>
              <span className="text-xs text-slate-500">
                {tickets.filter(t => t.status === "In_Queue" || t.status === "Weighed").length} Batches in Yard
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">Ticket #</th>
                    <th className="py-2.5 px-3">Farmer / Grower</th>
                    <th className="py-2.5 px-3">Variety</th>
                    <th className="py-2.5 px-3">Net Weight (KG)</th>
                    <th className="py-2.5 px-3">Est. Yield</th>
                    <th className="py-2.5 px-3">Target Tank</th>
                    <th className="py-2.5 px-3">Yard Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{t.ticketNumber}</td>
                      <td className="py-2.5 px-3 font-medium">{t.farmerName}</td>
                      <td className="py-2.5 px-3">{t.oliveType}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{t.netWeight.toLocaleString()} KG</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">~{t.estimatedOilKg} KG ({t.estimatedTins} Tins)</td>
                      <td className="py-2.5 px-3">{t.targetTank}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === "Pressing" ? "bg-emerald-100 text-emerald-800" :
                          t.status === "In_Queue" ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-700"
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button 
                          onClick={() => {
                            setSelectedTicket(t);
                            setShowTicketModal(true);
                          }}
                          className="text-slate-600 hover:text-slate-900 font-semibold"
                        >
                          View Ticket
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: مصفوفة الخزانات الفولاذية (STAINLESS TANKS MATRIX 1-50)
          ========================================================================= */}
      {activeTab === "tanks" && (
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-bold text-slate-900">Stainless Steel Tank Farm (سعة الخزانات الإجمالية: 150,000 L)</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setTankFilter("all")}
                className={`px-3 py-1 rounded font-medium ${tankFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                All Tanks (8 Active)
              </button>
              <button
                onClick={() => setTankFilter("extra_virgin")}
                className={`px-3 py-1 rounded font-medium ${tankFilter === "extra_virgin" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                Extra Virgin
              </button>
              <button
                onClick={() => setTankFilter("virgin")}
                className={`px-3 py-1 rounded font-medium ${tankFilter === "virgin" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                Virgin
              </button>
              <button
                onClick={() => setTankFilter("settling")}
                className={`px-3 py-1 rounded font-medium ${tankFilter === "settling" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                Settling Tanks
              </button>
            </div>
          </div>

          {/* Tanks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredTanks.map((tank) => {
              const fillPct = Math.round((tank.current / tank.capacity) * 100);
              return (
                <div key={tank.id} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3 relative hover:border-slate-400 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{tank.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      tank.category === "extra_virgin" ? "bg-emerald-100 text-emerald-800" :
                      tank.category === "virgin" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {tank.category.replace("_", " ").toUpperCase()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 line-clamp-1">{tank.title}</h3>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {tank.current.toLocaleString()} / {tank.capacity.toLocaleString()} Liters ({fillPct}%)
                    </span>
                  </div>

                  {/* Visual Level Gauge */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        tank.current === 0 ? "bg-slate-300" :
                        fillPct > 85 ? "bg-amber-500" : "bg-emerald-600"
                      }`} 
                      style={{ width: `${fillPct}%` }} 
                    />
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Acidity Test</span>
                      <span className="font-bold text-slate-800">{tank.acidity > 0 ? `${tank.acidity}%` : "—"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Internal Temp</span>
                      <span className="font-bold text-slate-800">{tank.temp} °C</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                    <span>{tank.nitrogen ? "🛡️ N₂ Blanketed" : "⚠️ Atmospheric"}</span>
                    <button 
                      onClick={() => showToast(`تم اختيار ${tank.name} لإجراء فحص عينات مخبري.`)}
                      className="text-slate-700 hover:text-slate-900 font-semibold underline"
                    >
                      Sample
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: الأجرة والردة والتسويات (SETTLEMENTS & FEES)
          ========================================================================= */}
      {activeTab === "settlement" && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">Total Olives Weighed</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">48,650 KG</span>
              <span className="text-[11px] text-emerald-600 font-medium">32 Trucks Processed</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">Total Olive Oil Extracted</span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">~10,216 KG</span>
              <span className="text-[11px] text-slate-500 font-medium">681 Standard Tins (16L)</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">Mill Retention Oil (الردة العينية)</span>
              <span className="text-2xl font-bold text-sky-700 mt-1 block">1,021 KG</span>
              <span className="text-[11px] text-slate-500 font-medium">68 Tins in Mill Silo</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 block">Cash Milling Revenue</span>
              <span className="text-2xl font-bold text-amber-700 mt-1 block">$2,480.00</span>
              <span className="text-[11px] text-slate-500 font-medium">USD Cash Collected</span>
            </div>
          </div>

          {/* Settlements Log */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Settled Pressing Fee Ledgers (سجل تسويات القبان والمزارعين)
              </h2>
              <button 
                onClick={() => showToast("تم تصدير كشف حساب المعصرة إلى Excel بنجاح.")}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" /> Export Statement
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2.5 px-3">Ticket #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Grower / Client</th>
                    <th className="py-2.5 px-3">Net Olives</th>
                    <th className="py-2.5 px-3">Fee Mode</th>
                    <th className="py-2.5 px-3">Settlement / الأجرة</th>
                    <th className="py-2.5 px-3">Grower Tins</th>
                    <th className="py-2.5 px-3">Mill Retained Tins</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-bold text-slate-900">{t.ticketNumber}</td>
                      <td className="py-2.5 px-3 text-slate-500">{t.date}</td>
                      <td className="py-2.5 px-3 font-semibold">{t.farmerName}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-800">{t.netWeight.toLocaleString()} KG</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.feeType === "in_kind" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {t.feeType === "in_kind" ? "ردة عينية 10%" : "أجرة نقدية"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{t.feeAmount}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-bold">{t.estimatedTins} تنكة</td>
                      <td className="py-2.5 px-3 text-sky-700 font-bold">
                        {t.feeType === "in_kind" ? `${(Number(t.estimatedTins) * 0.1).toFixed(1)} تنكة` : "0 تنكة (كاش)"}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button 
                          onClick={() => {
                            setSelectedTicket(t);
                            setShowTicketModal(true);
                          }}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded text-[11px] font-semibold hover:bg-slate-800 transition"
                        >
                          Print Voucher
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: قسيمة وتذكرة القبان الرسمية للطباعة
          ========================================================================= */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 relative text-slate-800">
            {/* Close Button */}
            <button 
              onClick={() => setShowTicketModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Ticket Header */}
            <div className="text-center border-b border-slate-200 pb-4 mb-4">
              <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wide">
                Southern Olive Oil Products S.A.R.L
              </h2>
              <p className="text-xs text-slate-500 font-medium">Choueifat Central Mill • Official Weighbridge & Pressing Ticket</p>
              <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded text-xs font-mono font-bold text-slate-800">
                <span>{selectedTicket.ticketNumber}</span>
                <span>•</span>
                <span>{selectedTicket.date}</span>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">Grower / Farmer</span>
                  <span className="font-bold text-slate-900">{selectedTicket.farmerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Vehicle / Phone</span>
                  <span className="font-semibold text-slate-800">{selectedTicket.farmerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Olive Variety</span>
                  <span className="font-semibold text-slate-800">{selectedTicket.oliveType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Acidity Level</span>
                  <span className="font-bold text-emerald-700">{selectedTicket.acidity}%</span>
                </div>
              </div>

              {/* Weight Breakdown */}
              <div className="border border-slate-200 rounded p-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Weight (إجمالي):</span>
                  <span className="font-mono font-semibold">{selectedTicket.grossWeight.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tare Weight (فارغ الشاحنة):</span>
                  <span className="font-mono font-semibold">{selectedTicket.tareWeight.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-slate-100 pt-1 text-slate-900">
                  <span>Net Olive Weight (الصافي):</span>
                  <span className="text-emerald-700 font-mono">{selectedTicket.netWeight.toLocaleString()} KG</span>
                </div>
              </div>

              {/* Yield & Fees Breakdown */}
              <div className="bg-emerald-50 border border-emerald-200 rounded p-3 space-y-1.5 text-emerald-900">
                <div className="flex justify-between">
                  <span className="font-medium">Estimated Virgin Oil Yield:</span>
                  <span className="font-bold">~{selectedTicket.estimatedOilKg} KG ({selectedTicket.estimatedTins} Tins / تنكات)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Milling Settlement Agreement:</span>
                  <span className="font-bold text-amber-800">{selectedTicket.feeAmount}</span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-700 pt-1 border-t border-emerald-100">
                  <span>Destination Storage Silo:</span>
                  <span className="font-semibold">{selectedTicket.targetTank}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                <span>Vanguard ERP Mill Core v2.0</span>
                <span>Weighbridge Certified Scale #04</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button 
                onClick={() => setShowTicketModal(false)}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-md text-xs font-semibold text-slate-700 transition"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  window.print();
                  setShowTicketModal(false);
                  showToast("جاري إرسال إيصال القبان إلى طابعة الباركود...");
                }}
                className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5" /> Print Scale Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: استعراض سجل الاستلام الكامل (PREVIEW LOG)
          ========================================================================= */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 relative text-slate-800 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900">Weighbridge & Olive Intake Daily Log</h2>
              </div>
              <button 
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                    <th className="py-2 px-3">Ticket</th>
                    <th className="py-2 px-3">Grower</th>
                    <th className="py-2 px-3">Net KG</th>
                    <th className="py-2 px-3">Yield</th>
                    <th className="py-2 px-3">Fee</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-semibold">{t.ticketNumber}</td>
                      <td className="py-2.5 px-3">{t.farmerName}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{t.netWeight.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-emerald-700 font-semibold">{t.estimatedOilKg} KG</td>
                      <td className="py-2.5 px-3">{t.feeAmount}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button 
                          onClick={() => {
                            setShowLogModal(false);
                            setSelectedTicket(t);
                            setShowTicketModal(true);
                          }}
                          className="text-blue-600 hover:underline font-semibold"
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setShowLogModal(false)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
