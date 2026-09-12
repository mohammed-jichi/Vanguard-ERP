'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Search, List, Save, AlertCircle, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import { OmegaEventVenueItem, OmegaCountryItem, OmegaRegionItem, OmegaSubRegionItem } from '@/lib/eventsData';
import { EventsService } from '@/lib/eventsService';
import InteractiveVenueMap from '@/components/InteractiveVenueMap';
import lebanonGeoData from '@/lib/lebanonGeoData.json';

interface EventVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (venue: OmegaEventVenueItem) => void;
  venueToEdit?: OmegaEventVenueItem | null;
}

const DEFAULT_ZONES = [
  { ID: 1, ZONE: 'Zone 1 - Beirut Central & Coastal' },
  { ID: 2, ZONE: 'Zone 2 - Mount Lebanon North (Metn / Keserwan)' },
  { ID: 3, ZONE: 'Zone 3 - Mount Lebanon South (Baabda / Aley / Chouf)' },
  { ID: 4, ZONE: 'Zone 4 - South Lebanon (Saida / Tyre / Jezzine)' },
  { ID: 5, ZONE: 'Zone 5 - Nabatieh & Marjeyoun' },
  { ID: 6, ZONE: 'Zone 6 - Bekaa & Zahle' },
  { ID: 7, ZONE: 'Zone 7 - Baalbek & Hermel' },
  { ID: 8, ZONE: 'Zone 8 - North Lebanon (Tripoli / Koura / Batroun / Akkar)' }
];

