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
export const initialOrders: DispatchedOrder[] = [
  { id: 'ORD-103349', orderNo: 'ORD-103349', sourceType: 'SOUTHERN_OLIVE', customerName: 'Al-Baraka Supermarket S.A.R.L', phone: '01-745890', corridorId: 1, tripNo: 1, destinationTown: 'Beirut - Hamra', addressDetails: 'Makdessi St, Bldg 14, Ground Floor', driverNotes: 'Call 15 mins prior to arrival. Delivery at rear service entrance. Cash collection in USD or LBP at 89,500.', items: '1x 17.5L Extra Virgin Tin + 2x Pickled Olives Box', productAmountLbp: 8950000, productAmountUsd: 100.0, deliveryFeeUsd: 4.0, assignedDriver: 'Tony Khoury', vehiclePlate: 'B-492102', status: 'DELIVERED', repName: 'Ahmad Ali Kassem (REP-002)', deliveredAt: '03-Sep-2026 01:25 PM', signatureSvg: 'Imad_Al_Baraka' },
  { id: 'ORD-103350', orderNo: 'ORD-103350', sourceType: 'SOUTHERN_OLIVE', customerName: 'Colonel Mahmoud Abboud', phone: '03-556677', corridorId: 2, tripNo: 0, destinationTown: 'Choueifat Showroom', addressDetails: 'Showroom Pickup Counter', driverNotes: 'Hold for showroom pickup by customer. Payment settled in advance via Whish.', items: '30x 17.5L Extra Virgin Bulk Tins', productAmountLbp: 247020000, productAmountUsd: 2760.0, deliveryFeeUsd: 0.0, assignedDriver: '-', vehiclePlate: '-', status: 'MOVED_TO_POS_PICKUP', repName: 'Hiba Aloulou (REP-004)' },
  { id: '3PL-88120', orderNo: '3PL-88120', sourceType: 'EXTERNAL_3PL', customerName: 'La Rose Fashion Boutique', phone: '01-482910', corridorId: 1, tripNo: 1, destinationTown: 'Metn - Sin El Fil', addressDetails: 'Near Habtoor Hotel, Mirna Chalouhi Commercial Center', driverNotes: 'COD package. Hand over receipt with signature. Customer pays LBP at 89,500.', items: '3x Apparel Packages', productAmountLbp: 3132500, productAmountUsd: 35.0, deliveryFeeUsd: 3.0, assignedDriver: 'Tony Khoury', vehiclePlate: 'B-492102', status: 'DELIVERED', deliveredAt: '03-Sep-2026 02:10 PM', signatureSvg: 'Mireille_LaRose' },
  { id: 'ORD-103352', orderNo: 'ORD-103352', sourceType: 'SOUTHERN_OLIVE', customerName: 'Hussein Daik Retail Mart', phone: '07-720190', corridorId: 3, tripNo: 1, destinationTown: 'Saida - Riad El Solh', addressDetails: 'Daik Wholesale Center, facing Fransabank', driverNotes: 'Major commercial delivery. Unload onto wooden pallets. Cash USD only.', items: 'Assorted Preserves + Extra Virgin 1L Glass Cases', productAmountLbp: 703040400, productAmountUsd: 7855.2, deliveryFeeUsd: 6.0, assignedDriver: 'Hassan Sleiman', vehiclePlate: 'S-772910', status: 'ON_ROUTE', repName: 'Mahdi (REP-001)' },
  { id: '3PL-88125', orderNo: '3PL-88125', sourceType: 'EXTERNAL_3PL', customerName: 'Apex Electronics Hub', phone: '01-205930', corridorId: 1, tripNo: 2, destinationTown: 'Beirut - Achrafieh', addressDetails: 'Sassine Square, Rue Huvelin, Bldg 8', driverNotes: 'Fragile electronics. Deliver directly to Karim Daher. Collect COD $50 USD or 4,475,000 LBP.', items: '2x Hardware Component Cartons', productAmountLbp: 4475000, productAmountUsd: 50.0, deliveryFeeUsd: 4.0, assignedDriver: 'Tony Khoury', vehiclePlate: 'B-492102', status: 'ON_ROUTE' },
  { id: 'ORD-103358', orderNo: 'ORD-103358', sourceType: 'SOUTHERN_OLIVE', customerName: 'Tyre Phoenician Resort & Kitchen', phone: '07-391200', corridorId: 3, tripNo: 1, destinationTown: 'Tyre (Sour) - Rest House Coast', addressDetails: 'Al-Kharab Seaside Corniche', driverNotes: 'Kitchen receiving dock. Call chef Ali upon arrival. COD $220 USD or 19,690,000 LBP.', items: '2x 17.5L Extra Virgin Tin + 6x Vinegar 1L Glass', productAmountLbp: 19690000, productAmountUsd: 220.0, deliveryFeeUsd: 8.0, assignedDriver: 'Hassan Sleiman', vehiclePlate: 'S-772910', status: 'QUEUED', repName: 'Mahdi (REP-001)' },
  { id: 'ORD-103359', orderNo: 'ORD-103359', sourceType: 'SOUTHERN_OLIVE', customerName: 'Batroun Old Souk Olive House', phone: '06-742110', corridorId: 4, tripNo: 1, destinationTown: 'Batroun - Old Port Souk', addressDetails: 'Saint Stephen Church Road, Stone Bldg', driverNotes: 'Cobblestone pedestrian zone; park near port and deliver by hand trolley. Collect COD $140 USD.', items: '1x 17.5L Extra Virgin Tin + 12x 500ml Extra Virgin Bottles', productAmountLbp: 12530000, productAmountUsd: 140.0, deliveryFeeUsd: 7.0, assignedDriver: 'Charbel Rahme', vehiclePlate: 'B-310928', status: 'QUEUED', repName: 'Ahmad Ali Kassem (REP-002)' },
  { id: 'ORD-103360', orderNo: 'ORD-103360', sourceType: 'SOUTHERN_OLIVE', customerName: 'Zahle Bardawni Restaurant Co.', phone: '08-805400', corridorId: 5, tripNo: 1, destinationTown: 'Zahle - Bardawni Valley', addressDetails: 'Wadi El Arayesh, Casino Arabi Axis', driverNotes: 'Deliver to central restaurant storehouse. Collect $350 USD cash or 31,325,000 LBP.', items: '4x 17.5L Extra Virgin Bulk Tins + 5x Pickled Olives Box', productAmountLbp: 31325000, productAmountUsd: 350.0, deliveryFeeUsd: 9.0, assignedDriver: 'Elie Matar', vehiclePlate: 'B-310928', status: 'QUEUED', repName: 'Hiba Aloulou (REP-004)' },
];

