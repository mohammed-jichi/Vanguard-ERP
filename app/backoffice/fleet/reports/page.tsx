'use client';

import React, { useState, useMemo } from 'react';
import ReportPageLayout, {
  ReportHeader,
  ExportButtons,
  ReportFilters,
  ReportSelectFilter,
  ReportMetricCards,
  ReportTableWrapper,
  MetricCardItem,
  DynamicReportFilterRenderer,
} from '@/components/reports/ReportPageLayout';
import {
  initialOrders,
  initialStaff,
  initialCorridors,
  initialVehicles,
  initialLedger,
  DispatchedOrder,
} from '../fleet-data';
import {
  Truck,
  Route,
  CheckCircle2,
  DollarSign,
  UserCheck,
  Clock,
  AlertCircle,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { getReportStatusTextClass, getPaymentMethodTextClass } from '@/components/reports/reportContrastTokens';
import {
  getDefaultInitialDateRange,
  resolveDateRangeFromPreset,
} from '@/lib/dateRangeEngine';

// ============================================================================
// EXTENDED MOCK DATA FOR COMPREHENSIVE FLEET REPORTS
// ============================================================================

const EXTENDED_FLEET_DELIVERIES: DispatchedOrder[] = [
  ...initialOrders,
  {
    id: 'ORD-103353',
    orderNo: 'ORD-103353',
    sourceType: 'SOUTHERN_OLIVE',
    customerName: 'Sami Haddad Groceries',
    phone: '05-430120',
    corridorId: 2,
    tripNo: 1,
    destinationTown: 'Aley - Saray Axis',
    addressDetails: 'Near Municipal Palace',
    items: '2x 17.5L Extra Virgin Tin',
    productAmountLbp: 18000000,
    productAmountUsd: 200.0,
    deliveryFeeUsd: 5.0,
    assignedDriver: 'Fadi Abou Assi',
    vehiclePlate: 'G-183921',
    status: 'DELIVERED',
    repName: 'Ahmad Ali Kassem (REP-002)',
    deliveredAt: '03-Sep-2026 03:15 PM',
    signatureSvg: 'Sami_Haddad_Signed',
  },
  {
    id: '3PL-88126',
    orderNo: '3PL-88126',
    sourceType: 'EXTERNAL_3PL',
    customerName: 'Cedar Mountain Electronics',
    phone: '09-940221',
    corridorId: 4,
    tripNo: 1,
    destinationTown: 'Jounieh - Highway',
    addressDetails: 'Kaslik Interchange, B04',
    items: '4x Smart Home Hubs',
    productAmountLbp: 13500000,
    productAmountUsd: 150.0,
    deliveryFeeUsd: 6.0,
    assignedDriver: 'Charbel Rahme',
    vehiclePlate: 'B-310928',
    status: 'DELIVERED',
    deliveredAt: '03-Sep-2026 04:30 PM',
    signatureSvg: 'Cedar_Tech_Signed',
  },
  {
    id: 'ORD-103354',
    orderNo: 'ORD-103354',
    sourceType: 'SOUTHERN_OLIVE',
    customerName: 'Beirut Gourmet Depot Store',
    phone: '01-382910',
    corridorId: 1,
    tripNo: 2,
    destinationTown: 'Beirut - Verdun',
    addressDetails: 'Dunes Center 2nd Floor',
    items: '12x 500ml Cold Press Glass Bottles',
    productAmountLbp: 22500000,
    productAmountUsd: 250.0,
    deliveryFeeUsd: 4.0,
    assignedDriver: 'Tony Khoury',
    vehiclePlate: 'B-492102',
    status: 'ON_ROUTE',
    repName: 'Hiba Aloulou (REP-004)',
  },
  {
    id: '3PL-88127',
    orderNo: '3PL-88127',
    sourceType: 'EXTERNAL_3PL',
    customerName: 'Tripoli Spice Merchant',
    phone: '06-441290',
    corridorId: 5,
    tripNo: 1,
    destinationTown: 'Tripoli - Mina Port Road',
    addressDetails: 'Al-Tall Historical Square',
    items: '8x Organic Olive Herb Jars',
    productAmountLbp: 7200000,
    productAmountUsd: 80.0,
    deliveryFeeUsd: 7.0,
    assignedDriver: 'Khaled Merhi',
    vehiclePlate: 'B-492102',
    status: 'QUEUED',
  },
  {
    id: 'ORD-103355',
    orderNo: 'ORD-103355',
    sourceType: 'SOUTHERN_OLIVE',
    customerName: 'Dr. Ziad Baroud Clinic',
    phone: '04-520110',
    corridorId: 1,
    tripNo: 1,
    destinationTown: 'Metn - Antelias',
    addressDetails: 'St. Elie Center Bldg 3',
    items: '1x 17.5L Tin Extra Virgin',
    productAmountLbp: 9000000,
    productAmountUsd: 100.0,
    deliveryFeeUsd: 4.0,
    assignedDriver: 'Ahmad Zein',
    vehiclePlate: 'M-102941',
    status: 'DELIVERED',
    repName: 'Mahdi (REP-001)',
    deliveredAt: '03-Sep-2026 11:20 AM',
    signatureSvg: 'Dr_Ziad_Signature',
  },
  {
    id: 'ORD-103356',
    orderNo: 'ORD-103356',
    sourceType: 'SOUTHERN_OLIVE',
    customerName: 'Nour Al-Huda Co-op',
    phone: '07-340880',
    corridorId: 3,
    tripNo: 1,
    destinationTown: 'Tyre - Port Road',
    addressDetails: 'Al-Husseini Bldg',
    items: '5x 17.5L Tins Bulk',
    productAmountLbp: 45000000,
    productAmountUsd: 500.0,
    deliveryFeeUsd: 8.0,
    assignedDriver: 'Hassan Sleiman',
    vehiclePlate: 'S-772910',
    status: 'REJECTED',
    repName: 'Mahdi (REP-001)',
  },
];

interface DriverPerformanceSummary {
  driverName: string;
  phone: string;
  assignedAsset: string;
  assignedCorridor: string;
  tripsCompleted: number;
  parcelsDelivered: number;
  parcelsPending: number;
  rejections: number;
  cashCollectedUsd: number;
  deliveryFeesEarnedUsd: number;
  successRate: number;
}

interface SettlementAuditItem {
  id: string;
  date: string;
  refCode: string;
  driverOrMerchant: string;
  type: 'VAULT_CASH' | 'WHISH_TRANSFER' | 'MERCHANT_REMITTANCE' | 'DELIVERY_REVENUE';
  amountUsd: number;
  amountLbp: number;
  destinationAccount: string;
  status: 'CLEARED' | 'PENDING_AUDIT' | 'DISCREPANCY';
  auditNotes: string;
}

const MOCK_SETTLEMENT_LOGS: SettlementAuditItem[] = [
  {
    id: 'SET-901',
    date: '2026-09-03 15:30',
    refCode: 'CSH-0042',
    driverOrMerchant: 'Tony Khoury',
    type: 'VAULT_CASH',
    amountUsd: 250.0,
    amountLbp: 22375000,
    destinationAccount: 'Choueifat Central Cash Vault',
    status: 'CLEARED',
    auditNotes: 'Physical cash received by Vault Cashier Layla Bazzi',
  },
  {
    id: 'SET-902',
    date: '2026-09-03 16:15',
    refCode: 'WSH-0091',
    driverOrMerchant: 'Tony Khoury',
    type: 'WHISH_TRANSFER',
    amountUsd: 200.0,
    amountLbp: 17900000,
    destinationAccount: 'SuperSonic Whish Wallet #9988124',
    status: 'PENDING_AUDIT',
    auditNotes: 'Whish reference verified, awaiting bank ledger sync',
  },
  {
    id: 'SET-903',
    date: '2026-09-03 17:00',
    refCode: 'REMIT-018',
    driverOrMerchant: 'La Rose Fashion Boutique',
    type: 'MERCHANT_REMITTANCE',
    amountUsd: -850.0,
    amountLbp: -76075000,
    destinationAccount: '3PL Merchant Payable Ledger',
    status: 'CLEARED',
    auditNotes: 'Weekly COD settlement transferred to vendor account',
  },
  {
    id: 'SET-904',
    date: '2026-09-03 17:45',
    refCode: 'CSH-0043',
    driverOrMerchant: 'Hassan Sleiman',
    type: 'VAULT_CASH',
    amountUsd: 1420.0,
    amountLbp: 127090000,
    destinationAccount: 'Choueifat Central Cash Vault',
    status: 'PENDING_AUDIT',
    auditNotes: 'En route back to base with Southern Corridor cash bag',
  },
  {
    id: 'SET-905',
    date: '2026-09-03 18:00',
    refCode: 'REV-088',
    driverOrMerchant: 'Fadi Abou Assi',
    type: 'DELIVERY_REVENUE',
    amountUsd: 45.0,
    amountLbp: 4027500,
    destinationAccount: 'SuperSonic Operating Revenue',
    status: 'CLEARED',
    auditNotes: 'Net courier fees collected from Chouf Run',
  },
];

// ============================================================================
// MASTER FLEET REPORTS PAGE
// ============================================================================

export default function SupersonicFleetReportsPage() {
  // 1. Report Selector & Category
  const [selectedReportKey, setSelectedReportKey] = useState<string>('ALL_DELIVERIES');

  // 2. Filters State
  const initialDateRange = getDefaultInitialDateRange('This Month');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [period, setPeriod] = useState<string>(initialDateRange.preset);
  const [fromDate, setFromDate] = useState<string>(initialDateRange.fromDate);
  const [toDate, setToDate] = useState<string>(initialDateRange.toDate);
  const [selectedDriver, setSelectedDriver] = useState<string>('ALL');
  const [selectedCorridor, setSelectedCorridor] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [fleetFilterValues, setFleetFilterValues] = useState<Record<string, any>>({});

  // 3. Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Available Drivers
  const driverOptions = [
    { label: 'All Drivers / Couriers', value: 'ALL' },
    ...initialStaff
      .filter((s) => s.type === 'DRIVER')
      .map((s) => ({
        label: `${s.fullName} (${s.role.split('(')[1]?.replace(')', '') || 'Courier'})`,
        value: s.fullName,
      })),
  ];

  // Available Corridors
  const corridorOptions = [
    { label: 'All Highway Corridors', value: 'ALL' },
    ...initialCorridors.map((c) => ({
      label: `C${c.id}: ${c.name.split(':')[1]?.trim() || c.name}`,
      value: c.id.toString(),
    })),
  ];

  // Available Statuses
  const statusOptions = [
    { label: 'All Delivery Statuses', value: 'ALL' },
    { label: 'Delivered (Success)', value: 'DELIVERED' },
    { label: 'On Route (En Transit)', value: 'ON_ROUTE' },
    { label: 'Queued for Loading', value: 'QUEUED' },
    { label: 'Pending Dispatch', value: 'PENDING' },
    { label: 'Rejected (Return)', value: 'REJECTED' },
    { label: 'Moved to POS Pickup', value: 'MOVED_TO_POS_PICKUP' },
  ];

  // Report Sheets
  const reportSheets = [
    { label: 'REP_FLT_001: Deliveries & Dispatch Logs', value: 'ALL_DELIVERIES' },
    { label: 'REP_FLT_002: Driver Performance & Reconciliation', value: 'DRIVER_PERFORMANCE' },
    { label: 'REP_FLT_003: COD, Whish & Cash Settlements', value: 'COD_SETTLEMENTS' },
    { label: 'REP_FLT_004: Fulfillment Transition Audit Trail', value: 'FULFILLMENT_AUDIT' },
  ];

  // ============================================================================
  // FILTERED DATA
  // ============================================================================

  // 1. Deliveries Filter
  const filteredDeliveries = useMemo(() => {
    return EXTENDED_FLEET_DELIVERIES.filter((order) => {
      const matchesSearch =
        searchQuery === '' ||
        order.orderNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.destinationTown.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.assignedDriver.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDriver = selectedDriver === 'ALL' || order.assignedDriver === selectedDriver;
      const matchesCorridor = selectedCorridor === 'ALL' || order.corridorId.toString() === selectedCorridor;
      const matchesStatus = selectedStatus === 'ALL' || order.status === selectedStatus;

      return matchesSearch && matchesDriver && matchesCorridor && matchesStatus;
    });
  }, [searchQuery, selectedDriver, selectedCorridor, selectedStatus]);

  // 2. Driver Performance Summaries
  const driverPerformanceList: DriverPerformanceSummary[] = useMemo(() => {
    const drivers = initialStaff.filter((s) => s.type === 'DRIVER');
    return drivers.map((driver) => {
      const driverOrders = EXTENDED_FLEET_DELIVERIES.filter((o) => o.assignedDriver === driver.fullName);
      const deliveredCount = driverOrders.filter((o) => o.status === 'DELIVERED').length;
      const rejectedCount = driverOrders.filter((o) => o.status === 'REJECTED').length;
      const pendingCount = driverOrders.filter((o) => o.status === 'ON_ROUTE' || o.status === 'QUEUED').length;
      const totalResolved = deliveredCount + rejectedCount;
      const successRate = totalResolved > 0 ? (deliveredCount / totalResolved) * 100 : 100;

      const cashCollected = driverOrders
        .filter((o) => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + o.productAmountUsd, 0);

      const feesEarned = driverOrders
        .filter((o) => o.status === 'DELIVERED')
        .reduce((sum, o) => sum + o.deliveryFeeUsd, 0);

      const vehicle = initialVehicles.find((v) => v.driver === driver.fullName);
      const corridor = initialCorridors.find((c) => c.driver === driver.fullName);

      return {
        driverName: driver.fullName,
        phone: driver.phone,
        assignedAsset: driver.assignedAsset || vehicle?.model || 'Fleet Unit',
        assignedCorridor: corridor?.name || `Corridor ${driverOrders[0]?.corridorId || 1}`,
        tripsCompleted: Math.max(1, driverOrders.reduce((max, o) => Math.max(max, o.tripNo), 1)),
        parcelsDelivered: deliveredCount,
        parcelsPending: pendingCount,
        rejections: rejectedCount,
        cashCollectedUsd: cashCollected,
        deliveryFeesEarnedUsd: feesEarned,
        successRate: parseFloat(successRate.toFixed(1)),
      };
    });
  }, []);

  // 3. Filtered Settlements
  const filteredSettlements = useMemo(() => {
    return MOCK_SETTLEMENT_LOGS.filter((log) => {
      const matchesSearch =
        searchQuery === '' ||
        log.refCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.driverOrMerchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.destinationAccount.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDriver = selectedDriver === 'ALL' || log.driverOrMerchant === selectedDriver;
      return matchesSearch && matchesDriver;
    });
  }, [searchQuery, selectedDriver]);

  // ============================================================================
  // KPI CALCULATIONS
  // ============================================================================

  const activeDriversCount = initialStaff.filter((s) => s.type === 'DRIVER').length;
  const totalTripsCount = EXTENDED_FLEET_DELIVERIES.reduce((acc, o) => Math.max(acc, o.tripNo), 0) + 14;
  const totalDelivered = EXTENDED_FLEET_DELIVERIES.filter((o) => o.status === 'DELIVERED').length;
  const totalRejected = EXTENDED_FLEET_DELIVERIES.filter((o) => o.status === 'REJECTED').length;
  const successRate = totalDelivered + totalRejected > 0 ? (totalDelivered / (totalDelivered + totalRejected)) * 100 : 96.2;

  const pendingSettlementUsd = MOCK_SETTLEMENT_LOGS.filter((s) => s.status === 'PENDING_AUDIT').reduce(
    (acc, s) => acc + s.amountUsd,
    0
  );
  const pendingSettlementLbp = pendingSettlementUsd * 89500;

  const fleetKpiMetrics: MetricCardItem[] = [
    {
      title: 'Active Drivers On-Duty',
      value: `${activeDriversCount} Couriers`,
      subtext: 'Across 7 Regional Corridors',
      icon: <Truck className="w-5 h-5" />,
      change: { value: '100% Roster Active', trend: 'up' },
    },
    {
      title: 'Total Dispatched Trips',
      value: `${totalTripsCount} Runs`,
      subtext: `${filteredDeliveries.length} Reconciled Waybills`,
      icon: <Route className="w-5 h-5" />,
      change: { value: '+14% this month', trend: 'up' },
    },
    {
      title: 'Delivery Success Rate',
      value: `${successRate.toFixed(1)}%`,
      subtext: `${totalDelivered} Delivered / ${totalRejected} Returned`,
      icon: <CheckCircle2 className="w-5 h-5" />,
      change: { value: '+2.4% vs benchmark', trend: 'up' },
    },
    {
      title: 'Pending COD Settlements',
      value: `$${pendingSettlementUsd.toFixed(2)}`,
      subtext: `${pendingSettlementLbp.toLocaleString()} LBP in transit`,
      icon: <DollarSign className="w-5 h-5" />,
      change: { value: 'Vault & Whish Audit', trend: 'neutral' },
    },
  ];

  // Paginated Slice for Deliveries
  const paginatedDeliveries = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDeliveries.slice(startIndex, startIndex + pageSize);
  }, [filteredDeliveries, currentPage, pageSize]);

  const totalPagesDeliveries = Math.ceil(filteredDeliveries.length / pageSize) || 1;

  const fleetCategories = useMemo(() => [
    {
      title: 'Recently Viewed',
      items: [
        'REP_FLT_001: Deliveries & Dispatch Logs',
        'REP_FLT_003: COD, Whish & Cash Settlements',
      ],
    },
    {
      title: 'Dispatch & Corridors',
      items: [
        'REP_FLT_001: Deliveries & Dispatch Logs',
      ],
    },
    {
      title: 'Driver Reconciliation',
      items: [
        'REP_FLT_002: Driver Performance & Reconciliation',
      ],
    },
    {
      title: 'Settlements & Vault',
      items: [
        'REP_FLT_003: COD, Whish & Cash Settlements',
      ],
    },
    {
      title: 'Audit & Transitions',
      items: [
        'REP_FLT_004: Fulfillment Transition Audit Trail',
      ],
    },
  ], []);

  const handleFleetLeftNavSelect = (reportName: string) => {
    const found = reportSheets.find(
      (r) => r.label === reportName || reportName.includes(r.value) || r.label.includes(reportName)
    );
    if (found) {
      setSelectedReportKey(found.value);
    }
  };

  const activeReportObj = reportSheets.find((r) => r.value === selectedReportKey) || reportSheets[0];

  return (
    <ReportPageLayout
      moduleTitle="Supersonic Fleet"
      categories={fleetCategories}
      selectedReport={activeReportObj.label}
      onSelectReport={handleFleetLeftNavSelect}
      // 1. Standardized Corporate Header
      header={
        <ReportHeader
          title="Supersonic Fleet Reports"
          subtitle={`Central logistics, courier trip logs, regional corridor reconciliations, and cash settlements for ${period}.`}
          reportCode={activeReportObj.label.split(':')[0]}
          badgeText="SuperSonic 3PL & In-House Fleet"
          badgeVariant="success"
          breadcrumbs={[
            { label: 'Home', href: '/backoffice' },
            { label: '2. Supersonic Fleet', href: '/backoffice/fleet' },
            { label: 'Reports', href: '/backoffice/fleet/reports' },
            { label: activeReportObj.label.split(':')[1]?.trim() || activeReportObj.label },
          ]}
          actions={
            <ExportButtons
              onExportPdf={() => window.print()}
              onPrint={() => window.print()}
              onExportExcel={() => alert(`Exporting ${activeReportObj.label} to Excel (.xlsx)...`)}
              onExportCsv={() => alert(`Exporting ${activeReportObj.label} to CSV...`)}
            />
          }
        />
      }
      // 2. Standardized KPI Metrics
      metrics={<ReportMetricCards metrics={fleetKpiMetrics} />}
      // 3. Dynamic Filter Engine
      filters={
        <DynamicReportFilterRenderer
          activeReportKey={activeReportObj.label}
          module="fleet"
          values={{
            period,
            fromDate,
            toDate,
            driver: selectedDriver,
            corridor: selectedCorridor,
            deliveryStatus: selectedStatus,
            searchQuery,
            ...fleetFilterValues,
          }}
          onValuesChange={(newVals) => {
            if (newVals.period !== undefined) setPeriod(newVals.period);
            if (newVals.fromDate !== undefined) setFromDate(newVals.fromDate);
            if (newVals.toDate !== undefined) setToDate(newVals.toDate);
            if (newVals.driver !== undefined) setSelectedDriver(newVals.driver);
            if (newVals.corridor !== undefined) setSelectedCorridor(newVals.corridor);
            if (newVals.deliveryStatus !== undefined) setSelectedStatus(newVals.deliveryStatus);
            if (newVals.searchQuery !== undefined) setSearchQuery(newVals.searchQuery);
            setFleetFilterValues(newVals);
          }}
          onApplyFilters={(vals) => alert(`Filters applied for: ${activeReportObj.label}`)}
          onResetFilters={() => {
            const defRange = getDefaultInitialDateRange('This Month');
            setSearchQuery('');
            setSelectedDriver('ALL');
            setSelectedCorridor('ALL');
            setSelectedStatus('ALL');
            setPeriod(defRange.preset);
            setFromDate(defRange.fromDate);
            setToDate(defRange.toDate);
            setFleetFilterValues({});
          }}
        />
      }
      // 4. Standardized Data Table Area
      table={
        <>
          {/* SHEET 1: ALL DELIVERIES & DISPATCH LOGS */}
          {selectedReportKey === 'ALL_DELIVERIES' && (
            <ReportTableWrapper
              title="SuperSonic Master Deliveries & Dispatch Register"
              subtitle={`Showing live dispatch orders, couriers, and destination corridors for ${period}`}
              reportCode="REP_FLT_001"
              totalRecordsCount={filteredDeliveries.length}
              pagination={{
                currentPage,
                totalPages: totalPagesDeliveries,
                pageSize,
                totalRecords: filteredDeliveries.length,
                onPageChange: setCurrentPage,
                onPageSizeChange: setPageSize,
              }}
            >
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                    <th className="py-2 px-3 text-left w-[12%]">Waybill / Order #</th>
                    <th className="py-2 px-3 text-left w-[18%]">Customer & Phone</th>
                    <th className="py-2 px-3 text-left w-[16%]">Destination Town</th>
                    <th className="py-2 px-3 text-left w-[14%]">Corridor & Route</th>
                    <th className="py-2 px-3 text-left w-[14%]">Assigned Courier</th>
                    <th className="py-2 px-3 text-right w-[12%]">COD Goods Value</th>
                    <th className="py-2 px-3 text-center w-[8%]">Fee</th>
                    <th className="py-2 px-3 text-center w-[6%]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDeliveries.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-blue-50/20">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">
                        {order.orderNo}
                        <span className="block text-xs font-mono text-slate-600 font-medium">
                          {order.sourceType === 'SOUTHERN_OLIVE' ? 'In-House Oil' : 'External 3PL'}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-800">{order.customerName}</div>
                        <div className="font-mono text-xs text-slate-600 font-medium">{order.phone}</div>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-800">{order.destinationTown}</div>
                        <div className="text-xs text-slate-600 font-medium truncate max-w-[180px]">{order.addressDetails}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-bold text-slate-800 text-xs">
                          Corridor {order.corridorId}
                        </span>
                        <span className="block text-xs font-mono text-slate-600 font-medium">Trip #{order.tripNo}</span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-800">{order.assignedDriver}</div>
                        <div className="font-mono text-xs text-slate-600 font-medium">{order.vehiclePlate}</div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div className="font-mono font-bold text-slate-900">
                          ${order.productAmountUsd.toFixed(2)}
                        </div>
                        <div className="font-mono text-xs text-slate-600 font-medium">
                          {order.productAmountLbp > 0 ? `${order.productAmountLbp.toLocaleString()} LBP` : 'USD Only'}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                        ${order.deliveryFeeUsd.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={getReportStatusTextClass(order.status)}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold bg-slate-50">
                    <td colSpan={5} className="py-2 px-3 uppercase text-xs font-bold text-slate-900">
                      Total Filtered Deliveries ({filteredDeliveries.length} Shipments):
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ${filteredDeliveries.reduce((acc, o) => acc + o.productAmountUsd, 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                      ${filteredDeliveries.reduce((acc, o) => acc + o.deliveryFeeUsd, 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-xs text-emerald-800">
                      {Math.round((filteredDeliveries.filter((o) => o.status === 'DELIVERED').length / (filteredDeliveries.length || 1)) * 100)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </ReportTableWrapper>
          )}

          {/* SHEET 2: DRIVER PERFORMANCE & RECONCILIATION */}
          {selectedReportKey === 'DRIVER_PERFORMANCE' && (
            <ReportTableWrapper
              title="Courier Daily Performance & Trip Reconciliations"
              subtitle="Audited delivery efficiency, run counts, cash collections, and success ratings per driver"
              reportCode="REP_FLT_002"
              totalRecordsCount={driverPerformanceList.length}
            >
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                    <th className="py-2 px-3 text-left w-[18%]">Driver Full Name</th>
                    <th className="py-2 px-3 text-left w-[16%]">Assigned Vehicle Asset</th>
                    <th className="py-2 px-3 text-left w-[18%]">Primary Highway Corridor</th>
                    <th className="py-2 px-3 text-center w-[8%]">Trips</th>
                    <th className="py-2 px-3 text-center w-[8%]">Delivered</th>
                    <th className="py-2 px-3 text-center w-[8%]">Pending</th>
                    <th className="py-2 px-3 text-right w-[12%]">Cash Handover</th>
                    <th className="py-2 px-3 text-center w-[12%]">Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {driverPerformanceList.map((drv) => (
                    <tr key={drv.driverName} className="border-b border-slate-100 hover:bg-blue-50/20">
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-800">{drv.driverName}</div>
                        <div className="font-mono text-xs text-slate-600 font-medium">{drv.phone}</div>
                      </td>
                      <td className="py-2 px-3 font-mono text-xs text-slate-600 font-medium">{drv.assignedAsset}</td>
                      <td className="py-2 px-3 text-xs text-slate-800 font-medium">{drv.assignedCorridor}</td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-slate-800">
                        {drv.tripsCompleted}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-emerald-700">
                        {drv.parcelsDelivered}
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-amber-700">
                        {drv.parcelsPending}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        ${drv.cashCollectedUsd.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`font-mono font-bold text-xs ${
                              drv.successRate >= 90
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {drv.successRate}%
                          </span>
                          <span
                            className={`font-bold text-xs uppercase ${
                              drv.successRate >= 95
                                ? 'text-emerald-700'
                                : 'text-blue-700'
                            }`}
                          >
                            {drv.successRate >= 95 ? 'Elite' : 'Standard'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold bg-slate-50">
                    <td colSpan={3} className="py-2 px-3 uppercase text-xs font-bold text-slate-900">
                      Total Fleet Couriers ({driverPerformanceList.length} Active):
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                      {driverPerformanceList.reduce((acc, d) => acc + d.tripsCompleted, 0)}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-emerald-800">
                      {driverPerformanceList.reduce((acc, d) => acc + d.parcelsDelivered, 0)}
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-amber-800">
                      {driverPerformanceList.reduce((acc, d) => acc + d.parcelsPending, 0)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ${driverPerformanceList.reduce((acc, d) => acc + d.cashCollectedUsd, 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center font-bold text-xs text-emerald-800">Avg 96.4%</td>
                  </tr>
                </tfoot>
              </table>
            </ReportTableWrapper>
          )}

          {/* SHEET 3: COD, WHISH & CASH SETTLEMENTS */}
          {selectedReportKey === 'COD_SETTLEMENTS' && (
            <ReportTableWrapper
              title="SuperSonic Financial Settlements & Treasury Reconciliations"
              subtitle="Driver physical cash handovers, Whish digital transfers, and 3PL merchant disbursements"
              reportCode="REP_FLT_003"
              totalRecordsCount={filteredSettlements.length}
            >
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                    <th className="py-2 px-3 text-left w-[12%]">Voucher / Ref #</th>
                    <th className="py-2 px-3 text-left w-[14%]">Transaction Date</th>
                    <th className="py-2 px-3 text-left w-[20%]">Driver / Merchant</th>
                    <th className="py-2 px-3 text-left w-[16%]">Payment Classification</th>
                    <th className="py-2 px-3 text-right w-[14%]">Amount ($ / LBP)</th>
                    <th className="py-2 px-3 text-left w-[14%]">Destination Account</th>
                    <th className="py-2 px-3 text-center w-[10%]">Audit State</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSettlements.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 hover:bg-blue-50/20">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{log.refCode}</td>
                      <td className="py-2 px-3 font-mono text-xs text-slate-600 font-medium">{log.date}</td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-slate-800">{log.driverOrMerchant}</div>
                        <div className="text-xs text-slate-600 font-medium truncate max-w-[200px]">{log.auditNotes}</div>
                      </td>
                      <td className="py-2 px-3">
                        <span className={getPaymentMethodTextClass(log.type)}>
                          {log.type.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <div
                          className={`font-mono font-bold ${
                            log.amountUsd >= 0
                              ? 'text-slate-900'
                              : 'text-rose-700'
                          }`}
                        >
                          ${log.amountUsd.toFixed(2)}
                        </div>
                        <div className="font-mono text-xs text-slate-600 font-medium">
                          {log.amountLbp.toLocaleString()} LBP
                        </div>
                      </td>
                      <td className="py-2 px-3 font-medium text-xs text-slate-800">
                        {log.destinationAccount}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={getReportStatusTextClass(log.status)}>
                          {log.status === 'CLEARED' ? 'CLEARED' : 'PENDING AUDIT'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-900 font-bold bg-slate-50">
                    <td colSpan={4} className="py-2 px-3 uppercase text-xs font-bold text-slate-900">
                      Net Reconciled Treasury Handover:
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ${filteredSettlements.reduce((acc, s) => acc + s.amountUsd, 0).toFixed(2)}
                    </td>
                    <td colSpan={2} className="py-2 px-3 text-center text-xs font-medium text-slate-600">
                      All accounts reconciled against physical vault
                    </td>
                  </tr>
                </tfoot>
              </table>
            </ReportTableWrapper>
          )}

          {/* SHEET 4: FULFILLMENT AUDIT TRAIL */}
          {selectedReportKey === 'FULFILLMENT_AUDIT' && (
            <ReportTableWrapper
              title="Fulfillment Transition & Operational Audit Trail"
              subtitle="Full system tracking of orders converted between Fleet Delivery Dispatch and Showroom POS Pickup"
              reportCode="REP_FLT_004"
              totalRecordsCount={EXTENDED_FLEET_DELIVERIES.filter((o) => o.status === 'MOVED_TO_POS_PICKUP').length + 2}
            >
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-y-2 border-slate-900 bg-slate-50 font-bold text-slate-900 text-xs">
                    <th className="py-2 px-3 text-left w-[14%]">Order / Invoice #</th>
                    <th className="py-2 px-3 text-left w-[20%]">Customer Name</th>
                    <th className="py-2 px-3 text-right w-[12%]">Goods Value</th>
                    <th className="py-2 px-3 text-center w-[14%]">Fulfillment Action</th>
                    <th className="py-2 px-3 text-center w-[14%]">Operator Role</th>
                    <th className="py-2 px-3 text-center w-[12%]">User Code</th>
                    <th className="py-2 px-3 text-left w-[14%] font-mono">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 hover:bg-blue-50/20">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">ORD-103350</td>
                    <td className="py-2 px-3 font-medium text-slate-800">Colonel Mahmoud Abboud</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">$2,760.00</td>
                    <td className="py-2 px-3 text-center">
                      <span className="font-bold text-xs uppercase text-purple-700">
                        Moved to POS Pickup
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="font-bold text-xs uppercase text-amber-800">
                        Management
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-800 text-xs">MGR-01</td>
                    <td className="py-2 px-3 font-mono text-xs text-slate-600 font-medium">Today 09:15 AM</td>
                  </tr>
                  <tr className="border-b border-slate-100 hover:bg-blue-50/20">
                    <td className="py-2 px-3 font-mono font-bold text-slate-900">ORD-103348</td>
                    <td className="py-2 px-3 font-medium text-slate-800">Zahle Cooperative Market</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">$1,480.00</td>
                    <td className="py-2 px-3 text-center">
                      <span className="font-bold text-xs uppercase text-emerald-700">
                        Returned to Delivery
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="font-bold text-xs uppercase text-blue-700">
                        Dispatch Rep
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-800 text-xs">REP-002</td>
                    <td className="py-2 px-3 font-mono text-xs text-slate-600 font-medium">Today 10:40 AM</td>
                  </tr>
                </tbody>
              </table>
            </ReportTableWrapper>
          )}
        </>
      }
    />
  );
}
