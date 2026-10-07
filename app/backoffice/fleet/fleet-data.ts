// ============================================================================
// SUPERSONIC FLEET & 3PL REGISTRY DATASET - PART 1
// TENANT: Southern Olive Oil Products S.A.R.L (00001)
// ============================================================================

export type FleetSection = 
  | 'COMBINED_DISPATCH' 
  | 'SOUTHERN_OLIVE_ORDERS' 
  | 'SUPERSONIC_3PL_ORDERS' 
  | 'SETTLEMENTS' 
  | 'LIVE_RADAR' 
  | 'POD_ARCHIVES' 
  | 'VEHICLES_LOG'
  | 'EMPLOYEES'
  | 'COMPLAINTS_REVIEWS'
  | 'VENDOR_ACCOUNTING';

export type VehicleCategory = 'VAN' | 'CAR' | 'MOTORCYCLE';

export interface CorridorRoute {
  id: number;
  name: string;
  schedule: string;
  highwayPath: string;
  activeOrdersCount: number;
  driver?: string;
}

export interface DispatchedOrder {
  id: string;
  orderNo: string;
  sourceType: 'SOUTHERN_OLIVE' | 'EXTERNAL_3PL';
  customerName: string;
  phone: string;
  corridorId: number;
  tripNo: number;
  destinationTown: string;
  addressDetails: string;
  driverNotes?: string;
  items: string;
  productAmountLbp: number;
  productAmountUsd: number;
  deliveryFeeUsd: number;
  assignedDriver: string;
  vehiclePlate: string;
  status: 'QUEUED' | 'ON_ROUTE' | 'DELIVERED' | 'REJECTED' | 'PENDING' | 'MOVED_TO_POS_PICKUP';
  repName?: string;
  deliveredAt?: string;
  signatureSvg?: string;
  fulfillmentSwitchedBy?: {
    actorType: 'MANAGEMENT' | 'REPRESENTATIVE';
    actorCode: string;
    actorName: string;
    timestamp: string;
  };
}

export interface FleetVehicle {
  plate: string;
  category: VehicleCategory;
  model: string;
  driver: string;
  phone: string;
  assignedCorridor: number;
  status: 'ON_DUTY' | 'ON_ROUTE' | 'DELIVERING' | 'RETURNING' | 'OFF_DUTY';
  startKm: number;
  currentKm: number;
  reconciliationClosed: boolean;
  batteryPercent: number;
  currentSpeedKmH: number;
  currentLocationName: string;
  gpsCoords: string;
  stopsDelivered: number;
  stopsTotal: number;
  ownership: 'COMPANY_OWNED' | 'DRIVER_OWN_VEHICLE';
  offDutyPin?: string;
}

export interface SuperSonicVendor {
  id: string;
  vendorName: string;
  contactPerson: string;
  phone: string;
  businessType: string;
  settlementTerms: 'DAILY_CASH' | 'WEEKLY_SETTLEMENT' | 'AFTER_DELIVERY_PAYOUT';
  currentCodBalanceUsd: number;
  unpaidDeliveryFeesUsd: number;
  status: 'ACTIVE' | 'ON_HOLD';
  ordersCount?: number;
  merchantName?: string;
}

export interface StaffMember {
  id: string;
  fullName: string;
  role: string;
  type: 'DRIVER' | 'ON_SITE';
  phone: string;
  assignedAsset: string;
  compensationModel: string;
  salaryOrRate: string;
  ownershipStatus: 'COMPANY_FLEET' | 'OWN_VEHICLE' | 'N/A_ON_SITE';
}

export interface CustomerComplaintTicket {
  id: string;
  orderNo: string;
  customerName: string;
  phone: string;
  driverName: string;
  category: 'LATE_DELIVERY' | 'DAMAGED_PACKAGE' | 'RUDE_COURIER' | 'PAYMENT_ISSUE';
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
  reportedAt: string;
  sourceType: 'SOUTHERN_OLIVE' | 'EXTERNAL_3PL';
  resolutionNotes?: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  type: 'DELIVERY_REVENUE' | 'VAULT_COD' | 'WHISH_DEPOSIT' | 'FUEL_EXPENSE' | 'VENDOR_PAYOUT' | 'DRIVER_SETTLEMENT';
  amountUsd: number;
  amountLbp?: number;
  account: string;
  voucherNo?: string;
  driverName?: string;
  recipient?: string;
  status?: 'COMPLETED' | 'PENDING' | 'RECONCILED';
}

