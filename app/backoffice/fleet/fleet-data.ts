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
  type: 'DELIVERY_REVENUE' | 'VAULT_COD' | 'WHISH_DEPOSIT' | 'FUEL_EXPENSE' | 'VENDOR_PAYOUT';
  amountUsd: number;
  account: string;
}

// 1. THE 7 STRATEGIC HIGHWAY CORRIDORS
export const initialCorridors: CorridorRoute[] = [
  { id: 1, name: 'Corridor 1: Greater Beirut & Connected Coast', schedule: 'Daily', highwayPath: 'SuperSonic Central Hub (Choueifat) ➔ Khalde ➔ Hadath / Baabda / Dahieh ➔ Beirut City ➔ Metn Coast (Sin El Fil, Dekwaneh, Jdeideh, Jal El Dib)', activeOrdersCount: 14 },
  { id: 2, name: 'Corridor 2: Central & Southern Mount Lebanon', schedule: 'Daily / Near-Daily', highwayPath: 'SuperSonic Central Hub (Choueifat) ➔ Aramoun / Bchamoun / Qabr Chmoun ➔ Aley / Bhamdoun / Sofar ➔ Upper Chouf (Deir El Qamar, Beiteddine, Baakline, Barouk)', activeOrdersCount: 9 },
  { id: 3, name: 'Corridor 3: Southern Coast & Deep South', schedule: 'Daily', highwayPath: 'Chouf Coast (Damour, Jiyeh) ➔ Saida ➔ Tyre (Sour) ➔ Nabatieh', activeOrdersCount: 12 },
  { id: 4, name: 'Corridor 4: Northern Coast to Batroun', schedule: '3-4 times/week', highwayPath: 'Antelias / Dbayeh ➔ Jounieh / Keserwan ➔ Jbeil (Byblos) ➔ Batroun ➔ Koura', activeOrdersCount: 8 },
  { id: 5, name: 'Corridor 5: Tripoli, Akkar & Dinnieh', schedule: '2-3 times/week', highwayPath: 'Tripoli ➔ Minieh ➔ Zgharta ➔ Dinnieh ➔ Akkar (Halba, Abdeh, Qobayat, Khraybet El Jindi, Menjez)', activeOrdersCount: 6 },
  { id: 6, name: 'Corridor 6: Central, West Bekaa & South-East', schedule: '2-3 times/week', highwayPath: 'Damascus Road (Sofar - Dahr El Baidar) ➔ Chtaura / Zahle ➔ West Bekaa (Joub Jannine) ➔ Rashaya ➔ Hasbaya ➔ Jezzine (via Machghara)', activeOrdersCount: 5 },
  { id: 7, name: 'Corridor 7: North Bekaa - Baalbek Hermel', schedule: '1-2 times/week', highwayPath: 'Rayak ➔ Baalbek ➔ Deir El Ahmar ➔ Labweh ➔ Hermel', activeOrdersCount: 3 },
];

