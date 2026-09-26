'use client';
import { useLanguage } from '@/lib/LanguageContext';

import React, { useState } from 'react';

interface SocialRepFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess?: () => void;
  isManagerRole?: boolean;
}

export default function SocialRepFormModal({
  isOpen,
  onClose,
  onSaveSuccess,
  isManagerRole = false,
}: SocialRepFormModalProps) {
  const { t } = useLanguage();
  // Personal Info
  const [firstName, setFirstName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [lastName, setLastName] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [socialPhone, setSocialPhone] = useState('');

  // Detailed Address
  const [region, setRegion] = useState('Mount Lebanon');
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
      alert('Please fill in required fields: First Name, Last Name, Phone Number, and Admin Code.');
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

    console.log('[Vanguard ERP] Registering Rep:', payload);
    alert(`Representative record created successfully with code: ${systemCode}`);
    if (onSaveSuccess) onSaveSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-sans text-left select-none overflow-y-auto">
      <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="bg-primary text-primary-foreground px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <h2 className="text-sm font-bold tracking-tight uppercase">
              {isManagerRole ? 'Add Social Media Manager' : 'Add Social Media Sales Representative'}
            </h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-primary-foreground/70 hover:text-primary-foreground text-base font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body Form */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar text-xs text-foreground">
          
          {/* Section 1: Full Name */}
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-bold text-foreground mb-2 uppercase tracking-wide">1. Full Legal Name</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              <div>
                <label className="block font-medium text-muted-foreground mb-1">{t('first_name', 'First Name *')}</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={t('first_name', 'First name')}
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-card text-foreground font-medium focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-muted-foreground mb-1">{t('middle_fathers_name', 'Middle / Father\'s Name *')}</label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder={t('middle_name', 'Middle name')}
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-card text-foreground font-medium focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-muted-foreground mb-1">{t('last_family_name', 'Last / Family Name *')}</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder={t('last_name', 'Last name')}
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-card text-foreground font-medium focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Numbers */}
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-bold text-foreground mb-2 uppercase tracking-wide">2. Contact Numbers</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-medium text-muted-foreground mb-1">{t('primary_mobile_phone', 'Primary Mobile Phone *')}</label>
                <input
                  type="text"
                  value={personalPhone}
                  onChange={(e) => setPersonalPhone(e.target.value)}
                  placeholder="+961 70 123456"
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-card text-foreground font-mono focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-muted-foreground mb-1">{t('whatsapp_social_business_number', 'WhatsApp / Social Business Number *')}</label>
                <input
                  type="text"
                  value={socialPhone}
                  onChange={(e) => setSocialPhone(e.target.value)}
                  placeholder="+961 3 123456"
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-card text-foreground font-mono focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Physical Address */}
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-bold text-foreground mb-2 uppercase tracking-wide">3. Address & Territory</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mb-2.5">
              <div>
                <label className="block font-medium text-muted-foreground mb-1">{t('governorate_region', 'Governorate / Region')}</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-card text-foreground font-medium focus:border-primary focus:outline-none"
                >
                  <option value="Beirut">{t('beirut', 'Beirut')}</option>
                  <option value="Mount Lebanon">{t('mount_lebanon', 'Mount Lebanon')}</option>
                  <option value="South Lebanon">{t('south_lebanon', 'South Lebanon')}</option>
                  <option value="Nabatieh">{t('nabatieh', 'Nabatieh')}</option>
                  <option value="North Lebanon">{t('north_lebanon', 'North Lebanon')}</option>
                  <option value="Bekaa">{t('bekaa', 'Bekaa')}</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-muted-foreground mb-1">{t('city_town', 'City / Town')}</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t('city', 'City')}
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-card text-foreground font-medium focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-muted-foreground mb-1">{t('street_address', 'Street Address')}</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder={t('street', 'Street')}
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-card text-foreground font-medium focus:border-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-medium text-muted-foreground mb-1">{t('building_complex', 'Building / Complex')}</label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder={t('building_name', 'Building name')}
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-card text-foreground font-medium focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-medium text-muted-foreground mb-1">{t('floor_unit', 'Floor / Unit')}</label>
                <input
                  type="text"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder={t('floor_or_apt', 'Floor or Apt')}
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-card text-foreground font-medium focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Identification Codes */}
          <div className="border-b border-border/60 pb-3">
            <h3 className="font-bold text-foreground mb-2 uppercase tracking-wide">4. Identification & Codes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-muted-foreground mb-1">{t('admin_assigned_code', 'Admin Assigned Code *')}</label>
                <input
                  type="text"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder={t('eg_admrep01', 'e.g. ADM-REP-01')}
                  className="w-full px-2.5 py-1.5 bg-card border border-border rounded-lg font-bold text-primary focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block font-medium text-muted-foreground mb-1">System Internal Code (Auto)</label>
                <input
                  type="text"
                  value={systemCode}
                  readOnly
                  className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg font-mono font-bold text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Social Media Platform Links */}
          <div className="border-b border-border/60 pb-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-foreground uppercase tracking-wide">5. Social Media Channels</h3>
              <button
                type="button"
                onClick={handleAddOtherLink}
                className="px-2 py-1 bg-muted text-foreground border border-border rounded-lg text-[11px] font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>+ Add Channel</span>
              </button>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-0.5">{t('facebook_page_url', 'Facebook Page URL')}</label>
                <input
                  type="text"
                  value={facebookLink}
                  onChange={(e) => setFacebookLink(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-card text-foreground font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-0.5">{t('instagram_profile_url', 'Instagram Profile URL')}</label>
                <input
                  type="text"
                  value={instagramLink}
                  onChange={(e) => setInstagramLink(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-card text-foreground font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-0.5">{t('tiktok_channel_url', 'TikTok Channel URL')}</label>
                <input
                  type="text"
                  value={tiktokLink}
                  onChange={(e) => setTiktokLink(e.target.value)}
                  placeholder="https://tiktok.com/@..."
                  className="w-full px-2.5 py-1.5 border border-border rounded-lg bg-card text-foreground font-mono"
                />
              </div>

              {/* Dynamic Other Links */}
              {otherLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={link.title}
                    onChange={(e) => handleUpdateOtherLink(link.id, 'title', e.target.value)}
                    placeholder="Platform (e.g. Snapchat)"
                    className="w-1/3 px-2 py-1.5 border border-border rounded-lg bg-card text-foreground text-xs font-semibold"
                  />
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => handleUpdateOtherLink(link.id, 'url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-2 py-1.5 border border-border rounded-lg bg-card text-foreground font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOtherLink(link.id)}
                    className="px-2 py-1.5 text-rose-500 hover:bg-rose-50 rounded cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Commission Percentage Bars (Hidden for Managers) */}
          {!isManagerRole && (
            <div className="bg-muted/40 border border-border p-3.5 rounded-xl space-y-3">
              <h3 className="font-bold text-foreground uppercase tracking-wide">6. Sales Commission Rates</h3>
              
              {/* Offers Commission Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-medium text-foreground">Commission on Promotional Offers (%):</label>
                  <span className="font-bold font-mono text-primary text-sm">{commissionOffers}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={commissionOffers}
                  onChange={(e) => setCommissionOffers(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Regular Items Commission Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-medium text-foreground">Commission on Standard Catalog Items (%):</label>
                  <span className="font-bold font-mono text-primary text-sm">{commissionItems}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={commissionItems}
                  onChange={(e) => setCommissionItems(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-muted border-t border-border px-5 py-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-mono">{t('vanguard_erp_personnel_ledger', 'Vanguard ERP Personnel Ledger')}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-border bg-card rounded-lg text-foreground font-semibold hover:bg-muted transition-colors cursor-pointer"
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-primary hover:bg-slate-800 text-primary-foreground font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {t('save_representative', 'Save Representative')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