// 1. THE 5 STRATEGIC LEBANESE HIGHWAY CORRIDORS
export const initialCorridors: CorridorRoute[] = [
  { id: 1, name: 'Corridor 1: Beirut & Suburbs (Hamra, Dahieh, Achrafieh, Metn Coast)', schedule: 'Daily', highwayPath: 'SuperSonic Central Hub (Choueifat) ➔ Khalde ➔ Hadath / Baabda / Dahieh ➔ Beirut City (Hamra, Verdun, Achrafieh) ➔ Metn Coast (Sin El Fil, Dekwaneh, Jdeideh, Jal El Dib)', activeOrdersCount: 14, driver: 'Tony Khoury' },
  { id: 2, name: 'Corridor 2: Mount Lebanon (Aley, Chouf, Bhamdoun, Jounieh)', schedule: 'Daily / Near-Daily', highwayPath: 'SuperSonic Central Hub (Choueifat) ➔ Aramoun / Bchamoun / Qabr Chmoun ➔ Aley / Bhamdoun / Sofar ➔ Upper Chouf (Deir El Qamar, Beiteddine, Baakline) ➔ Keserwan / Jounieh', activeOrdersCount: 9, driver: 'Fadi Abou Assi' },
  { id: 3, name: 'Corridor 3: South Lebanon (Saida, Tyre, Nabatieh)', schedule: 'Daily', highwayPath: 'Chouf Coast (Damour, Jiyeh) ➔ Saida (Riad El Solh, Qayaa) ➔ Tyre (Sour) ➔ Nabatieh ➔ Zahrani / Jezzine', activeOrdersCount: 12, driver: 'Hassan Sleiman' },
  { id: 4, name: 'Corridor 4: North Lebanon (Tripoli, Batroun, Koura)', schedule: '3-4 times/week', highwayPath: 'Antelias / Dbayeh ➔ Jbeil (Byblos) ➔ Batroun ➔ Koura ➔ Tripoli Mina / Tall ➔ Zgharta / Akkar', activeOrdersCount: 8, driver: 'Charbel Rahme' },
  { id: 5, name: 'Corridor 5: Bekaa (Zahle, Chtaura, Baalbek)', schedule: '2-3 times/week', highwayPath: 'Damascus Road (Sofar - Dahr El Baidar) ➔ Chtaura / Zahle ➔ West Bekaa (Joub Jannine) ➔ Rayak ➔ Baalbek / Hermel', activeOrdersCount: 6, driver: 'Elie Matar' },
];

// 2. FLEET VEHICLES (COMPANY-OWNED VS DRIVER-OWNED)
export const initialVehicles: FleetVehicle[] = [
  { plate: 'B-492102', category: 'VAN', model: 'Toyota HiAce High Roof (Van 01)', driver: 'Tony Khoury', phone: '03-112233', assignedCorridor: 1, status: 'ON_ROUTE', startKm: 142050, currentKm: 142165, reconciliationClosed: true, batteryPercent: 88, currentSpeedKmH: 48, currentLocationName: 'Beirut - Hamra Main Axis', gpsCoords: '33.8938° N, 35.4802° E', stopsDelivered: 6, stopsTotal: 8, ownership: 'COMPANY_OWNED' },
  { plate: 'G-183921', category: 'VAN', model: 'Hyundai H1 Cargo (Van 02)', driver: 'Fadi Abou Assi', phone: '03-445566', assignedCorridor: 2, status: 'DELIVERING', startKm: 88400, currentKm: 88480, reconciliationClosed: true, batteryPercent: 64, currentSpeedKmH: 20, currentLocationName: 'Aley - Roundabout Center', gpsCoords: '33.7821° N, 35.5901° E', stopsDelivered: 4, stopsTotal: 6, ownership: 'COMPANY_OWNED' },
  { plate: 'S-772910', category: 'CAR', model: 'Renault Duster 4x4 (Car 01)', driver: 'Hassan Sleiman', phone: '03-778899', assignedCorridor: 3, status: 'ON_ROUTE', startKm: 65120, currentKm: 65205, reconciliationClosed: true, batteryPercent: 92, currentSpeedKmH: 62, currentLocationName: 'Saida - Riad El Solh Highway', gpsCoords: '33.5590° N, 35.3725° E', stopsDelivered: 5, stopsTotal: 7, ownership: 'COMPANY_OWNED' },
  { plate: 'M-102941', category: 'MOTORCYCLE', model: 'Honda Cargo 250 (Moto 01)', driver: 'Ahmad Zein', phone: '03-990011', assignedCorridor: 1, status: 'ON_ROUTE', startKm: 12400, currentKm: 12460, reconciliationClosed: true, batteryPercent: 78, currentSpeedKmH: 35, currentLocationName: 'Dahieh - Hadi Nasrallah', gpsCoords: '33.8540° N, 35.5090° E', stopsDelivered: 3, stopsTotal: 4, ownership: 'DRIVER_OWN_VEHICLE' },
  { plate: 'B-310928', category: 'VAN', model: 'Toyota HiAce Medium (Van 03)', driver: 'Elie Matar', phone: '03-223344', assignedCorridor: 5, status: 'OFF_DUTY', startKm: 110200, currentKm: 110290, reconciliationClosed: false, batteryPercent: 95, currentSpeedKmH: 0, currentLocationName: 'Chtaura - Square Pin', gpsCoords: '33.8210° N, 35.8520° E', stopsDelivered: 0, stopsTotal: 0, ownership: 'COMPANY_OWNED', offDutyPin: 'Chtaura Square Pin (33.821° N, 35.852° E)' },
];

// 3. ORDERS (SOUTHERN OLIVE IN-HOUSE + EXTERNAL 3PL) WITH 89,500 LBP CONVERSION
export const initialOrders: DispatchedOrder[] = [];
export const initialVendors: SuperSonicVendor[] = [];
export const initialStaff: StaffMember[] = [];
export const initialComplaints: CustomerComplaintTicket[] = [];
export const initialLedger: LedgerEntry[] = [];