// 2. FLEET VEHICLES (COMPANY-OWNED VS DRIVER-OWNED)
export const initialVehicles: FleetVehicle[] = [
  { plate: 'B-492102', category: 'VAN', model: 'Toyota HiAce High Roof (Van 01)', driver: 'Tony Khoury', phone: '03-112233', assignedCorridor: 1, status: 'ON_ROUTE', startKm: 142050, currentKm: 142165, reconciliationClosed: true, batteryPercent: 88, currentSpeedKmH: 48, currentLocationName: 'Beirut - Hamra Main Axis', gpsCoords: '33.8938° N, 35.4802° E', stopsDelivered: 6, stopsTotal: 8, ownership: 'COMPANY_OWNED' },
  { plate: 'G-183921', category: 'VAN', model: 'Hyundai H1 Cargo (Van 02)', driver: 'Fadi Abou Assi', phone: '03-445566', assignedCorridor: 2, status: 'DELIVERING', startKm: 88400, currentKm: 88480, reconciliationClosed: true, batteryPercent: 64, currentSpeedKmH: 20, currentLocationName: 'Aley - Roundabout Center', gpsCoords: '33.7821° N, 35.5901° E', stopsDelivered: 4, stopsTotal: 6, ownership: 'COMPANY_OWNED' },
  { plate: 'S-772910', category: 'CAR', model: 'Renault Duster 4x4 (Car 01)', driver: 'Hassan Sleiman', phone: '03-778899', assignedCorridor: 3, status: 'ON_ROUTE', startKm: 65120, currentKm: 65205, reconciliationClosed: true, batteryPercent: 92, currentSpeedKmH: 62, currentLocationName: 'Saida - Riad El Solh Highway', gpsCoords: '33.5590° N, 35.3725° E', stopsDelivered: 5, stopsTotal: 7, ownership: 'COMPANY_OWNED' },
  { plate: 'M-102941', category: 'MOTORCYCLE', model: 'Honda Cargo 250 (Moto 01)', driver: 'Ahmad Zein', phone: '03-990011', assignedCorridor: 1, status: 'ON_ROUTE', startKm: 12400, currentKm: 12460, reconciliationClosed: true, batteryPercent: 78, currentSpeedKmH: 35, currentLocationName: 'Dahieh - Hadi Nasrallah', gpsCoords: '33.8540° N, 35.5090° E', stopsDelivered: 3, stopsTotal: 4, ownership: 'DRIVER_OWN_VEHICLE' },
  { plate: 'B-310928', category: 'VAN', model: 'Toyota HiAce Medium (Van 03)', driver: 'Elie Matar', phone: '03-223344', assignedCorridor: 6, status: 'OFF_DUTY', startKm: 110200, currentKm: 110290, reconciliationClosed: false, batteryPercent: 95, currentSpeedKmH: 0, currentLocationName: 'Chtaura - Square Pin', gpsCoords: '33.8210° N, 35.8520° E', stopsDelivered: 0, stopsTotal: 0, ownership: 'COMPANY_OWNED', offDutyPin: 'Chtaura Square Pin (33.821° N, 35.852° E)' },
];

// 3. ORDERS (SOUTHERN OLIVE IN-HOUSE + EXTERNAL 3PL)
export const initialOrders: DispatchedOrder[] = [
  { id: 'ORD-103349', orderNo: 'ORD-103349', sourceType: 'SOUTHERN_OLIVE', customerName: 'Al-Baraka Supermarket S.A.R.L', phone: '01-745890', corridorId: 1, tripNo: 1, destinationTown: 'Beirut - Hamra', addressDetails: 'Makdessi St, Bldg 14, Ground Floor', items: '1x 17.5L Extra Virgin Tin + 2x Pickled Olives Box', productAmountLbp: 9000000, productAmountUsd: 100.0, deliveryFeeUsd: 4.0, assignedDriver: 'Tony Khoury', vehiclePlate: 'B-492102', status: 'DELIVERED', repName: 'Ahmad Ali Kassem (REP-002)', deliveredAt: '03-Sep-2026 01:25 PM', signatureSvg: 'Imad_Al_Baraka' },
  { id: 'ORD-103350', orderNo: 'ORD-103350', sourceType: 'SOUTHERN_OLIVE', customerName: 'Colonel Mahmoud Abboud', phone: '03-556677', corridorId: 2, tripNo: 0, destinationTown: 'Choueifat Showroom', addressDetails: 'Showroom Pickup Counter', items: '30x 17.5L Extra Virgin Bulk Tins', productAmountLbp: 248400000, productAmountUsd: 2760.0, deliveryFeeUsd: 0.0, assignedDriver: '-', vehiclePlate: '-', status: 'MOVED_TO_POS_PICKUP', repName: 'Hiba Aloulou (REP-004)' },
  { id: '3PL-88120', orderNo: '3PL-88120', sourceType: 'EXTERNAL_3PL', customerName: 'La Rose Fashion Boutique', phone: '01-482910', corridorId: 1, tripNo: 1, destinationTown: 'Metn - Sin El Fil', addressDetails: 'Near Habtoor Hotel', items: '3x Apparel Packages', productAmountLbp: 3150000, productAmountUsd: 35.0, deliveryFeeUsd: 3.0, assignedDriver: 'Tony Khoury', vehiclePlate: 'B-492102', status: 'DELIVERED', deliveredAt: '03-Sep-2026 02:10 PM', signatureSvg: 'Mireille_LaRose' },
  { id: 'ORD-103352', orderNo: 'ORD-103352', sourceType: 'SOUTHERN_OLIVE', customerName: 'Hussein Daik Retail Mart', phone: '07-720190', corridorId: 3, tripNo: 1, destinationTown: 'Saida - Riad El Solh', addressDetails: 'Daik Wholesale Center', items: 'Assorted Preserves + Extra Virgin 1L Glass Cases', productAmountLbp: 706968000, productAmountUsd: 7855.2, deliveryFeeUsd: 6.0, assignedDriver: 'Hassan Sleiman', vehiclePlate: 'S-772910', status: 'ON_ROUTE', repName: 'Mahdi (REP-001)' },
  { id: '3PL-88125', orderNo: '3PL-88125', sourceType: 'EXTERNAL_3PL', customerName: 'Apex Electronics Hub', phone: '01-205930', corridorId: 1, tripNo: 2, destinationTown: 'Beirut - Achrafieh', addressDetails: 'Sassine Square, Rue Huvelin', items: '2x Hardware Component Cartons', productAmountLbp: 4500000, productAmountUsd: 50.0, deliveryFeeUsd: 4.0, assignedDriver: 'Tony Khoury', vehiclePlate: 'B-492102', status: 'ON_ROUTE' },
];