export default function EventVenueModal({
  isOpen,
  onClose,
  onSaved,
  venueToEdit
}: EventVenueModalProps) {
  // Collapsible cards state
  const [generalCollapsed, setGeneralCollapsed] = useState(false);
  const [addressCollapsed, setAddressCollapsed] = useState(false);

  // Sub-modals state
  const [selectStateModalOpen, setSelectStateModalOpen] = useState(false);
  const [selectCityModalOpen, setSelectCityModalOpen] = useState(false);
  const [searchStateQuery, setSearchStateQuery] = useState('');
  const [searchCityQuery, setSearchCityQuery] = useState('');

  // Validation feedback
  const [showErrors, setShowErrors] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [form, setForm] = useState({
    venue_id: undefined as number | undefined,
    venue_name: '',
    contact_name: '',
    contact_email: '',
    country: 115, // Lebanon
    dialing_code: '+961',
    contact_phone: '',
    venue_url: '',
    venue_insta: '',
    venue_youtube: '',
    venue_facebook: '',
    venue_tiktok: '',
    city: '',
    state: '',
    street: '',
    building: '',
    floor: '',
    lat: 33.8938 as number | null,
    lng: 35.5018 as number | null,
    zone: 1 as number | null,
    remark: ''
  });

  const countries: OmegaCountryItem[] = lebanonGeoData.countries || [];
  const regions: OmegaRegionItem[] = lebanonGeoData.regions || [];
  const subregions: OmegaSubRegionItem[] = lebanonGeoData.subregions || [];

  // Reset or Populate form on open
  useEffect(() => {
    if (!isOpen) return;

    setShowErrors(false);
    setSubmitError(null);
    setIsSaving(false);
    setSearchStateQuery('');
    setSearchCityQuery('');

    if (venueToEdit) {
      // Clean prefix for social inputs
      const cleanInsta = (venueToEdit.venue_insta || '')
        .replace(/^https?:\/\/(www\.)?instagram\.com\//, '')
        .replace(/\/$/, '');
      const cleanFb = (venueToEdit.venue_facebook || '')
        .replace(/^https?:\/\/(www\.)?facebook\.com\//, '')
        .replace(/\/$/, '');
      const cleanYt = (venueToEdit.venue_youtube || '')
        .replace(/^https?:\/\/(www\.)?youtube\.com\//, '')
        .replace(/\/$/, '');
      const cleanTt = (venueToEdit.venue_tiktok || '')
        .replace(/^https?:\/\/(www\.)?tiktok\.com\//, '')
        .replace(/\/$/, '');

      setForm({
        venue_id: venueToEdit.venue_id,
        venue_name: venueToEdit.venue_name || '',
        contact_name: venueToEdit.contact_name || '',
        contact_email: venueToEdit.contact_email || '',
        country: venueToEdit.country || 115,
        dialing_code: venueToEdit.dialing_code || '+961',
        contact_phone: venueToEdit.contact_phone ? String(venueToEdit.contact_phone) : '',
        venue_url: venueToEdit.venue_url || '',
        venue_insta: cleanInsta,
        venue_youtube: cleanYt,
        venue_facebook: cleanFb,
        venue_tiktok: cleanTt,
        city: venueToEdit.city || '',
        state: venueToEdit.state || '',
        street: venueToEdit.street || '',
        building: venueToEdit.building || '',
        floor: venueToEdit.floor || '',
        lat: venueToEdit.lat ?? 33.8938,
        lng: venueToEdit.lng ?? 35.5018,
        zone: venueToEdit.zone ?? 1,
        remark: venueToEdit.remark || ''
      });
    } else {
      // New Venue default
      setForm({
        venue_id: undefined,
        venue_name: '',
        contact_name: '',
        contact_email: '',
        country: 115,
        dialing_code: '+961',
        contact_phone: '',
        venue_url: '',
        venue_insta: '',
        venue_youtube: '',
        venue_facebook: '',
        venue_tiktok: '',
        city: '',
        state: '',
        street: '',
        building: '',
        floor: '',
        lat: 33.8938,
        lng: 35.5018,
        zone: 1,
        remark: ''
      });
    }
  }, [isOpen, venueToEdit]);

  // Handle Escape key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectCityModalOpen) {
          setSelectCityModalOpen(false);
        } else if (selectStateModalOpen) {
          setSelectStateModalOpen(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectCityModalOpen, selectStateModalOpen, isOpen, onClose]);

  // Handle Country change (updates dialing code)
  const handleCountryChange = (cId: number) => {
    const selected = countries.find(c => c.ID === Number(cId));
    setForm(prev => ({
      ...prev,
      country: Number(cId),
      dialing_code: selected?.DIALING_CODE || '+961'
    }));
  };

  // Map coordinate updates from InteractiveVenueMap
  const handleMapChange = (newLat: number, newLng: number) => {
    setForm(prev => ({
      ...prev,
      lat: newLat,
      lng: newLng
    }));
  };

  // Latitude input change (bidirectional)
  const handleLatInputChange = (val: string) => {
    const parsed = parseFloat(val);
    setForm(prev => ({
      ...prev,
      lat: isNaN(parsed) ? null : parsed
    }));
  };

  // Longitude input change (bidirectional)
  const handleLngInputChange = (val: string) => {
    const parsed = parseFloat(val);
    setForm(prev => ({
      ...prev,
      lng: isNaN(parsed) ? null : parsed
    }));
  };

  // Select State handler
  const handleSelectState = (region: OmegaRegionItem) => {
    setForm(prev => ({
      ...prev,
      state: region.name,
      lat: region.center_lat || prev.lat,
      lng: region.center_lng || prev.lng
    }));
    setSelectStateModalOpen(false);
    setSearchStateQuery('');
  };

  // Select City handler
  const handleSelectCity = (sub: OmegaSubRegionItem) => {
    setForm(prev => ({
      ...prev,
      city: sub.name,
      state: sub.region_name || prev.state,
      lat: sub.lat || prev.lat,
      lng: sub.lng || prev.lng
    }));
    setSelectCityModalOpen(false);
    setSearchCityQuery('');
  };

  // Filtered Regions for State modal (26 Cazaa / Governorates of Lebanon)
  const filteredRegions = useMemo(() => {
    const q = searchStateQuery.trim().toLowerCase();
    if (!q) return regions;
    return regions.filter(r => r.name.toLowerCase().includes(q));
  }, [regions, searchStateQuery]);

  // Filtered Subregions for City modal (2,790 authentic cities/towns from Omega ERP)
  const filteredSubregions = useMemo(() => {
    const q = searchCityQuery.trim().toLowerCase();
    if (!q) {
      if (form.state) {
        const stateCities = subregions.filter(s => s.region_name.toLowerCase() === form.state.toLowerCase());
        if (stateCities.length > 0) return stateCities;
      }
      return subregions.slice(0, 150);
    }
    return subregions
      .filter(s => s.name.toLowerCase().includes(q) || s.region_name.toLowerCase().includes(q))
      .slice(0, 200);
  }, [subregions, searchCityQuery, form.state]);

  // Save handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);
    setSubmitError(null);

    // Validate required fields
    if (!form.venue_name.trim() || !form.contact_name.trim() || !form.contact_email.trim() || !form.contact_phone.trim()) {
      setSubmitError('Please fill in all required fields marked with * in General.');
      return;
    }
    if (!form.city.trim() || !form.state.trim() || !form.country) {
      setSubmitError('Please fill in City, State, and Country in Address.');
      return;
    }

    setIsSaving(true);

    try {
      const payload: Partial<OmegaEventVenueItem> = {
        venue_id: form.venue_id,
        venue_name: form.venue_name.trim(),
        contact_name: form.contact_name.trim(),
        contact_email: form.contact_email.trim(),
        country: form.country,
        dialing_code: form.dialing_code,
        contact_phone: form.contact_phone.trim(),
        venue_url: form.venue_url.trim(),
        venue_insta: form.venue_insta.trim(),
        venue_youtube: form.venue_youtube.trim(),
        venue_facebook: form.venue_facebook.trim(),
        venue_tiktok: form.venue_tiktok.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        street: form.street.trim(),
        building: form.building.trim(),
        floor: form.floor.trim(),
        lat: form.lat,
        lng: form.lng,
        zone: form.zone ? Number(form.zone) : null,
        remark: form.remark.trim()
      };

      const result = EventsService.saveVenue(payload);

      if (result.code === 1 && result.data) {
        onSaved(result.data);
        onClose();
      } else if (result.code === -1) {
        setSubmitError('Venue already exists with this name. Please choose a different name.');
      } else {
        setSubmitError('Failed to save venue. Please check your inputs.');
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
          onClick={e => e.stopPropagation()}
        >
          
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200 shrink-0">
            <h2 className="text-base font-bold text-slate-800 tracking-tight">
              {venueToEdit ? 'Edit Event Venue' : 'New Event Venue'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body (Scrollable) */}
          <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-5 space-y-4 text-xs">
            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* ============================================================== */}
            {/* CARD 1: GENERAL */}
            {/* ============================================================== */}
            <div className="border border-[#dee2e6] rounded shadow-2xs overflow-hidden bg-white">
              <div
                className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#dee2e6] flex items-center justify-between cursor-pointer select-none"
                onClick={() => setGeneralCollapsed(!generalCollapsed)}
              >
                <span className="font-bold text-slate-800 text-[13px]">General</span>
                {generalCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                )}
              </div>

              {!generalCollapsed && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Venue Name */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Venue Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter venue name"
                        value={form.venue_name}
                        onChange={e => setForm({ ...form, venue_name: e.target.value })}
                        className={`w-full h-8 px-2.5 text-xs border rounded focus:outline-none focus:border-[#007bff] ${
                          showErrors && !form.venue_name.trim() ? 'border-rose-500 bg-rose-50/20' : 'border-[#ced4da]'
                        }`}
                      />
                      {showErrors && !form.venue_name.trim() && (
                        <span className="text-rose-600 text-[11px] mt-0.5 block">Venue name is required</span>
                      )}
                    </div>

                    {/* Contact Name */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Contact Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Enter contact name"
                        value={form.contact_name}
                        onChange={e => setForm({ ...form, contact_name: e.target.value })}
                        className={`w-full h-8 px-2.5 text-xs border rounded focus:outline-none focus:border-[#007bff] ${
                          showErrors && !form.contact_name.trim() ? 'border-rose-500 bg-rose-50/20' : 'border-[#ced4da]'
                        }`}
                      />
                      {showErrors && !form.contact_name.trim() && (
                        <span className="text-rose-600 text-[11px] mt-0.5 block">Contact name is required</span>
                      )}
                    </div>

                    {/* Contact Email */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Contact Email <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Enter email address"
                        value={form.contact_email}
                        onChange={e => setForm({ ...form, contact_email: e.target.value })}
                        className={`w-full h-8 px-2.5 text-xs border rounded focus:outline-none focus:border-[#007bff] ${
                          showErrors && !form.contact_email.trim() ? 'border-rose-500 bg-rose-50/20' : 'border-[#ced4da]'
                        }`}
                      />
                      {showErrors && !form.contact_email.trim() && (
                        <span className="text-rose-600 text-[11px] mt-0.5 block">Contact email is required</span>
                      )}
                    </div>

                    {/* Contact Phone */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Contact Phone <span className="text-rose-600">*</span>
                      </label>
                      <div className="flex gap-1.5">
                        <select
                          value={form.country}
                          onChange={e => handleCountryChange(Number(e.target.value))}
                          className="w-28 h-8 px-2 text-xs border border-[#ced4da] rounded bg-white focus:outline-none focus:border-[#007bff] font-mono shrink-0"
                        >
                          {countries.map(c => (
                            <option key={c.ID} value={c.ID}>
                              {c.DIALING_CODE} ({c.COUNTRY_CODE})
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          required
                          placeholder="Enter phone number"
                          value={form.contact_phone}
                          onChange={e =>
                            setForm({
                              ...form,
                              contact_phone: e.target.value.replace(/[^0-9]/g, '')
                            })
                          }
                          className={`flex-1 h-8 px-2.5 text-xs border rounded focus:outline-none focus:border-[#007bff] ${
                            showErrors && !form.contact_phone.trim() ? 'border-rose-500 bg-rose-50/20' : 'border-[#ced4da]'
                          }`}
                        />
                      </div>
                      {showErrors && !form.contact_phone.trim() && (
                        <span className="text-rose-600 text-[11px] mt-0.5 block">Contact phone is required</span>
                      )}
                    </div>

                    {/* Venue URL */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Venue URL</label>
                      <input
                        type="url"
                        placeholder="Enter venue URL"
                        value={form.venue_url}
                        onChange={e => setForm({ ...form, venue_url: e.target.value })}
                        className="w-full h-8 px-2.5 text-xs border border-[#ced4da] rounded focus:outline-none focus:border-[#007bff]"
                      />
                    </div>

                    {/* Venue Instagram */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Venue Instagram</label>
                      <div className="flex rounded border border-[#ced4da] overflow-hidden focus-within:border-[#007bff]">
                        <span className="bg-[#e9ecef] px-2.5 py-1 text-slate-500 border-r border-[#ced4da] text-[11px] flex items-center select-none font-mono">
                          https://www.instagram.com/
                        </span>
                        <input
                          type="text"
                          placeholder="Enter page name (e.g. omega)"
                          value={form.venue_insta}
                          onChange={e => setForm({ ...form, venue_insta: e.target.value.replace(/\s+/g, '') })}
                          className="flex-1 h-8 px-2 text-xs border-0 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Venue YouTube */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Venue YouTube</label>
                      <div className="flex rounded border border-[#ced4da] overflow-hidden focus-within:border-[#007bff]">
                        <span className="bg-[#e9ecef] px-2.5 py-1 text-slate-500 border-r border-[#ced4da] text-[11px] flex items-center select-none font-mono">
                          https://www.youtube.com/
                        </span>
                        <input
                          type="text"
                          placeholder="Enter channel or handle (e.g. @omegaevents)"
                          value={form.venue_youtube}
                          onChange={e => setForm({ ...form, venue_youtube: e.target.value.replace(/\s+/g, '') })}
                          className="flex-1 h-8 px-2 text-xs border-0 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Venue Facebook */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Venue Facebook</label>
                      <div className="flex rounded border border-[#ced4da] overflow-hidden focus-within:border-[#007bff]">
                        <span className="bg-[#e9ecef] px-2.5 py-1 text-slate-500 border-r border-[#ced4da] text-[11px] flex items-center select-none font-mono">
                          https://www.facebook.com/
                        </span>
                        <input
                          type="text"
                          placeholder="Enter page name (e.g. omega.events)"
                          value={form.venue_facebook}
                          onChange={e => setForm({ ...form, venue_facebook: e.target.value.replace(/\s+/g, '') })}
                          className="flex-1 h-8 px-2 text-xs border-0 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Venue TikTok */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Venue TikTok</label>
                      <div className="flex rounded border border-[#ced4da] overflow-hidden focus-within:border-[#007bff]">
                        <span className="bg-[#e9ecef] px-2.5 py-1 text-slate-500 border-r border-[#ced4da] text-[11px] flex items-center select-none font-mono">
                          https://www.tiktok.com/
                        </span>
                        <input
                          type="text"
                          placeholder="Enter TikTok username (e.g. @omega)"
                          value={form.venue_tiktok}
                          onChange={e => setForm({ ...form, venue_tiktok: e.target.value.replace(/\s+/g, '') })}
                          className="flex-1 h-8 px-2 text-xs border-0 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ============================================================== */}
            {/* CARD 2: ADDRESS */}
            {/* ============================================================== */}
            <div className="border border-[#dee2e6] rounded shadow-2xs overflow-hidden bg-white">
              <div
                className="bg-[#f8f9fa] px-4 py-2.5 border-b border-[#dee2e6] flex items-center justify-between cursor-pointer select-none"
                onClick={() => setAddressCollapsed(!addressCollapsed)}
              >
                <span className="font-bold text-slate-800 text-[13px]">Address</span>
                {addressCollapsed ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                )}
              </div>

              {!addressCollapsed && (
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* City with List button */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        City <span className="text-rose-600">*</span>
                      </label>
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          placeholder="Enter city"
                          value={form.city}
                          onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              setSearchCityQuery(form.city);
                              setSelectCityModalOpen(true);
                            }
                          }}
                          className="flex-1 h-8 px-2.5 text-xs border border-[#ced4da] rounded bg-white text-slate-800 focus:outline-none focus:border-[#007bff]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSearchCityQuery(form.city || '');
                            setSelectCityModalOpen(true);
                          }}
                          className="h-8 w-9 bg-[#007bff] hover:bg-[#0069d9] text-white rounded flex items-center justify-center transition-colors shadow-2xs cursor-pointer shrink-0"
                          title="Select City from database (2,790 cities)"
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                      {showErrors && !form.city.trim() && (
                        <span className="text-rose-600 text-[11px] mt-0.5 block">City is required</span>
                      )}
                    </div>

                    {/* State with List button */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        State <span className="text-rose-600">*</span>
                      </label>
                      <div className="flex gap-1.5 items-center">
                        <input
                          type="text"
                          placeholder="Enter state"
                          value={form.state}
                          onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              setSearchStateQuery(form.state);
                              setSelectStateModalOpen(true);
                            }
                          }}
                          className="flex-1 h-8 px-2.5 text-xs border border-[#ced4da] rounded bg-white text-slate-800 focus:outline-none focus:border-[#007bff]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSearchStateQuery(form.state || '');
                            setSelectStateModalOpen(true);
                          }}
                          className="h-8 w-9 bg-[#007bff] hover:bg-[#0069d9] text-white rounded flex items-center justify-center transition-colors shadow-2xs cursor-pointer shrink-0"
                          title="Select State from database (26 states)"
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                      {showErrors && !form.state.trim() && (
                        <span className="text-rose-600 text-[11px] mt-0.5 block">State is required</span>
                      )}
                    </div>

                    {/* Country Dropdown */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Country <span className="text-rose-600">*</span>
                      </label>
                      <select
                        value={form.country}
                        onChange={e => handleCountryChange(Number(e.target.value))}
                        className="w-full h-8 px-2.5 text-xs border border-[#ced4da] rounded bg-white focus:outline-none focus:border-[#007bff]"
                      >
                        {countries.map(c => (
                          <option key={c.ID} value={c.ID}>
                            {c.NAME}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Street */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Street</label>
                      <input
                        type="text"
                        placeholder="Enter street"
                        value={form.street}
                        onChange={e => setForm({ ...form, street: e.target.value })}
                        className="w-full h-8 px-2.5 text-xs border border-[#ced4da] rounded focus:outline-none focus:border-[#007bff]"
                      />
                    </div>

                    {/* Building */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Building</label>
                      <input
                        type="text"
                        placeholder="Enter building"
                        value={form.building}
                        onChange={e => setForm({ ...form, building: e.target.value })}
                        className="w-full h-8 px-2.5 text-xs border border-[#ced4da] rounded focus:outline-none focus:border-[#007bff]"
                      />
                    </div>

                    {/* Floor */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Floor</label>
                      <input
                        type="text"
                        placeholder="Enter floor"
                        value={form.floor}
                        onChange={e => setForm({ ...form, floor: e.target.value })}
                        className="w-full h-8 px-2.5 text-xs border border-[#ced4da] rounded focus:outline-none focus:border-[#007bff]"
                      />
                    </div>
                  </div>

                  {/* INTERACTIVE VENUE MAP (Leaflet OpenStreetMap) */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        Interactive Map Location
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Click anywhere or drag marker to set exact venue location
                      </span>
                    </div>
                    <div className="h-64 sm:h-72 w-full rounded border border-[#ced4da] overflow-hidden shadow-2xs">
                      <InteractiveVenueMap
                        lat={form.lat}
                        lng={form.lng}
                        onChange={handleMapChange}
                        className="h-full w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    {/* Zone */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Zone</label>
                      <select
                        value={form.zone || ''}
                        onChange={e => setForm({ ...form, zone: e.target.value ? Number(e.target.value) : null })}
                        className="w-full h-8 px-2.5 text-xs border border-[#ced4da] rounded bg-white focus:outline-none focus:border-[#007bff]"
                      >
                        <option value="">Select zone</option>
                        {DEFAULT_ZONES.map(z => (
                          <option key={z.ID} value={z.ID}>
                            {z.ZONE}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Latitude */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Latitude</label>
                      <input
                        type="text"
                        placeholder="Enter latitude"
                        value={form.lat !== null ? form.lat : ''}
                        onChange={e => handleLatInputChange(e.target.value)}
                        className="w-full h-8 px-2.5 text-xs border border-[#ced4da] rounded focus:outline-none focus:border-[#007bff] font-mono"
                      />
                    </div>

                    {/* Longitude */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Longitude</label>
                      <input
                        type="text"
                        placeholder="Enter longitude"
                        value={form.lng !== null ? form.lng : ''}
                        onChange={e => handleLngInputChange(e.target.value)}
                        className="w-full h-8 px-2.5 text-xs border border-[#ced4da] rounded focus:outline-none focus:border-[#007bff] font-mono"
                      />
                    </div>

                    {/* Remark */}
                    <div className="md:col-span-3">
                      <label className="block text-slate-700 font-semibold mb-1">Remark</label>
                      <input
                        type="text"
                        placeholder="Enter remark"
                        value={form.remark}
                        onChange={e => setForm({ ...form, remark: e.target.value })}
                        className="w-full h-8 px-2.5 text-xs border border-[#ced4da] rounded focus:outline-none focus:border-[#007bff]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-semibold bg-[#007bff] hover:bg-[#0069d9] text-white rounded flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUB-MODAL: SELECT STATE (regionSelectionModal) */}
      {/* ============================================================== */}
      {selectStateModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs"
          onClick={() => setSelectStateModalOpen(false)}
        >
          <div
            className="relative z-[10000] bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="text-sm font-bold text-slate-800">Select State</h3>
              <button
                type="button"
                onClick={() => setSelectStateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search state..."
                  value={searchStateQuery}
                  onChange={e => setSearchStateQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-8 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#007bff] bg-white"
                  autoFocus
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                {searchStateQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchStateQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto divide-y divide-slate-100 p-2 text-xs flex-1">
              {filteredRegions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 italic">No states found matching "{searchStateQuery}"</div>
              ) : (
                filteredRegions.map(reg => (
                  <button
                    key={reg.id}
                    type="button"
                    onClick={() => handleSelectState(reg)}
                    className="w-full px-3 py-2.5 text-left hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <span className="font-semibold text-slate-800 group-hover:text-blue-700">{reg.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {reg.center_lat?.toFixed(2)}, {reg.center_lng?.toFixed(2)}
                    </span>
                  </button>
                ))
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-slate-200 flex justify-between items-center bg-slate-50 text-[11px] text-slate-500">
              <span>Showing {filteredRegions.length} states</span>
              <button
                type="button"
                onClick={() => setSelectStateModalOpen(false)}
                className="px-4 py-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold rounded text-xs transition-colors shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-MODAL: SELECT CITY (subregionSelectionModal) */}
      {/* ============================================================== */}
      {selectCityModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs"
          onClick={() => setSelectCityModalOpen(false)}
        >
          <div
            className="relative z-[10000] bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h3 className="text-sm font-bold text-slate-800">Select City</h3>
              <button
                type="button"
                onClick={() => setSelectCityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <input
                  type="search"
                  placeholder="Search city or state..."
                  value={searchCityQuery}
                  onChange={e => setSearchCityQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-8 text-xs border border-slate-300 rounded focus:outline-none focus:border-[#007bff] bg-white"
                  autoFocus
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                {searchCityQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchCityQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto p-2 text-xs flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px] bg-slate-50/75">
                    <th className="py-2 px-3">City</th>
                    <th className="py-2 px-3">State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubregions.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-8 text-center text-slate-400 italic">
                        No cities found matching "{searchCityQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredSubregions.map(sub => (
                      <tr
                        key={sub.id}
                        onClick={() => handleSelectCity(sub)}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="py-2 px-3 font-semibold text-slate-800">{sub.name}</td>
                        <td className="py-2 px-3 text-slate-500">{sub.region_name}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-2.5 border-t border-slate-200 flex justify-between items-center bg-slate-50 text-[11px] text-slate-500">
              <span>Showing {filteredSubregions.length} of 2,790 cities from database</span>
              <button
                type="button"
                onClick={() => setSelectCityModalOpen(false)}
                className="px-4 py-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white font-semibold rounded text-xs transition-colors shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
