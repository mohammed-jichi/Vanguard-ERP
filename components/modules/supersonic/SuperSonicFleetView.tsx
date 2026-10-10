'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useTenant } from '@/lib/TenantContext';
import { toast } from '@/lib/toast';
import { 
  Truck, Users, Fuel, Wrench, Plus, Search, 
  Map, Activity, AlertCircle, Phone, Calendar
} from 'lucide-react';

interface FuelType { id: string; name: string; unit_price: number; }
interface Driver { id: string; full_name: string; phone: string; license_number: string; driver_type: string; status: string; }
interface Vehicle { id: string; plate_number: string; vehicle_model: string; fuel_type_id: string; default_driver_id: string; current_odometer: number; status: string; }
interface FuelLog { id: string; vehicle_id: string; driver_id: string; liters_filled: number; total_cost: number; odometer_at_fill: number; log_date: string; }
interface MileageLog { id: string; vehicle_id: string; driver_id: string; date: string; start_km: number; end_km: number; total_km: number; business_km: number; personal_km: number; }
interface MaintenanceRecord { id: string; vehicle_id: string; work_order_no: string; service_type: string; part_name: string; cost: number; odometer: number; status: string; performed_date: string; }

export function SuperSonicFleetView() {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?.id || 'default-tenant';

  const [activeTab, setActiveTab] = useState<'fleet' | 'drivers' | 'logs' | 'maintenance'>('fleet');
  const [loading, setLoading] = useState(true);

  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [mileageLogs, setMileageLogs] = useState<MileageLog[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);

  // Modals
  const [showFuelTypeModal, setShowFuelTypeModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showFuelLogModal, setShowFuelLogModal] = useState(false);
  const [showMileageLogModal, setShowMileageLogModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // Forms
  const [newFuelType, setNewFuelType] = useState({ name: '', unit_price: 0 });
  const [newDriver, setNewDriver] = useState({ full_name: '', phone: '', license_number: '', driver_type: 'general', status: 'active' });
  const [newVehicle, setNewVehicle] = useState({ plate_number: '', vehicle_model: '', fuel_type_id: '', default_driver_id: '', current_odometer: 0, status: 'active' });
  const [newFuelLog, setNewFuelLog] = useState({ vehicle_id: '', driver_id: '', fuel_type_id: '', liters_filled: 0, total_cost: 0, odometer_at_fill: 0, notes: '', log_date: new Date().toISOString().split('T')[0] });
  const [newMileageLog, setNewMileageLog] = useState({ vehicle_id: '', driver_id: '', date: new Date().toISOString().split('T')[0], start_km: 0, end_km: 0, total_km: 0, business_km: 0, personal_km: 0 });
  const [newMaintenance, setNewMaintenance] = useState({ vehicle_id: '', work_order_no: '', service_type: 'repair', part_name: '', cost: 0, odometer: 0, status: 'completed', performed_date: new Date().toISOString().split('T')[0] });

  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fRes, dRes, vRes, flRes, mRes, mtRes] = await Promise.all([
        supabase.from('fleet_fuel_types').select('*').eq('tenant_id', tenantId),
        supabase.from('fleet_drivers').select('*').eq('tenant_id', tenantId),
        supabase.from('fleet_vehicles').select('*').eq('tenant_id', tenantId),
        supabase.from('fleet_fuel_logs').select('*').eq('tenant_id', tenantId).order('log_date', { ascending: false }),
        supabase.from('fleet_mileage_logs').select('*').eq('tenant_id', tenantId).order('date', { ascending: false }),
        supabase.from('fleet_maintenance_records').select('*').eq('tenant_id', tenantId).order('performed_date', { ascending: false })
      ]);
      if (fRes.data) setFuelTypes(fRes.data);
      if (dRes.data) setDrivers(dRes.data);
      if (vRes.data) setVehicles(vRes.data);
      if (flRes.data) setFuelLogs(flRes.data);
      if (mRes.data) setMileageLogs(mRes.data);
      if (mtRes.data) setMaintenance(mtRes.data);
    } catch (err: any) {
      toast.error('Failed to load fleet data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (tenantId) fetchData(); }, [tenantId]);

  const handleAddFuelType = async () => {
    if (!newFuelType.name) return toast.error('Fuel type name required');
    const { data, error } = await supabase.from('fleet_fuel_types').insert([{ ...newFuelType, tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setFuelTypes([...fuelTypes, data]);
    setShowFuelTypeModal(false); setNewFuelType({ name: '', unit_price: 0 });
    toast.success('Fuel type added');
  };

  const handleAddDriver = async () => {
    if (!newDriver.full_name) return toast.error('Driver name required');
    const { data, error } = await supabase.from('fleet_drivers').insert([{ ...newDriver, tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setDrivers([...drivers, data]);
    setShowDriverModal(false); setNewDriver({ full_name: '', phone: '', license_number: '', driver_type: 'general', status: 'active' });
    toast.success('Driver added');
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.plate_number || !newVehicle.vehicle_model) return toast.error('Plate and Model required');
    const { data, error } = await supabase.from('fleet_vehicles').insert([{ ...newVehicle, tenant_id: tenantId }]).select().single();
    if (error) return toast.error(error.message);
    setVehicles([...vehicles, data]);
    setShowVehicleModal(false); setNewVehicle({ plate_number: '', vehicle_model: '', fuel_type_id: '', default_driver_id: '', current_odometer: 0, status: 'active' });
    toast.success('Vehicle added');
  };

  const handleAddFuelLog = async () => {
    if (!newFuelLog.vehicle_id || !newFuelLog.liters_filled) return toast.error('Vehicle and Liters required');
    
    try {
      const { data, error } = await supabase.from('fleet_fuel_logs').insert([{ ...newFuelLog, tenant_id: tenantId }]).select().single();
      if (error) throw error;
      
      // Update vehicle odometer
      await supabase.from('fleet_vehicles').update({ current_odometer: newFuelLog.odometer_at_fill }).eq('id', newFuelLog.vehicle_id);
      
      setFuelLogs([data, ...fuelLogs]);
      setVehicles(vehicles.map(v => v.id === newFuelLog.vehicle_id ? { ...v, current_odometer: newFuelLog.odometer_at_fill } : v));
      
      setShowFuelLogModal(false); 
      setNewFuelLog({ vehicle_id: '', driver_id: '', fuel_type_id: '', liters_filled: 0, total_cost: 0, odometer_at_fill: 0, notes: '', log_date: new Date().toISOString().split('T')[0] });
      toast.success('Fuel log recorded');
    } catch(e:any) { toast.error(e.message); }
  };

  const handleAddMileageLog = async () => {
    if (!newMileageLog.vehicle_id || newMileageLog.start_km >= newMileageLog.end_km) return toast.error('Invalid KM readings');
    const total_km = newMileageLog.end_km - newMileageLog.start_km;
    
    try {
      const { data, error } = await supabase.from('fleet_mileage_logs').insert([{ ...newMileageLog, total_km, tenant_id: tenantId }]).select().single();
      if (error) throw error;
      
      // Update vehicle odometer
      await supabase.from('fleet_vehicles').update({ current_odometer: newMileageLog.end_km }).eq('id', newMileageLog.vehicle_id);
      
      setMileageLogs([data, ...mileageLogs]);
      setVehicles(vehicles.map(v => v.id === newMileageLog.vehicle_id ? { ...v, current_odometer: newMileageLog.end_km } : v));
      
      setShowMileageLogModal(false);
      setNewMileageLog({ vehicle_id: '', driver_id: '', date: new Date().toISOString().split('T')[0], start_km: 0, end_km: 0, total_km: 0, business_km: 0, personal_km: 0 });
      toast.success('Mileage log recorded');
    } catch(e:any) { toast.error(e.message); }
  };

  const handleAddMaintenance = async () => {
    if (!newMaintenance.vehicle_id || !newMaintenance.part_name) return toast.error('Vehicle and Part Name required');
    try {
      const { data, error } = await supabase.from('fleet_maintenance_records').insert([{ ...newMaintenance, tenant_id: tenantId }]).select().single();
      if (error) throw error;
      setMaintenance([data, ...maintenance]);
      setShowMaintenanceModal(false);
      setNewMaintenance({ vehicle_id: '', work_order_no: '', service_type: 'repair', part_name: '', cost: 0, odometer: 0, status: 'completed', performed_date: new Date().toISOString().split('T')[0] });
      toast.success('Maintenance record added');
    } catch(e:any) { toast.error(e.message); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-indigo-600" />
            Super Sonic Fleet
          </h1>
          <p className="text-sm text-slate-500 mt-1">Dynamic management of vehicles, drivers, fuel, and maintenance.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-max">
        {[
          { id: 'fleet', label: 'Fleet Overview', icon: Truck },
          { id: 'drivers', label: 'Drivers Directory', icon: Users },
          { id: 'logs', label: 'Fuel & Mileage Logs', icon: Fuel },
          { id: 'maintenance', label: 'Maintenance & Parts', icon: Wrench },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-500">Loading fleet data...</div>
        ) : (
          <>
            {/* FLEET OVERVIEW */}
            {activeTab === 'fleet' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-full md:w-72">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input type="text" placeholder="Search vehicles..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowFuelTypeModal(true)} className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 flex items-center gap-2">
                      <Fuel className="w-4 h-4" /> Add Fuel Type
                    </button>
                    <button onClick={() => setShowVehicleModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Register Vehicle
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.length === 0 && <div className="col-span-full py-8 text-center text-slate-500">No vehicles registered.</div>}
                  {vehicles.filter(v => v.plate_number.includes(search) || v.vehicle_model.toLowerCase().includes(search.toLowerCase())).map(v => {
                    const fuel = fuelTypes.find(f => f.id === v.fuel_type_id);
                    const driver = drivers.find(d => d.id === v.default_driver_id);
                    return (
                      <div key={v.id} className="border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-900 text-lg">{v.plate_number}</span>
                          <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${v.status === 'active' ? 'bg-emerald-100 text-emerald-700' : v.status === 'maintenance' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                            {v.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-4">{v.vehicle_model}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 flex items-center gap-1"><Users className="w-4 h-4"/> Driver:</span>
                            <span className="font-medium text-slate-900">{driver?.full_name || 'Unassigned'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 flex items-center gap-1"><Fuel className="w-4 h-4"/> Fuel:</span>
                            <span className="font-medium text-slate-900">{fuel?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 flex items-center gap-1"><Activity className="w-4 h-4"/> Odo:</span>
                            <span className="font-bold text-indigo-600">{v.current_odometer.toLocaleString()} KM</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* DRIVERS DIRECTORY */}
            {activeTab === 'drivers' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Drivers Directory</h2>
                  <button onClick={() => setShowDriverModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Driver
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="py-3 px-4 font-medium">Name</th>
                        <th className="py-3 px-4 font-medium">License No</th>
                        <th className="py-3 px-4 font-medium">Phone</th>
                        <th className="py-3 px-4 font-medium">Role</th>
                        <th className="py-3 px-4 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {drivers.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-500">No drivers registered.</td></tr>}
                      {drivers.map(d => (
                        <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium text-slate-900">{d.full_name}</td>
                          <td className="py-3 px-4 text-slate-600 font-mono">{d.license_number || '-'}</td>
                          <td className="py-3 px-4 text-indigo-600 flex items-center gap-2">
                            {d.phone ? <><Phone className="w-3 h-3" /> {d.phone}</> : '-'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 capitalize">{d.driver_type}</td>
                          <td className="py-3 px-4 text-center">
                            {d.status === 'active' ? <span className="inline-flex px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium">Active</span> : <span className="inline-flex px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">On Leave</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LOGS */}
            {activeTab === 'logs' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Fuel & Mileage Logs</h2>
                  <div className="flex gap-2">
                    <button onClick={() => setShowFuelLogModal(true)} className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 flex items-center gap-2">
                      <Fuel className="w-4 h-4" /> Log Refill
                    </button>
                    <button onClick={() => setShowMileageLogModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                      <Map className="w-4 h-4" /> Log Mileage
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-4 border-b pb-2">Recent Mileage</h3>
                    <div className="space-y-3">
                      {mileageLogs.length === 0 && <p className="text-sm text-slate-500">No mileage logged.</p>}
                      {mileageLogs.slice(0, 10).map(m => {
                        const v = vehicles.find(x => x.id === m.vehicle_id);
                        return (
                          <div key={m.id} className="p-3 border border-slate-200 rounded-lg shadow-sm text-sm">
                            <div className="flex justify-between font-bold text-slate-800 mb-1">
                              <span>{v?.plate_number}</span>
                              <span className="text-indigo-600">{m.total_km} KM</span>
                            </div>
                            <div className="text-slate-500 text-xs flex justify-between">
                              <span>Date: {m.date}</span>
                              <span>{m.start_km} &rarr; {m.end_km}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-700 mb-4 border-b pb-2">Recent Fuel Refills</h3>
                    <div className="space-y-3">
                      {fuelLogs.length === 0 && <p className="text-sm text-slate-500">No fuel logged.</p>}
                      {fuelLogs.slice(0, 10).map(f => {
                        const v = vehicles.find(x => x.id === f.vehicle_id);
                        return (
                          <div key={f.id} className="p-3 border border-slate-200 rounded-lg shadow-sm text-sm">
                            <div className="flex justify-between font-bold text-slate-800 mb-1">
                              <span>{v?.plate_number}</span>
                              <span className="text-rose-600">${f.total_cost}</span>
                            </div>
                            <div className="text-slate-500 text-xs flex justify-between">
                              <span>{f.liters_filled} Liters</span>
                              <span>Odo: {f.odometer_at_fill}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MAINTENANCE */}
            {activeTab === 'maintenance' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-slate-800">Maintenance & Parts Records</h2>
                  <button onClick={() => setShowMaintenanceModal(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Log Maintenance
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="py-3 px-4 font-medium">Date</th>
                        <th className="py-3 px-4 font-medium">Vehicle</th>
                        <th className="py-3 px-4 font-medium">Service / Part</th>
                        <th className="py-3 px-4 font-medium">Cost</th>
                        <th className="py-3 px-4 font-medium text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {maintenance.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-500">No maintenance records found.</td></tr>}
                      {maintenance.map(m => {
                        const v = vehicles.find(x => x.id === m.vehicle_id);
                        return (
                          <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-4 text-slate-600">{m.performed_date}</td>
                            <td className="py-3 px-4 font-medium text-slate-900">{v?.plate_number}</td>
                            <td className="py-3 px-4">
                              <span className="font-semibold text-slate-800 capitalize">{m.service_type}</span>
                              {m.part_name && <div className="text-xs text-slate-500">Part: {m.part_name}</div>}
                            </td>
                            <td className="py-3 px-4 text-slate-800 font-medium">${m.cost}</td>
                            <td className="py-3 px-4 text-center">
                              {m.status === 'completed' ? <span className="inline-flex px-2 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium">Completed</span> : <span className="inline-flex px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-medium">Scheduled</span>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALS */}
      
      {/* Fuel Type Modal */}
      {showFuelTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Fuel Type</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" value={newFuelType.name} onChange={e => setNewFuelType({...newFuelType, name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Diesel, Petrol 95, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price ($)</label>
                <input type="number" value={newFuelType.unit_price} onChange={e => setNewFuelType({...newFuelType, unit_price: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" step="0.01" min="0" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowFuelTypeModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddFuelType} className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Modal */}
      {showDriverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Driver</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" value={newDriver.full_name} onChange={e => setNewDriver({...newDriver, full_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input type="text" value={newDriver.phone} onChange={e => setNewDriver({...newDriver, phone: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">License No</label>
                <input type="text" value={newDriver.license_number} onChange={e => setNewDriver({...newDriver, license_number: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select value={newDriver.driver_type} onChange={e => setNewDriver({...newDriver, driver_type: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="general">General</option>
                  <option value="sales">Sales (Preseller)</option>
                  <option value="supply">Supply (Trucking)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowDriverModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddDriver} className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Register Vehicle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plate Number</label>
                <input type="text" value={newVehicle.plate_number} onChange={e => setNewVehicle({...newVehicle, plate_number: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 uppercase" placeholder="ABC-1234" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle Model</label>
                <input type="text" value={newVehicle.vehicle_model} onChange={e => setNewVehicle({...newVehicle, vehicle_model: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Ford Transit 2022" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fuel Type</label>
                <select value={newVehicle.fuel_type_id} onChange={e => setNewVehicle({...newVehicle, fuel_type_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">Select Fuel...</option>
                  {fuelTypes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Default Driver</label>
                <select value={newVehicle.default_driver_id} onChange={e => setNewVehicle({...newVehicle, default_driver_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">Unassigned</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Odometer (KM)</label>
                <input type="number" value={newVehicle.current_odometer} onChange={e => setNewVehicle({...newVehicle, current_odometer: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" min="0" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowVehicleModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddVehicle} className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Register</button>
            </div>
          </div>
        </div>
      )}

      {/* Mileage Log Modal */}
      {showMileageLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Log Mileage / Trip</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
                <select value={newMileageLog.vehicle_id} onChange={e => setNewMileageLog({...newMileageLog, vehicle_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">Select Vehicle...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start KM</label>
                  <input type="number" value={newMileageLog.start_km} onChange={e => setNewMileageLog({...newMileageLog, start_km: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" min="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End KM</label>
                  <input type="number" value={newMileageLog.end_km} onChange={e => setNewMileageLog({...newMileageLog, end_km: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" min="0" />
                </div>
              </div>
              {newMileageLog.end_km > newMileageLog.start_km && (
                <div className="p-3 bg-indigo-50 text-indigo-800 text-sm font-bold rounded-lg text-center">
                  Total Trip: {newMileageLog.end_km - newMileageLog.start_km} KM
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowMileageLogModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddMileageLog} className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save Log</button>
            </div>
          </div>
        </div>
      )}

      {/* Fuel Log Modal */}
      {showFuelLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Log Fuel Refill</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
                <select value={newFuelLog.vehicle_id} onChange={e => {
                  const v = vehicles.find(x => x.id === e.target.value);
                  setNewFuelLog({...newFuelLog, vehicle_id: e.target.value, fuel_type_id: v?.fuel_type_id || '', odometer_at_fill: v?.current_odometer || 0});
                }} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">Select Vehicle...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Liters Filled</label>
                  <input type="number" value={newFuelLog.liters_filled} onChange={e => setNewFuelLog({...newFuelLog, liters_filled: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" min="0" step="0.1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Cost ($)</label>
                  <input type="number" value={newFuelLog.total_cost} onChange={e => setNewFuelLog({...newFuelLog, total_cost: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" min="0" step="0.01" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Odometer at Fill</label>
                <input type="number" value={newFuelLog.odometer_at_fill} onChange={e => setNewFuelLog({...newFuelLog, odometer_at_fill: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" min="0" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowFuelLogModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddFuelLog} className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save Log</button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Log Maintenance & Parts</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
                <select value={newMaintenance.vehicle_id} onChange={e => {
                  const v = vehicles.find(x => x.id === e.target.value);
                  setNewMaintenance({...newMaintenance, vehicle_id: e.target.value, odometer: v?.current_odometer || 0});
                }} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">Select Vehicle...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate_number}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
                  <select value={newMaintenance.service_type} onChange={e => setNewMaintenance({...newMaintenance, service_type: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    <option value="repair">Repair</option>
                    <option value="oil_change">Oil Change</option>
                    <option value="tire_replacement">Tire Replacement</option>
                    <option value="inspection">Inspection</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cost ($)</label>
                  <input type="number" value={newMaintenance.cost} onChange={e => setNewMaintenance({...newMaintenance, cost: Number(e.target.value)})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" min="0" step="0.01" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dynamic Part Name / Work Done</label>
                <input type="text" value={newMaintenance.part_name} onChange={e => setNewMaintenance({...newMaintenance, part_name: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Brake Pads, Filter" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowMaintenanceModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleAddMaintenance} className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Save Record</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