// 4. VENDORS MASTER
export const initialVendors: SuperSonicVendor[] = [
  { id: 'VND-01', vendorName: 'La Rose Fashion Boutique', contactPerson: 'Mireille K.', phone: '01-482910', businessType: 'Apparel & Fashion', settlementTerms: 'WEEKLY_SETTLEMENT', currentCodBalanceUsd: 850.0, unpaidDeliveryFeesUsd: 75.0, status: 'ACTIVE' },
  { id: 'VND-02', vendorName: 'Apex Electronics Hub', contactPerson: 'Karim Daher', phone: '01-205930', businessType: 'Electronics & Hardware', settlementTerms: 'DAILY_CASH', currentCodBalanceUsd: 1420.0, unpaidDeliveryFeesUsd: 110.0, status: 'ACTIVE' },
  { id: 'VND-03', vendorName: 'Beirut Gourmet Roastery', contactPerson: 'Walid Haddad', phone: '01-741258', businessType: 'Coffee & Nuts', settlementTerms: 'AFTER_DELIVERY_PAYOUT', currentCodBalanceUsd: 320.0, unpaidDeliveryFeesUsd: 28.0, status: 'ACTIVE' },
];

// 5. STAFF ROSTER
export const initialStaff: StaffMember[] = [
  { id: 'SS-EMP-01', fullName: 'Tony Khoury', role: 'Lead Van Courier (Corridor 1)', type: 'DRIVER', phone: '03-112233', assignedAsset: 'Toyota HiAce (B-492102)', compensationModel: 'Commission per Run', salaryOrRate: '$4.00 / Stop', ownershipStatus: 'COMPANY_FLEET' },
  { id: 'SS-EMP-02', fullName: 'Fadi Abou Assi', role: 'Senior Van Driver (Corridor 2)', type: 'DRIVER', phone: '03-445566', assignedAsset: 'Hyundai H1 (G-183921)', compensationModel: 'Daily Shift Rate', salaryOrRate: '$35.00 / Day', ownershipStatus: 'COMPANY_FLEET' },
  { id: 'SS-EMP-03', fullName: 'Hassan Sleiman', role: 'South Deep Highway Courier', type: 'DRIVER', phone: '03-778899', assignedAsset: 'Renault Duster (S-772910)', compensationModel: 'Daily Rate', salaryOrRate: '$40.00 / Day', ownershipStatus: 'COMPANY_FLEET' },
  { id: 'SS-EMP-04', fullName: 'Ahmad Zein', role: 'Motorcycle Courier (Beirut Fast)', type: 'DRIVER', phone: '03-990011', assignedAsset: 'Honda Cargo 250 (M-102941)', compensationModel: 'Commission', salaryOrRate: '$2.50 / Stop', ownershipStatus: 'OWN_VEHICLE' },
  { id: 'SS-EMP-05', fullName: 'Rami Al-Hajj', role: 'SuperSonic Operations Manager', type: 'ON_SITE', phone: '03-889911', assignedAsset: 'Central Hub Dispatch Office', compensationModel: 'Fixed Monthly', salaryOrRate: '$1,800.00 / Month', ownershipStatus: 'N/A_ON_SITE' },
  { id: 'SS-EMP-06', fullName: 'Layla Bazzi', role: 'SuperSonic Fleet Accountant', type: 'ON_SITE', phone: '03-551122', assignedAsset: 'Settlements & Treasury Desk', compensationModel: 'Fixed Monthly', salaryOrRate: '$1,200.00 / Month', ownershipStatus: 'N/A_ON_SITE' },
];

