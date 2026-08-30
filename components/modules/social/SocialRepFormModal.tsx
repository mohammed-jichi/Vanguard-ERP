'use client';

import React, { useState } from 'react';

interface SocialRepFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
  isManagerRole?: boolean; // إذا كان True يتم إخفاء أشرطة العمولات
}

export default function SocialRepFormModal({
  isOpen,
  onClose,
  onSaveSuccess,
  isManagerRole = false,
}: SocialRepFormModalProps) {
  // Personal Info
  const [firstName, setFirstName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [lastName, setLastName] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [socialPhone, setSocialPhone] = useState('');

  // Detailed Address
  const [region, setRegion] = useState('جبل لبنان');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');

  // Codes
  const [adminCode, setAdminCode] = useState('');
  const [systemCode] = useState(() => 'REP-SO-' + Math.floor(1000 + Math.random() * 9000));

  // Social Links
  const [facebookLink, setFacebookLink] = useState('');
  const [tiktokLink, setTiktokLink] = useState('');
  const [instagramLink, setInstagramLink] = useState('');
  const [otherLinks, setOtherLinks] = useState<{ id: string; title: string; url: string }[]>([]);

  // Commission Percentages (For Reps only)
  const [commissionOffers, setCommissionOffers] = useState<number>(5.0);
  const [commissionItems, setCommissionItems] = useState<number>(3.0);

  if (!isOpen) return null;

  // Add Dynamic Other Link
  const handleAddOtherLink = () => {
    setOtherLinks((prev) => [
      ...prev,
      { id: Math.random().toString(), title: '', url: '' },
    ]);
  };

  const handleUpdateOtherLink = (id: string, field: 'title' | 'url', value: string) => {
    setOtherLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveOtherLink = (id: string) => {
    setOtherLinks((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    if (!firstName || !lastName || !personalPhone || !adminCode) {
      alert('يرجى ملء الحقول الأساسية: الاسم، العائلة، رقم الهاتف، وكود الإدارة');
      return;
    }

    const payload = {
      role_type: isManagerRole ? 'MANAGER' : 'REP',
      first_name: firstName,
      father_name: fatherName,
      last_name: lastName,
      personal_phone: personalPhone,
      social_phone: socialPhone,
      region,
      city,
      street,
      building,
      floor,
      admin_code: adminCode,
      system_code: systemCode,
      social_links: {
        facebook: facebookLink,
        tiktok: tiktokLink,
        instagram: instagramLink,
        others: otherLinks,
      },
      commission_offers_pct: isManagerRole ? 0 : commissionOffers,
      commission_items_pct: isManagerRole ? 0 : commissionItems,
    };

    console.log('[Southern Olive Oil Products S.A.R.L] Saving Rep:', payload);
    alert(`تم إنشاء وتثبيت الموظف بنجاح بكود النظام: ${systemCode}`);
    if (onSaveSuccess) onSaveSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans text-right select-none overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-[#1e232d] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-sm font-bold tracking-tight">
              {isManagerRole ? 'إضافة مدير سوشيال ميديا (Social Media Manager)' : 'إضافة مندوب سوشيال ميديا جديد (Social Media Rep)'}
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-white text-base font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body Form */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar text-xs text-slate-800">
          
          {/* Section 1: Full Name */}
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-[#1a629b] mb-2">1. الاسم الكامل</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم الأول *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="الاسم"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-medium focus:border-[#1a629b] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الأب *</label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="اسم الأب"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-medium focus:border-[#1a629b] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">الشهرة / العائلة *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="العائلة"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-medium focus:border-[#1a629b] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Numbers */}
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-[#1a629b] mb-2">2. أرقام الهاتف</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم الهاتف الخاص *</label>
                <input
                  type="text"
                  value={personalPhone}
                  onChange={(e) => setPersonalPhone(e.target.value)}
                  placeholder="03xxxxxx أو 70xxxxxx"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-mono focus:border-[#1a629b] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم هاتف السوشيال ميديا (WhatsApp) *</label>
                <input
                  type="text"
                  value={socialPhone}
                  onChange={(e) => setSocialPhone(e.target.value)}
                  placeholder="رقم الواتساب المعتمد للزبائن"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-mono focus:border-[#1a629b] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Detailed Address */}
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-[#1a629b] mb-2">3. العنوان الكامل</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">المنطقة</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  placeholder="جبل لبنان / الجنوب"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">المدينة</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="الشويفات / بيروت"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">الشارع</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="الشارع العام"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">المبنى</label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="بناية..."
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">الطابق</label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="الطابق 3"
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Dual Codes (Admin Code + System Auto-Code) */}
          <div className="border-b border-slate-100 pb-3 bg-slate-50 p-3 rounded-xl">
            <h3 className="font-bold text-[#1a629b] mb-2">4. رموز التعريف والكود المزدوج</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كود الإدارة المخصص (Admin Code) *</label>
                <input
                  type="text"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="مثال: ADM-REP-01"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-md font-bold text-[#1a629b] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">كود النظام التلقائي (System Code)</label>
                <input
                  type="text"
                  value={systemCode}
                  readOnly
                  className="w-full px-2.5 py-1.5 bg-slate-200/80 border border-slate-300 rounded-md font-mono font-bold text-slate-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Social Media Platform Links */}
          <div className="border-b border-slate-100 pb-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-[#1a629b]">5. روابط منصات السوشيال ميديا</h3>
              <button
                type="button"
                onClick={handleAddOtherLink}
                className="px-2 py-1 bg-blue-50 text-[#1a629b] border border-blue-200 rounded-md text-[11px] font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
              >
                <span>+ إضافة رابط منصة أخرى</span>
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">رابط صفحة الفيسبوك (Facebook)</label>
                <input
                  type="text"
                  value={facebookLink}
                  onChange={(e) => setFacebookLink(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-mono text-left"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">رابط صفحة الإنستغرام (Instagram)</label>
                <input
                  type="text"
                  value={instagramLink}
                  onChange={(e) => setInstagramLink(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-mono text-left"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">رابط صفحة التيك توك (TikTok)</label>
                <input
                  type="text"
                  value={tiktokLink}
                  onChange={(e) => setTiktokLink(e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md font-mono text-left"
                />
              </div>

              {/* Dynamic Other Links */}
              {otherLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleUpdateOtherLink(link.id, 'title', e.target.value)}
                    placeholder="اسم المنصة (مثال: سناب شات)"
                    className="w-1/3 px-2 py-1.5 border border-slate-300 rounded-md text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleUpdateOtherLink(link.id, 'url', e.target.value)}
                    placeholder="الرابط https://..."
                    className="flex-1 px-2 py-1.5 border border-slate-300 rounded-md font-mono text-xs text-left"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOtherLink(link.id)}
                    className="px-2 py-1.5 text-red-500 hover:bg-red-50 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Commission Percentage Bars (Hidden for Managers) */}
          {!isManagerRole && (
            <div className="bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-xl space-y-3">
              <h3 className="font-bold text-amber-900">6. أشرطة احتساب النسبة المئوية للعمولات (Commissions)</h3>
              
              {/* Offers Commission Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">النسبة المئوية على العروضات (% on Offers):</label>
                  <span className="font-bold font-mono text-[#1a629b] text-sm">{commissionOffers}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={commissionOffers}
                  onChange={(e) => setCommissionOffers(parseFloat(e.target.value))}
                  className="w-full accent-[#1a629b] cursor-pointer"
                />
              </div>

              {/* Regular Items Commission Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-700">النسبة المئوية على باقي الأصناف (% on Other Items):</label>
                  <span className="font-bold font-mono text-[#1a629b] text-sm">{commissionItems}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={commissionItems}
                  onChange={(e) => setCommissionItems(parseFloat(e.target.value))}
                  className="w-full accent-[#1a629b] cursor-pointer"
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">Southern Olive Oil Products S.A.R.L</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-slate-100 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-[#1a629b] hover:bg-[#124b77] text-white font-bold rounded-lg shadow-sm transition-colors"
            >
              حفظ وإنشاء الموظف
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