// 4. VENDORS MASTER
export const initialVendors: SuperSonicVendor[] = [
  { id: 'VND-01', vendorName: 'La Rose Fashion Boutique', merchantName: 'La Rose Fashion Boutique', contactPerson: 'Mireille K.', phone: '01-482910', businessType: 'Apparel & Fashion', settlementTerms: 'WEEKLY_SETTLEMENT', currentCodBalanceUsd: 850.0, unpaidDeliveryFeesUsd: 75.0, status: 'ACTIVE', ordersCount: 8 },
  { id: 'VND-02', vendorName: 'Apex Electronics Hub', merchantName: 'Apex Electronics Hub', contactPerson: 'Karim Daher', phone: '01-205930', businessType: 'Electronics & Hardware', settlementTerms: 'DAILY_CASH', currentCodBalanceUsd: 1420.0, unpaidDeliveryFeesUsd: 110.0, status: 'ACTIVE', ordersCount: 12 },
  { id: 'VND-03', vendorName: 'Beirut Gourmet Roastery', merchantName: 'Beirut Gourmet Roastery', contactPerson: 'Walid Haddad', phone: '01-741258', businessType: 'Coffee & Nuts', settlementTerms: 'AFTER_DELIVERY_PAYOUT', currentCodBalanceUsd: 320.0, unpaidDeliveryFeesUsd: 28.0, status: 'ACTIVE', ordersCount: 5 },
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

// 7. FINANCIAL LEDGER (ENFORCING OFFICIAL 89,500 LBP RATE & DRIVER RUN SETTLEMENTS)
export const initialLedger: LedgerEntry[] = [
  { id: 'TX-901', voucherNo: 'REV-2026-901', date: '03-Sep-2026 01:25 PM', description: 'Delivery Fee Collected — ORD-103349 (Al-Baraka Hamra)', type: 'DELIVERY_REVENUE', amountUsd: 4.0, amountLbp: 358000, account: 'SuperSonic Operating Revenue', driverName: 'Tony Khoury', recipient: 'Layla Bazzi (Settlements Desk)', status: 'COMPLETED' },
  { id: 'TX-902', voucherNo: 'REV-2026-902', date: '03-Sep-2026 02:10 PM', description: 'Delivery Fee Collected — 3PL-88120 (La Rose Sin El Fil)', type: 'DELIVERY_REVENUE', amountUsd: 3.0, amountLbp: 268500, account: 'SuperSonic Operating Revenue', driverName: 'Tony Khoury', recipient: 'Layla Bazzi (Settlements Desk)', status: 'COMPLETED' },
  { id: 'TX-903', voucherNo: 'SETTL-2026-0814', date: '03-Sep-2026 03:00 PM', description: 'End-of-Shift COD Cash Handover — Corridor 1 Trip 1', type: 'DRIVER_SETTLEMENT', amountUsd: 250.0, amountLbp: 22375000, account: 'Choueifat Central Cash Vault', driverName: 'Tony Khoury', recipient: 'Choueifat Vault Desk', status: 'RECONCILED' },
  { id: 'TX-904', voucherNo: 'WSH-2026-0091', date: '03-Sep-2026 04:15 PM', description: 'Whish Money Remote Deposit Verified (WSH-0091)', type: 'WHISH_DEPOSIT', amountUsd: 200.0, amountLbp: 17900000, account: 'SuperSonic Whish Wallet', driverName: 'Fadi Abou Assi', recipient: 'SuperSonic Whish Account', status: 'COMPLETED' },
  { id: 'TX-905', voucherNo: 'EXP-2026-104', date: '03-Sep-2026 10:00 AM', description: 'Diesel Fuel Refill — Van 01 (HiAce B-492102)', type: 'FUEL_EXPENSE', amountUsd: -45.0, amountLbp: -4027500, account: 'Fleet Fuel Expenses', driverName: 'Tony Khoury', recipient: 'Coral Station Choueifat', status: 'COMPLETED' },
  { id: 'TX-906', voucherNo: 'REM-2026-550', date: '03-Sep-2026 05:00 PM', description: 'Weekly COD Remittance Paid Out — La Rose Boutique', type: 'VENDOR_PAYOUT', amountUsd: -850.0, amountLbp: -76075000, account: '3PL Merchant Payable Ledger', recipient: 'Mireille K. (La Rose)', status: 'COMPLETED' },
];