// 6. COMPLAINTS TICKETS
export const initialComplaints: CustomerComplaintTicket[] = [
  { id: 'CMP-104', orderNo: 'ORD-103349', customerName: 'Al-Baraka Supermarket', phone: '01-745890', driverName: 'Tony Khoury', category: 'LATE_DELIVERY', description: 'Driver delayed by 45 mins in Khalde traffic.', status: 'RESOLVED', reportedAt: 'Today 02:40 PM', sourceType: 'SOUTHERN_OLIVE', resolutionNotes: 'Confirmed delivery completed satisfactorily.' },
  { id: 'CMP-105', orderNo: '3PL-88125', customerName: 'Apex Electronics Client', phone: '03-221144', driverName: 'Tony Khoury', category: 'PAYMENT_ISSUE', description: 'Customer disputed LBP exchange rate on Whish.', status: 'OPEN', reportedAt: 'Today 04:15 PM', sourceType: 'EXTERNAL_3PL' },
];

// 7. FINANCIAL LEDGER
export const initialLedger: LedgerEntry[] = [
  { id: 'TX-901', date: '03-Sep-2026 01:25 PM', description: 'Delivery Fee Collected — ORD-103349 (Al-Baraka)', type: 'DELIVERY_REVENUE', amountUsd: 4.0, account: 'SuperSonic Operating Revenue' },
  { id: 'TX-902', date: '03-Sep-2026 02:10 PM', description: 'Delivery Fee Collected — 3PL-88120 (La Rose)', type: 'DELIVERY_REVENUE', amountUsd: 3.0, account: 'SuperSonic Operating Revenue' },
  { id: 'TX-903', date: '03-Sep-2026 03:00 PM', description: 'COD Cash Handover to Vault — Trip 1 (Tony Khoury)', type: 'VAULT_COD', amountUsd: 250.0, account: 'Choueifat Central Cash Vault' },
  { id: 'TX-904', date: '03-Sep-2026 04:15 PM', description: 'Whish Money Remote Deposit Verified (WSH-0091)', type: 'WHISH_DEPOSIT', amountUsd: 200.0, account: 'SuperSonic Whish Wallet' },
  { id: 'TX-905', date: '03-Sep-2026 10:00 AM', description: 'Diesel Fuel Refill — Van 01 (HiAce B-492102)', type: 'FUEL_EXPENSE', amountUsd: -45.0, account: 'Fleet Fuel Expenses' },
  { id: 'TX-906', date: '03-Sep-2026 05:00 PM', description: 'Weekly COD Remittance Paid Out — La Rose Boutique', type: 'VENDOR_PAYOUT', amountUsd: -850.0, account: '3PL Merchant Payable Ledger' },
];
