'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ArrowUpDown,
  ChevronsUp,
  ChevronDown,
  ArrowLeftRight,
  AlertTriangle
} from 'lucide-react';
import {
  LocationItem,
  ZoneItem,
  AisleItem,
  INITIAL_OMEGA_LOCATIONS,
  INITIAL_OMEGA_ZONES,
  INITIAL_OMEGA_AISLES
} from '@/lib/omegaLocationsData';

type LocationTab = 'locations' | 'zones' | 'aisles';

export default function AuthenticOmegaLocationsView() {
  // ---------------------------------------------------------------------------
  // Active Navigation Tab (Locations / Zones / Aisles)
  // ---------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<LocationTab>('locations');

  // ---------------------------------------------------------------------------
  // Locations State (synced with localStorage & fallback to live Omega data)
  // ---------------------------------------------------------------------------
  const [locations, setLocations] = useState<LocationItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_omega_locations');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Error reading saved locations:', e);
      }
    }
    return INITIAL_OMEGA_LOCATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vanguard_omega_locations', JSON.stringify(locations));
    } catch (e) {
      console.error('Error saving locations:', e);
    }
  }, [locations]);

  // ---------------------------------------------------------------------------
  // Zones State
  // ---------------------------------------------------------------------------
  const [zones, setZones] = useState<ZoneItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_omega_zones');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Error reading saved zones:', e);
      }
    }
    return INITIAL_OMEGA_ZONES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vanguard_omega_zones', JSON.stringify(zones));
    } catch (e) {
      console.error('Error saving zones:', e);
    }
  }, [zones]);

  // ---------------------------------------------------------------------------
  // Aisles State
  // ---------------------------------------------------------------------------
  const [aisles, setAisles] = useState<AisleItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('vanguard_omega_aisles');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {
        console.error('Error reading saved aisles:', e);
      }
    }
    return INITIAL_OMEGA_AISLES;
  });

  useEffect(() => {
    try {
      localStorage.setItem('vanguard_omega_aisles', JSON.stringify(aisles));
    } catch (e) {
      console.error('Error saving aisles:', e);
    }
  }, [aisles]);

  // ---------------------------------------------------------------------------
  // Search & Sorting States
  // ---------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'LOCATIONID' | 'LOCATIONDESCRIPTION'>('LOCATIONDESCRIPTION');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Zones/Aisles sorting
  const [zaSortField, setZaSortField] = useState<'id' | 'name' | 'code' | 'description'>('name');
  const [zaSortOrder, setZaSortOrder] = useState<'asc' | 'desc'>('asc');

  // ---------------------------------------------------------------------------
  // Dropdown States
  // ---------------------------------------------------------------------------
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setIsActionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------------------------------------------------------------------------
  // Modals States
  // ---------------------------------------------------------------------------
  // Locations Modals
  const [isNewLocationOpen, setIsNewLocationOpen] = useState(false);
  const [isEditLocationOpen, setIsEditLocationOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);

  const [newLocationDescription, setNewLocationDescription] = useState('');
  const [newLocationAcc, setNewLocationAcc] = useState('');

  const [editLocationId, setEditLocationId] = useState<number>(0);
  const [editLocationDescription, setEditLocationDescription] = useState('');
  const [editLocationAcc, setEditLocationAcc] = useState('');

  // Merge Locations Modal (Screenshot 1)
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [fromLocationId, setFromLocationId] = useState<string>('');
  const [toLocationId, setToLocationId] = useState<string>('');

  // Merge Warning Dialog (Screenshot 2)
  const [isMergeWarningOpen, setIsMergeWarningOpen] = useState(false);
  const [mergeConfirmationInput, setMergeConfirmationInput] = useState('');

  // Zones Modals
  const [isNewZoneOpen, setIsNewZoneOpen] = useState(false);
  const [isEditZoneOpen, setIsEditZoneOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ZoneItem | null>(null);
  const [zoneName, setZoneName] = useState('');
  const [zoneCode, setZoneCode] = useState('');
  const [zoneDescription, setZoneDescription] = useState('');

  // Aisles Modals
  const [isNewAisleOpen, setIsNewAisleOpen] = useState(false);
  const [isEditAisleOpen, setIsEditAisleOpen] = useState(false);
  const [editingAisle, setEditingAisle] = useState<AisleItem | null>(null);
  const [aisleName, setAisleName] = useState('');
  const [aisleCode, setAisleCode] = useState('');
  const [aisleDescription, setAisleDescription] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ---------------------------------------------------------------------------
  // Sorting Handlers
  // ---------------------------------------------------------------------------
  const handleSortLocation = (field: 'LOCATIONID' | 'LOCATIONDESCRIPTION') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSortZA = (field: 'id' | 'name' | 'code' | 'description') => {
    if (zaSortField === field) {
      setZaSortOrder(zaSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setZaSortField(field);
      setZaSortOrder('asc');
    }
  };

  // ---------------------------------------------------------------------------
  // Filtered Datasets
  // ---------------------------------------------------------------------------
  const filteredLocations = useMemo(() => {
    return locations
      .filter((l) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          l.LOCATIONDESCRIPTION.toLowerCase().includes(q) ||
          String(l.LOCATIONID).includes(q) ||
          String(l.ACCDEPT || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortField === 'LOCATIONID') {
          return sortOrder === 'asc' ? a.LOCATIONID - b.LOCATIONID : b.LOCATIONID - a.LOCATIONID;
        }
        const comp = a.LOCATIONDESCRIPTION.localeCompare(b.LOCATIONDESCRIPTION);
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [locations, searchQuery, sortField, sortOrder]);

  const filteredZones = useMemo(() => {
    return zones
      .filter((z) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          z.name.toLowerCase().includes(q) ||
          (z.code && z.code.toLowerCase().includes(q)) ||
          (z.description && z.description.toLowerCase().includes(q)) ||
          String(z.id).includes(q)
        );
      })
      .sort((a, b) => {
        if (zaSortField === 'id') {
          return zaSortOrder === 'asc' ? a.id - b.id : b.id - a.id;
        }
        const valA = a[zaSortField] || '';
        const valB = b[zaSortField] || '';
        const comp = String(valA).localeCompare(String(valB));
        return zaSortOrder === 'asc' ? comp : -comp;
      });
  }, [zones, searchQuery, zaSortField, zaSortOrder]);

  const filteredAisles = useMemo(() => {
    return aisles
      .filter((a) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          a.name.toLowerCase().includes(q) ||
          (a.code && a.code.toLowerCase().includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          String(a.id).includes(q)
        );
      })
      .sort((a, b) => {
        if (zaSortField === 'id') {
          return zaSortOrder === 'asc' ? a.id - b.id : b.id - a.id;
        }
        const valA = a[zaSortField] || '';
        const valB = b[zaSortField] || '';
        const comp = String(valA).localeCompare(String(valB));
        return zaSortOrder === 'asc' ? comp : -comp;
      });
  }, [aisles, searchQuery, zaSortField, zaSortOrder]);

  // ---------------------------------------------------------------------------
  // Location Handlers (New & Edit)
  // ---------------------------------------------------------------------------
  const handleSaveNewLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationDescription.trim()) {
      alert('Location Description is required');
      return;
    }

    const nextLocId = Math.max(0, ...locations.map((l) => l.LOCATIONID)) + 1;
    const nextId = Math.max(0, ...locations.map((l) => l.ID)) + 1;

    const newLoc: LocationItem = {
      ID: nextId,
      LOCATIONID: nextLocId,
      BRAND_ID: 9606,
      FORBRANCH: 1,
      BRANCHID: 1,
      LOCATIONDESCRIPTION: newLocationDescription.trim(),
      ACCDEPT: newLocationAcc.trim() ? newLocationAcc.trim() : 0
    };

    setLocations([...locations, newLoc]);
    setIsNewLocationOpen(false);
    setNewLocationDescription('');
    setNewLocationAcc('');
    showToast(`Location "${newLoc.LOCATIONDESCRIPTION}" saved`);
  };

  const openEditLocationModal = (l: LocationItem) => {
    setEditingLocation(l);
    setEditLocationId(l.LOCATIONID);
    setEditLocationDescription(l.LOCATIONDESCRIPTION);
    setEditLocationAcc(l.ACCDEPT !== null && l.ACCDEPT !== undefined ? String(l.ACCDEPT) : '');
    setIsEditLocationOpen(true);
  };

  const handleUpdateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation) return;
    if (!editLocationDescription.trim()) {
      alert('Location Description is required');
      return;
    }

    const updated = locations.map((l) => {
      if (l.LOCATIONID === editingLocation.LOCATIONID) {
        return {
          ...l,
          LOCATIONDESCRIPTION: editLocationDescription.trim(),
          ACCDEPT: editLocationAcc.trim() ? editLocationAcc.trim() : 0
        };
      }
      return l;
    });

    setLocations(updated);
    setIsEditLocationOpen(false);
    setEditingLocation(null);
    showToast(`Location updated`);
  };

  const handleDeleteLocation = (l: LocationItem) => {
    if (confirm(`Are you sure that you want to delete this location?`)) {
      setLocations(locations.filter((item) => item.LOCATIONID !== l.LOCATIONID));
      showToast(`Location successfully deleted`);
    }
  };

  // ---------------------------------------------------------------------------
  // Merge Locations Handlers (Screenshots 1 & 2)
  // ---------------------------------------------------------------------------
  const handleInitiateMerge = () => {
    if (!fromLocationId || !toLocationId) {
      alert('Please select both From and To locations.');
      return;
    }
    if (fromLocationId === toLocationId) {
      alert('Choose different locations!');
      return;
    }
    setMergeConfirmationInput('');
    setIsMergeWarningOpen(true);
  };

  const handleConfirmMerge = () => {
    if (mergeConfirmationInput !== 'MERGE LOCATIONS') {
      alert('Please type exactly: MERGE LOCATIONS to confirm');
      return;
    }

    const fromNum = Number(fromLocationId);
    const toNum = Number(toLocationId);

    const fromLoc = locations.find((l) => l.LOCATIONID === fromNum);
    const toLoc = locations.find((l) => l.LOCATIONID === toNum);

    // Filter out the source location (from)
    const updated = locations.filter((l) => l.LOCATIONID !== fromNum);
    setLocations(updated);

    setIsMergeWarningOpen(false);
    setIsMergeModalOpen(false);
    setFromLocationId('');
    setToLocationId('');
    setMergeConfirmationInput('');
    showToast(`Locations Merged Successfully: "${fromLoc?.LOCATIONDESCRIPTION}" into "${toLoc?.LOCATIONDESCRIPTION}"`);
  };

  // ---------------------------------------------------------------------------
  // Zone Handlers
  // ---------------------------------------------------------------------------
  const handleSaveNewZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;
    const nextId = Math.max(0, ...zones.map((z) => z.id)) + 1;
    const newZ: ZoneItem = {
      id: nextId,
      brand_id: 9606,
      name: zoneName.trim(),
      code: zoneCode.trim() || null,
      description: zoneDescription.trim() || null
    };
    setZones([...zones, newZ]);
    setIsNewZoneOpen(false);
    setZoneName('');
    setZoneCode('');
    setZoneDescription('');
    showToast(`Zone saved`);
  };

  const openEditZone = (z: ZoneItem) => {
    setEditingZone(z);
    setZoneName(z.name);
    setZoneCode(z.code || '');
    setZoneDescription(z.description || '');
    setIsEditZoneOpen(true);
  };

  const handleUpdateZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone || !zoneName.trim()) return;
    const updated = zones.map((z) => {
      if (z.id === editingZone.id) {
        return {
          ...z,
          name: zoneName.trim(),
          code: zoneCode.trim() || null,
          description: zoneDescription.trim() || null
        };
      }
      return z;
    });
    setZones(updated);
    setIsEditZoneOpen(false);
    setEditingZone(null);
    showToast(`Zone updated`);
  };

  const handleDeleteZone = (z: ZoneItem) => {
    if (confirm(`Are you sure that you want to delete this zone?`)) {
      setZones(zones.filter((item) => item.id !== z.id));
      showToast(`Zone deleted`);
    }
  };

  // ---------------------------------------------------------------------------
  // Aisle Handlers
  // ---------------------------------------------------------------------------
  const handleSaveNewAisle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aisleName.trim()) return;
    const nextId = Math.max(0, ...aisles.map((a) => a.id)) + 1;
    const newA: AisleItem = {
      id: nextId,
      brand_id: 9606,
      name: aisleName.trim(),
      code: aisleCode.trim() || null,
      description: aisleDescription.trim() || null
    };
    setAisles([...aisles, newA]);
    setIsNewAisleOpen(false);
    setAisleName('');
    setAisleCode('');
    setAisleDescription('');
    showToast(`Aisle saved`);
  };

  const openEditAisle = (a: AisleItem) => {
    setEditingAisle(a);
    setAisleName(a.name);
    setAisleCode(a.code || '');
    setAisleDescription(a.description || '');
    setIsEditAisleOpen(true);
  };

  const handleUpdateAisle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAisle || !aisleName.trim()) return;
    const updated = aisles.map((a) => {
      if (a.id === editingAisle.id) {
        return {
          ...a,
          name: aisleName.trim(),
          code: aisleCode.trim() || null,
          description: aisleDescription.trim() || null
        };
      }
      return a;
    });
    setAisles(updated);
    setIsEditAisleOpen(false);
    setEditingAisle(null);
    showToast(`Aisle updated`);
  };

  const handleDeleteAisle = (a: AisleItem) => {
    if (confirm(`Are you sure that you want to delete this aisle?`)) {
      setAisles(aisles.filter((item) => item.id !== a.id));
      showToast(`Aisle deleted`);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-800 min-h-screen p-4 md:p-6 font-sans select-none relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#1e3a2b] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumbs */}
      <div className="mb-4">
        <h1 className="text-[22px] font-normal text-slate-800 tracking-tight">Locations</h1>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
          <a href="/backoffice/operations" className="text-blue-600 hover:underline">
            Home
          </a>
          <span>/</span>
          <span className="text-slate-500">Locations</span>
        </div>
      </div>

      {/* Navigation Tabs (Locations / Zones / Aisles) */}
      <div className="mb-3 border-b border-slate-200 flex items-center gap-2 text-xs">
        <button
          onClick={() => {
            setActiveTab('locations');
            setSearchQuery('');
          }}
          className={`px-4 py-2 font-medium border-b-2 transition cursor-pointer ${
            activeTab === 'locations'
              ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          Locations
        </button>
        <button
          onClick={() => {
            setActiveTab('zones');
            setSearchQuery('');
          }}
          className={`px-4 py-2 font-medium border-b-2 transition cursor-pointer ${
            activeTab === 'zones'
              ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          Zones
        </button>
        <button
          onClick={() => {
            setActiveTab('aisles');
            setSearchQuery('');
          }}
          className={`px-4 py-2 font-medium border-b-2 transition cursor-pointer ${
            activeTab === 'aisles'
              ? 'border-blue-600 text-blue-600 font-bold bg-white rounded-t'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          Aisles
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xs shadow-2xs overflow-hidden">
        {/* ===================================================================
            TAB 1: LOCATIONS CONTENT
            =================================================================== */}
        {activeTab === 'locations' && (
          <div>
            {/* Toolbar */}
            <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
              <div className="w-full sm:w-72 relative">
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <div className="w-full sm:w-auto flex items-center justify-end gap-2">
                {/* Actions Dropdown */}
                <div className="relative" ref={actionsRef}>
                  <button
                    onClick={() => setIsActionsOpen(!isActionsOpen)}
                    className="px-3.5 py-1.5 rounded-sm bg-[#323f4b] hover:bg-[#242d35] text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs active:scale-98 cursor-pointer"
                  >
                    <span>Actions</span>
                    <ChevronDown className="w-3 h-3 ml-0.5" />
                  </button>

                  {isActionsOpen && (
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded shadow-lg py-1 z-30 animate-fade-in text-xs">
                      <button
                        onClick={() => {
                          setIsActionsOpen(false);
                          setFromLocationId('');
                          setToLocationId('');
                          setIsMergeModalOpen(true);
                        }}
                        className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-100 flex items-center gap-2 font-bold cursor-pointer"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600" />
                        <span>Merge Locations</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* + New Button */}
                <button
                  onClick={() => setIsNewLocationOpen(true)}
                  className="px-3.5 py-1.5 rounded-sm bg-[#323f4b] hover:bg-[#242d35] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ New</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-slate-700 font-semibold text-[11.5px]">
                    <th
                      onClick={() => handleSortLocation('LOCATIONID')}
                      className="px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition w-16"
                    >
                      <div className="flex items-center gap-1">
                        <span>#</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSortLocation('LOCATIONDESCRIPTION')}
                      className="px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition"
                    >
                      <div className="flex items-center gap-1">
                        <span>Description</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-2.5 text-right w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLocations.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-slate-400 font-mono text-xs">
                        No locations found matching &quot;{searchQuery}&quot;
                      </td>
                    </tr>
                  ) : (
                    filteredLocations.map((row, idx) => (
                      <tr
                        key={row.LOCATIONID}
                        className={`transition ${idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'} hover:bg-blue-50/30`}
                      >
                        <td className="px-4 py-2.5 font-normal text-slate-800">{row.LOCATIONID}</td>
                        <td className="px-4 py-2.5 font-normal text-slate-800">{row.LOCATIONDESCRIPTION}</td>
                        <td className="px-4 py-2.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditLocationModal(row)}
                              title="Edit Location"
                              className="w-6 h-6 rounded-xs bg-[#323f4b] hover:bg-[#242d35] text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteLocation(row)}
                              title="Delete Location"
                              className="w-6 h-6 rounded-xs bg-[#b91c1c] hover:bg-[#991b1b] text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="py-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500">
              <div className="inline-flex items-center rounded border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <button className="px-2.5 py-1 text-slate-400 hover:bg-slate-50 cursor-not-allowed">«</button>
                <button className="px-3 py-1 bg-[#323f4b] text-white font-bold text-xs">1</button>
                <button className="px-2.5 py-1 text-slate-400 hover:bg-slate-50 cursor-not-allowed">»</button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 2: ZONES CONTENT
            =================================================================== */}
        {activeTab === 'zones' && (
          <div>
            <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
              <div className="w-full sm:w-72 relative">
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                onClick={() => {
                  setZoneName('');
                  setZoneCode('');
                  setZoneDescription('');
                  setIsNewZoneOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-sm bg-[#323f4b] hover:bg-[#242d35] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-slate-700 font-semibold text-[11.5px]">
                    <th onClick={() => handleSortZA('id')} className="px-4 py-2.5 cursor-pointer hover:bg-slate-50 w-16">
                      <div className="flex items-center gap-1">
                        <span>#</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th onClick={() => handleSortZA('name')} className="px-4 py-2.5 cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        <span>Name</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th onClick={() => handleSortZA('code')} className="px-4 py-2.5 cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        <span>Code</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th onClick={() => handleSortZA('description')} className="px-4 py-2.5 cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        <span>Description</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-2.5 text-right w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredZones.map((z, idx) => (
                    <tr key={z.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                      <td className="px-4 py-2.5 font-normal text-slate-800">{z.id}</td>
                      <td className="px-4 py-2.5 font-normal text-slate-800">{z.name}</td>
                      <td className="px-4 py-2.5 font-normal text-slate-600">{z.code || '-'}</td>
                      <td className="px-4 py-2.5 font-normal text-slate-500">{z.description || '-'}</td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditZone(z)}
                            className="w-6 h-6 rounded-xs bg-[#323f4b] hover:bg-[#242d35] text-white flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteZone(z)}
                            className="w-6 h-6 rounded-xs bg-[#b91c1c] hover:bg-[#991b1b] text-white flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="py-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500">
              <div className="inline-flex items-center rounded border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <button className="px-2.5 py-1 text-slate-400 hover:bg-slate-50 cursor-not-allowed">«</button>
                <button className="px-3 py-1 bg-[#323f4b] text-white font-bold text-xs">1</button>
                <button className="px-2.5 py-1 text-slate-400 hover:bg-slate-50 cursor-not-allowed">»</button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            TAB 3: AISLES CONTENT
            =================================================================== */}
        {activeTab === 'aisles' && (
          <div>
            <div className="p-3 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
              <div className="w-full sm:w-72 relative">
                <input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 bg-white border border-slate-300 rounded-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              <button
                onClick={() => {
                  setAisleName('');
                  setAisleCode('');
                  setAisleDescription('');
                  setIsNewAisleOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-sm bg-[#323f4b] hover:bg-[#242d35] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs active:scale-98 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-slate-700 font-semibold text-[11.5px]">
                    <th onClick={() => handleSortZA('id')} className="px-4 py-2.5 cursor-pointer hover:bg-slate-50 w-16">
                      <div className="flex items-center gap-1">
                        <span>#</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th onClick={() => handleSortZA('name')} className="px-4 py-2.5 cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        <span>Name</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th onClick={() => handleSortZA('code')} className="px-4 py-2.5 cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        <span>Code</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th onClick={() => handleSortZA('description')} className="px-4 py-2.5 cursor-pointer hover:bg-slate-50">
                      <div className="flex items-center gap-1">
                        <span>Description</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-4 py-2.5 text-right w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAisles.map((a, idx) => (
                    <tr key={a.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}>
                      <td className="px-4 py-2.5 font-normal text-slate-800">{a.id}</td>
                      <td className="px-4 py-2.5 font-normal text-slate-800">{a.name}</td>
                      <td className="px-4 py-2.5 font-normal text-slate-600">{a.code || '-'}</td>
                      <td className="px-4 py-2.5 font-normal text-slate-500">{a.description || '-'}</td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditAisle(a)}
                            className="w-6 h-6 rounded-xs bg-[#323f4b] hover:bg-[#242d35] text-white flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteAisle(a)}
                            className="w-6 h-6 rounded-xs bg-[#b91c1c] hover:bg-[#991b1b] text-white flex items-center justify-center cursor-pointer shadow-2xs"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="py-4 border-t border-slate-100 flex items-center justify-center text-xs text-slate-500">
              <div className="inline-flex items-center rounded border border-slate-200 overflow-hidden bg-white shadow-2xs">
                <button className="px-2.5 py-1 text-slate-400 hover:bg-slate-50 cursor-not-allowed">«</button>
                <button className="px-3 py-1 bg-[#323f4b] text-white font-bold text-xs">1</button>
                <button className="px-2.5 py-1 text-slate-400 hover:bg-slate-50 cursor-not-allowed">»</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 p-2 rounded bg-white text-[#195a96] border border-slate-200 shadow-md hover:bg-blue-50 transition-all z-30 cursor-pointer"
        title="Scroll to Top"
      >
        <ChevronsUp className="w-5 h-5" />
      </button>

      {/* =======================================================================
          MODAL 1: NEW LOCATION (Matching Screenshot 3)
          ======================================================================= */}
      {isNewLocationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-xl rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-[17px] font-normal text-slate-800">New Location</h2>
              <button
                onClick={() => setIsNewLocationOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveNewLocation} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Location Description *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newLocationDescription}
                    onChange={(e) => setNewLocationDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-blue-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Accounting Dep.
                  </label>
                  <input
                    type="text"
                    value={newLocationAcc}
                    onChange={(e) => setNewLocationAcc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-[#323f4b] hover:bg-[#242d35] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 2: EDIT LOCATION (Matching Screenshot 4)
          ======================================================================= */}
      {isEditLocationOpen && editingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-xl rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-[17px] font-normal text-slate-800">Edit Location</h2>
              <button
                onClick={() => setIsEditLocationOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateLocation} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-2">
                  <label className="block text-slate-700 font-medium mb-1">
                    ID
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editLocationId}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-[#e9ecef] text-slate-600 font-mono select-none cursor-not-allowed"
                  />
                </div>

                <div className="col-span-5">
                  <label className="block text-slate-700 font-medium mb-1">
                    Location Description *
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={editLocationDescription}
                    onChange={(e) => setEditLocationDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-blue-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>

                <div className="col-span-5">
                  <label className="block text-slate-700 font-medium mb-1">
                    Accounting Dept.
                  </label>
                  <input
                    type="text"
                    value={editLocationAcc}
                    onChange={(e) => setEditLocationAcc(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-[#323f4b] hover:bg-[#242d35] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 3: MERGE LOCATIONS (Matching Screenshot 1)
          ======================================================================= */}
      {isMergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-2xl rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-[17px] font-normal text-slate-800">Merge Locations</h2>
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    From Location
                  </label>
                  <select
                    value={fromLocationId}
                    onChange={(e) => setFromLocationId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  >
                    <option value="">Select From Location</option>
                    {locations.map((loc) => (
                      <option key={loc.LOCATIONID} value={loc.LOCATIONID}>
                        {loc.LOCATIONDESCRIPTION}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    To Location
                  </label>
                  <select
                    value={toLocationId}
                    onChange={(e) => setToLocationId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
                  >
                    <option value="">Select To Location</option>
                    {locations.map((loc) => (
                      <option key={loc.LOCATIONID} value={loc.LOCATIONID}>
                        {loc.LOCATIONDESCRIPTION}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleInitiateMerge}
                  disabled={!fromLocationId || !toLocationId}
                  className="px-4 py-2 rounded-sm bg-[#6c757d] hover:bg-[#5a6268] disabled:opacity-50 text-white font-semibold text-xs shadow-xs cursor-pointer transition"
                >
                  Merge Locations
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 4: MERGE WARNING DIALOG (Matching Screenshot 2 Pixel-by-Pixel)
          ======================================================================= */}
      {isMergeWarningOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xs animate-fade-in"
          style={{ zIndex: 99999 }}
        >
          <div
            className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-lg rounded-sm overflow-hidden relative"
            style={{ zIndex: 100000 }}
          >
            {/* Dark Header matching Screenshot 2 */}
            <div className="px-4 py-3 bg-[#1e1e1e] text-white flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wide">
                WARNING! THIS ACTION CANNOT BE RECOVERED ONCE EXECUTED.
              </h3>
              <button
                onClick={() => setIsMergeWarningOpen(false)}
                className="text-slate-400 hover:text-white text-base leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Warning Body matching Screenshot 2 */}
            <div className="p-5 space-y-3 text-xs text-slate-700 bg-white">
              <p className="leading-relaxed">
                All item transactions will be transferred to the destination location and the source destination will be deleted.
              </p>
              <p className="font-semibold text-slate-800">
                Are you sure you like to merge these 2 locations?
              </p>
              <p className="text-slate-800">
                If yes please type: <span className="font-mono font-bold text-slate-900">MERGE LOCATIONS</span>
              </p>

              {/* Text Input Box matching Screenshot 2 */}
              <div className="pt-2">
                <input
                  type="text"
                  autoFocus
                  value={mergeConfirmationInput}
                  onChange={(e) => setMergeConfirmationInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-sm border border-blue-400 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                  placeholder=""
                />
              </div>

              {/* Footer Buttons matching Screenshot 2 */}
              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMergeWarningOpen(false)}
                  className="px-3.5 py-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMerge}
                  disabled={mergeConfirmationInput !== 'MERGE LOCATIONS'}
                  className="px-4 py-1.5 rounded-sm bg-[#4b5563] hover:bg-[#374151] disabled:opacity-40 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 5: NEW & EDIT ZONE
          ======================================================================= */}
      {(isNewZoneOpen || isEditZoneOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-lg rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-[17px] font-normal text-slate-800">
                {isEditZoneOpen ? 'Edit Zone' : 'New Zone'}
              </h2>
              <button
                onClick={() => {
                  setIsNewZoneOpen(false);
                  setIsEditZoneOpen(false);
                }}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={isEditZoneOpen ? handleUpdateZone : handleSaveNewZone} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Code</label>
                <input
                  type="text"
                  value={zoneCode}
                  onChange={(e) => setZoneCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={zoneDescription}
                  onChange={(e) => setZoneDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-[#323f4b] hover:bg-[#242d35] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODAL 6: NEW & EDIT AISLE
          ======================================================================= */}
      {(isNewAisleOpen || isEditAisleOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white border border-slate-300 w-full text-slate-800 shadow-2xl max-w-lg rounded-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
              <h2 className="text-[17px] font-normal text-slate-800">
                {isEditAisleOpen ? 'Edit Aisle' : 'New Aisle'}
              </h2>
              <button
                onClick={() => {
                  setIsNewAisleOpen(false);
                  setIsEditAisleOpen(false);
                }}
                className="text-slate-400 hover:text-slate-700 text-lg leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={isEditAisleOpen ? handleUpdateAisle : handleSaveNewAisle} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={aisleName}
                  onChange={(e) => setAisleName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Code</label>
                <input
                  type="text"
                  value={aisleCode}
                  onChange={(e) => setAisleCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={aisleDescription}
                  onChange={(e) => setAisleDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-sm border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-sm bg-[#323f4b] hover:bg-[#242d35] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
