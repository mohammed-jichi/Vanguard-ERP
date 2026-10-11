'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTenant } from '@/lib/TenantContext';
import { useLanguage } from '@/lib/LanguageContext';
import { resolveTenantRouteCode } from '@/lib/authTenantResolver';
import { usePermission } from '@/lib/PermissionContext';
import {
  MASTER_RBAC_MODULES,
  ACTION_MODALS_CONFIG,
  RESTRICTED_REPORTS_CONFIG,
  AUTHORIZED_BRANDS_DIRECTORY,
  CANONICAL_SEED_ROLES,
} from '@/lib/rbacMasterTree';
import {
  RoleDefinition,
  StandardEmployeeClassification,
  STANDARD_EMPLOYEE_CLASSIFICATIONS,
} from '@/types/rbac';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  BarChart3,
  Plus,
  Trash2,
  Search,
  Layers,
  Store,
  Boxes,
  Users,
  HeartHandshake,
  Calculator,
  UserCheck,
  Truck,
  MessageSquare,
  Flame,
  QrCode,
  FlaskConical,
  X,
  Pencil,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  Lock,
} from 'lucide-react';

const NATIVE_ROLE_IDS = ['r_super', 'r_ops', 'r_cashier', 'r_sales', 'r_accountant', 'r_driver'];

export default function RolesSettingsPage() {
  const { currentTenant } = useTenant();
  const { language, t } = useLanguage();
  const {
    roles,
    updateRole,
    deleteRole,
  } = usePermission();

  const orgId = currentTenant?.companyId ? String(currentTenant.companyId) : resolveTenantRouteCode(currentTenant?.id);

  // Tab State: 'roles' (active) | 'manage_access'
  const [activeTab, setActiveTab] = useState<'roles' | 'manage_access'>('roles');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMenuFilter, setSelectedMenuFilter] = useState<string>('all');

  // Pagination State for Master Roles View
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Manage Role Modal State
  const [isManageRoleModalOpen, setIsManageRoleModalOpen] = useState<boolean>(false);
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [isNewRole, setIsNewRole] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Tree Collapsible State inside Modal / Inline (all modules expanded by default or toggled)
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
    11: false,
    12: false,
  });

  // Nested Sub-Modals State
  const [actionModalTarget, setActionModalTarget] = useState<{
    modalKey: string;
    nodeName: string;
    nodeNameAr: string;
  } | null>(null);

  const [reportsModalTarget, setReportsModalTarget] = useState<{
    modalKey: string;
    nodeName: string;
    nodeNameAr: string;
  } | null>(null);

  const [isBrandModalOpen, setIsBrandModalOpen] = useState<boolean>(false);
  const [selectedBrandToAdd, setSelectedBrandToAdd] = useState<string>(
    AUTHORIZED_BRANDS_DIRECTORY[0]?.id || ''
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper to toggle module expand/collapse
  const toggleModuleExpand = (modNumber: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modNumber]: !prev[modNumber],
    }));
  };

  // Helper to expand or collapse all
  const setAllModulesExpand = (expanded: boolean) => {
    const next: Record<number, boolean> = {};
    MASTER_RBAC_MODULES.forEach((m) => {
      next[m.moduleNumber] = expanded;
    });
    setExpandedModules(next);
  };

  // --------------------------------------------------------------------------
  // ROLE EDITING & MODAL HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenEditRoleModal = (role: RoleDefinition) => {
    setIsNewRole(false);
    // Deep clone role for staging
    setEditingRole(JSON.parse(JSON.stringify(role)));
    setIsManageRoleModalOpen(true);
  };

  const handleOpenNewRoleModal = () => {
    setIsNewRole(true);
    const newId = `r_${Date.now()}`;
    const baseRole = roles.find((r) => r.id === 'r_ops') || CANONICAL_SEED_ROLES[1];

    const blankRole: RoleDefinition = {
      id: newId,
      name: '',
      description: '',
      employee_role: 'MANAGER',
      is_read_only: false,
      permissions: baseRole ? JSON.parse(JSON.stringify(baseRole.permissions || {})) : {},
      action_overrides: baseRole ? JSON.parse(JSON.stringify(baseRole.action_overrides || {})) : {},
      restricted_reports: baseRole ? JSON.parse(JSON.stringify(baseRole.restricted_reports || {})) : {},
      brand_access: ['brand_southern_olive'],
      assignedCount: 0,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };

    setEditingRole(blankRole);
    setIsManageRoleModalOpen(true);
  };

  const handleCloseManageRoleModal = () => {
    setIsManageRoleModalOpen(false);
    setEditingRole(null);
  };

  const handleSaveRole = async (targetRole: RoleDefinition | null) => {
    if (!targetRole) return;
    if (!targetRole.name.trim()) {
      showToast('Please provide a role description / title');
      return;
    }

    setIsSaving(true);
    try {
      const roleToSave: RoleDefinition = {
        ...targetRole,
        name: targetRole.name.trim(),
        description: targetRole.description?.trim() || targetRole.name.trim(),
      };

      await updateRole(roleToSave);
      showToast(`Role "${roleToSave.name}" successfully saved!`);
      setIsManageRoleModalOpen(false);
      setEditingRole(null);
    } catch (err) {
      console.error('Failed to save role:', err);
      showToast('Error saving role permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async (role: RoleDefinition) => {
    if (NATIVE_ROLE_IDS.includes(role.id)) {
      alert('Native system roles cannot be deleted.');
      return;
    }

    if (window.confirm(`Are you sure you want to delete role "${role.name}"?`)) {
      await deleteRole(role.id);
      showToast(`Role "${role.name}" deleted.`);
    }
  };

  // --------------------------------------------------------------------------
  // PERMISSION TOGGLES FOR ACTIVE EDITING ROLE
  // --------------------------------------------------------------------------
  const handleToggleNodeAction = (
    nodeId: string,
    action: 'view' | 'add' | 'edit' | 'delete'
  ) => {
    if (!editingRole) return;
    if (editingRole.id === 'r_super') {
      showToast('Super Administrator permissions are immutable.');
      return;
    }

    const currentPerm = editingRole.permissions?.[nodeId] || {
      view: false,
      add: false,
      edit: false,
      delete: false,
    };

    const nextVal = !Boolean(currentPerm[action]);

    setEditingRole({
      ...editingRole,
      permissions: {
        ...(editingRole.permissions || {}),
        [nodeId]: {
          ...currentPerm,
          [action]: nextVal,
        },
      },
    });
  };

  const handleBatchToggleModuleInModal = (modNumber: number, action: 'view' | 'add' | 'edit' | 'delete', state: boolean) => {
    if (!editingRole) return;
    if (editingRole.id === 'r_super') return;

    const mod = MASTER_RBAC_MODULES.find((m) => m.moduleNumber === modNumber);
    if (!mod) return;

    const updatedPermissions = { ...(editingRole.permissions || {}) };
    for (const node of mod.nodes) {
      const existing = updatedPermissions[node.id] || { view: false, add: false, edit: false, delete: false };
      updatedPermissions[node.id] = {
        ...existing,
        [action]: state,
      };
    }

    setEditingRole({
      ...editingRole,
      permissions: updatedPermissions,
    });
  };

  // Action Overrides (Sliders Modal)
  const handleToggleActionOverride = (modalKey: string, actionId: string) => {
    if (!editingRole) return;
    const currentOverrides = editingRole.action_overrides?.[modalKey] || {};
    const defaultVal = ACTION_MODALS_CONFIG[modalKey]?.options.find((o) => o.id === actionId)?.defaultVal ?? false;
    const currentVal = typeof currentOverrides[actionId] === 'boolean' ? currentOverrides[actionId] : defaultVal;

    setEditingRole({
      ...editingRole,
      action_overrides: {
        ...(editingRole.action_overrides || {}),
        [modalKey]: {
          ...currentOverrides,
          [actionId]: !currentVal,
        },
      },
    });
  };

  // Restricted Reports (Bar Chart Modal)
  const handleToggleRestrictedReport = (modalKey: string, reportId: string) => {
    if (!editingRole) return;
    const existing = editingRole.restricted_reports?.[modalKey] || [];
    const nextList = existing.includes(reportId)
      ? existing.filter((id) => id !== reportId)
      : [...existing, reportId];

    setEditingRole({
      ...editingRole,
      restricted_reports: {
        ...(editingRole.restricted_reports || {}),
        [modalKey]: nextList,
      },
    });
  };

  const handleBatchToggleReports = (modalKey: string, selectAll: boolean) => {
    if (!editingRole) return;
    const allIds = RESTRICTED_REPORTS_CONFIG[modalKey]?.reports.map((r) => r.id) || [];
    setEditingRole({
      ...editingRole,
      restricted_reports: {
        ...(editingRole.restricted_reports || {}),
        [modalKey]: selectAll ? allIds : [],
      },
    });
  };

  // Brands Modal
  const handleAddBrandAccess = (brandId: string) => {
    if (!editingRole) return;
    const brands = editingRole.brand_access || [];
    if (brands.includes(brandId)) return;

    setEditingRole({
      ...editingRole,
      brand_access: [...brands, brandId],
    });
  };

  const handleRemoveBrandAccess = (brandId: string) => {
    if (!editingRole) return;
    const brands = editingRole.brand_access || [];
    setEditingRole({
      ...editingRole,
      brand_access: brands.filter((b) => b !== brandId),
    });
  };

  // --------------------------------------------------------------------------
  // FILTERED ROLES FOR MASTER ROLES VIEW
  // --------------------------------------------------------------------------
  const filteredRoles = useMemo(() => {
    let result = [...roles];

    // Search query filter (name or description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.employee_role?.toLowerCase().includes(q)
      );
    }

    // Menu dropdown filter
    if (selectedMenuFilter !== 'all') {
      const modNum = parseInt(selectedMenuFilter, 10);
      const targetMod = MASTER_RBAC_MODULES.find((m) => m.moduleNumber === modNum);
      if (targetMod) {
        result = result.filter((r) => {
          if (r.id === 'r_super') return true;
          return targetMod.nodes.some((n) => {
            const perm = r.permissions?.[n.id];
            return perm && (perm.view || perm.add || perm.edit || perm.delete);
          });
        });
      }
    }

    return result;
  }, [roles, searchQuery, selectedMenuFilter]);

  const totalFilteredRoles = filteredRoles.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredRoles / pageSize));
  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoles.slice(start, start + pageSize);
  }, [filteredRoles, currentPage, pageSize]);

  // Render module icon helper
  const renderModuleIcon = (iconName: string) => {
    const props = { className: 'w-4 h-4 shrink-0 text-slate-600' };
    switch (iconName) {
      case 'Store': return <Store {...props} />;
      case 'Boxes': return <Boxes {...props} />;
      case 'Users': return <Users {...props} />;
      case 'HeartHandshake': return <HeartHandshake {...props} />;
      case 'Calculator': return <Calculator {...props} />;
      case 'UserCheck': return <UserCheck {...props} />;
      case 'Truck': return <Truck {...props} />;
      case 'MessageSquare': return <MessageSquare {...props} />;
      case 'Flame': return <Flame {...props} />;
      case 'QrCode': return <QrCode {...props} />;
      case 'FlaskConical': return <FlaskConical {...props} />;
      case 'ShieldAlert': return <Shield {...props} />;
      default: return <Layers {...props} />;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-70 flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 animate-slideDown">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Roles & Permissions</h1>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
          <Link prefetch={false} href={`/backoffice?orgId=${orgId}`} className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">Roles & Permissions</span>
        </div>
      </div>

      {/* Tabs: Roles (active) & Manage Role access */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'roles'
              ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Roles
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('manage_access');
            if (!editingRole) {
              setEditingRole(JSON.parse(JSON.stringify(roles[0] || CANONICAL_SEED_ROLES[0])));
            }
          }}
          className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'manage_access'
              ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Manage Role access
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: MASTER ROLES VIEW                                             */}
      {/* ==================================================================== */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 outline-hidden focus:bg-white focus:border-primary"
                />
              </div>

              {/* Select Menu Dropdown */}
              <select
                value={selectedMenuFilter}
                onChange={(e) => {
                  setSelectedMenuFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 outline-hidden focus:bg-white focus:border-primary cursor-pointer"
              >
                <option value="all">Select Menu</option>
                {MASTER_RBAC_MODULES.map((m) => (
                  <option key={m.moduleNumber} value={m.moduleNumber}>
                    {m.name.replace(/^Module \d+:\s*/, '')}
                  </option>
                ))}
              </select>
            </div>

            {/* + New Button on right */}
            <button
              type="button"
              onClick={handleOpenNewRoleModal}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New</span>
            </button>
          </div>

          {/* Roles Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10.5px] tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 w-16 text-center">#</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5 text-right w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {paginatedRoles.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-10 text-slate-400 text-xs">
                        No roles match the selected filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedRoles.map((role, idx) => {
                      const rowNum = (currentPage - 1) * pageSize + idx + 1;
                      const isNative = NATIVE_ROLE_IDS.includes(role.id);

                      return (
                        <tr key={role.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5 text-center font-mono text-slate-400 font-bold">
                            {rowNum}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-sm">
                                {role.name}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                  isNative
                                    ? 'bg-slate-100 text-slate-700 border-slate-200'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                }`}
                              >
                                {isNative ? 'Native' : 'Custom'}
                              </span>
                              {role.is_read_only && (
                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                  Read Only
                                </span>
                              )}
                              {role.id === 'r_super' && (
                                <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Master
                                </span>
                              )}
                            </div>
                            {role.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                                {role.description}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditRoleModal(role)}
                                title="Edit Role"
                                className="p-1.5 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              {!isNative && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRole(role)}
                                  title="Delete Role"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination */}
            <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
              <div>
                Showing {totalFilteredRoles === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, totalFilteredRoles)} of {totalFilteredRoles} entries
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                >
                  « Prev
                </button>
                <span className="px-2.5 py-1 bg-primary text-white rounded-lg text-xs font-bold">
                  {currentPage}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                >
                  Next »
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: MANAGE ROLE ACCESS (Inline Tree View)                         */}
      {/* ==================================================================== */}
      {activeTab === 'manage_access' && editingRole && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Manage Role Access
              </h2>
              <p className="text-xs text-slate-500">
                Directly configure 12-Module access permissions, actions, and restricted reports.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-600">Select Role:</label>
              <select
                value={editingRole.id}
                onChange={(e) => {
                  const found = roles.find((r) => r.id === e.target.value);
                  if (found) setEditingRole(JSON.parse(JSON.stringify(found)));
                }}
                className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-hidden cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Top Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div className="md:col-span-5 space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">Description</label>
              <input
                type="text"
                value={editingRole.name}
                onChange={(e) =>
                  setEditingRole({
                    ...editingRole,
                    name: e.target.value,
                    description: editingRole.description === editingRole.name ? e.target.value : editingRole.description,
                  })
                }
                className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-900 outline-hidden"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">Employee Role</label>
              <select
                value={editingRole.employee_role}
                onChange={(e) =>
                  setEditingRole({
                    ...editingRole,
                    employee_role: e.target.value as StandardEmployeeClassification,
                  })
                }
                className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-900 outline-hidden"
              >
                <option value="CASHIER">CASHIER</option>
                <option value="Delivery">Delivery</option>
                <option value="Finance department manager">Finance department manager</option>
                <option value="MANAGER">MANAGER</option>
                <option value="sales">sales</option>
                {STANDARD_EMPLOYEE_CLASSIFICATIONS.filter(
                  (c) => !['CASHIER', 'Delivery', 'Finance department manager', 'MANAGER', 'sales'].includes(c.value)
                ).map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-3 flex items-center md:justify-end pt-3 md:pt-0">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={Boolean(editingRole.is_read_only)}
                  onChange={(e) =>
                    setEditingRole({
                      ...editingRole,
                      is_read_only: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">Read Only</span>
              </label>
            </div>
          </div>

          {/* Collapsible 12-Module Hierarchy Tree */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
            <div className="p-3 bg-slate-100/70 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Enterprise RBAC Modules (12 Modules)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAllModulesExpand(true)}
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  Expand All
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setAllModulesExpand(false)}
                  className="text-[11px] font-bold text-slate-500 hover:underline"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {MASTER_RBAC_MODULES.map((mod) => {
              const isExpanded = expandedModules[mod.moduleNumber];

              return (
                <div key={mod.moduleNumber} className="bg-white">
                  {/* Module Accordion Header */}
                  <div
                    onClick={() => toggleModuleExpand(mod.moduleNumber)}
                    className="p-3.5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors cursor-pointer select-none border-b border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                      <div className="w-6 h-6 rounded-lg bg-slate-200/70 flex items-center justify-center">
                        {renderModuleIcon(mod.icon)}
                      </div>
                      <span className="font-extrabold text-xs text-slate-900">
                        {mod.moduleNumber}. {mod.name.replace(/^Module \d+:\s*/, '')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({mod.nodes.length} features)
                      </span>
                    </div>

                    <div
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleBatchToggleModuleInModal(mod.moduleNumber, 'view', true)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        + All View
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBatchToggleModuleInModal(mod.moduleNumber, 'view', false)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                      >
                        - Clear
                      </button>
                    </div>
                  </div>

                  {/* Module Nodes Table */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100">
                          <tr>
                            <th className="px-5 py-2.5">Sub-Feature / Node</th>
                            <th className="px-3 py-2.5 text-center w-16">View</th>
                            {!editingRole.is_read_only && (
                              <>
                                <th className="px-3 py-2.5 text-center w-16">Add</th>
                                <th className="px-3 py-2.5 text-center w-16">Edit</th>
                                <th className="px-3 py-2.5 text-center w-16">Delete</th>
                              </>
                            )}
                            <th className="px-4 py-2.5 text-right w-40">Sub-Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {mod.nodes.map((node) => {
                            const perm = editingRole.permissions?.[node.id] || {
                              view: false,
                              add: false,
                              edit: false,
                              delete: false,
                            };

                            return (
                              <tr key={node.id} className="hover:bg-slate-50/50">
                                <td className="px-5 py-2.5">
                                  <div className="font-bold text-slate-800 text-xs">
                                    {node.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {node.nameAr}
                                  </div>
                                </td>

                                {/* View Checkbox */}
                                <td className="px-3 py-2.5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(perm.view)}
                                    onChange={() => handleToggleNodeAction(node.id, 'view')}
                                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                                  />
                                </td>

                                {/* Add / Edit / Delete Checkboxes - Hidden if is_read_only */}
                                {!editingRole.is_read_only && (
                                  <>
                                    <td className="px-3 py-2.5 text-center">
                                      {node.hasActions !== false ? (
                                        <input
                                          type="checkbox"
                                          checked={Boolean(perm.add)}
                                          onChange={() => handleToggleNodeAction(node.id, 'add')}
                                          className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                                        />
                                      ) : (
                                        <span className="text-slate-300">—</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                      {node.hasActions !== false ? (
                                        <input
                                          type="checkbox"
                                          checked={Boolean(perm.edit)}
                                          onChange={() => handleToggleNodeAction(node.id, 'edit')}
                                          className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                                        />
                                      ) : (
                                        <span className="text-slate-300">—</span>
                                      )}
                                    </td>
                                    <td className="px-3 py-2.5 text-center">
                                      {node.hasActions !== false ? (
                                        <input
                                          type="checkbox"
                                          checked={Boolean(perm.delete)}
                                          onChange={() => handleToggleNodeAction(node.id, 'delete')}
                                          className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                                        />
                                      ) : (
                                        <span className="text-slate-300">—</span>
                                      )}
                                    </td>
                                  </>
                                )}

                                {/* Sub-Actions Trigger Buttons (Sliders & Bar Chart & Brands) */}
                                <td className="px-4 py-2.5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {/* Sliders Icon (Action Modal) */}
                                    {node.actionModalKey && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setActionModalTarget({
                                            modalKey: node.actionModalKey!,
                                            nodeName: node.name,
                                            nodeNameAr: node.nameAr,
                                          })
                                        }
                                        title="Configure line-specific action permissions"
                                        className="p-1 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                                      >
                                        <Sliders className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {/* Bar Chart Icon (Restricted Access Modal) */}
                                    {node.reportsModalKey && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setReportsModalTarget({
                                            modalKey: node.reportsModalKey!,
                                            nodeName: node.name,
                                            nodeNameAr: node.nameAr,
                                          })
                                        }
                                        title="Configure report restrictions"
                                        className="p-1 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                                      >
                                        <BarChart3 className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {/* Brand Access Button (Product Request) */}
                                    {(node.hasBrandAccessModal || node.id === 'm2_product_request') && (
                                      <button
                                        type="button"
                                        onClick={() => setIsBrandModalOpen(true)}
                                        title="Select authorized brands"
                                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[10px] font-bold cursor-pointer"
                                      >
                                        <Store className="w-3.5 h-3.5" />
                                        <span>Brands ({editingRole.brand_access?.length || 0})</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 flex items-center justify-end">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveRole(editingRole)}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              <span>{isSaving ? 'Saving Changes...' : 'Save Role Permissions'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MANAGE ROLE MODAL (Triggered by Pencil / + New)                      */}
      {/* ==================================================================== */}
      {isManageRoleModalOpen && editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={handleCloseManageRoleModal}
          />
          <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col z-10 animate-zoomIn overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Manage Role
              </h2>
              <button
                type="button"
                onClick={handleCloseManageRoleModal}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Top Controls: Description, Employee Role, Read Only */}
            <div className="p-5 border-b border-slate-100 bg-white grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Description */}
              <div className="md:col-span-5 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Description
                </label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingRole({
                      ...editingRole,
                      name: val,
                      description: editingRole.description === editingRole.name ? val : editingRole.description,
                    });
                  }}
                  placeholder="Manager"
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-hidden focus:bg-white focus:border-primary"
                />
              </div>

              {/* Employee Role */}
              <div className="md:col-span-4 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Employee Role
                </label>
                <select
                  value={editingRole.employee_role}
                  onChange={(e) =>
                    setEditingRole({
                      ...editingRole,
                      employee_role: e.target.value as StandardEmployeeClassification,
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-hidden focus:bg-white focus:border-primary cursor-pointer"
                >
                  <option value="CASHIER">CASHIER</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Finance department manager">Finance department manager</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="sales">sales</option>
                  {STANDARD_EMPLOYEE_CLASSIFICATIONS.filter(
                    (c) => !['CASHIER', 'Delivery', 'Finance department manager', 'MANAGER', 'sales'].includes(c.value)
                  ).map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Read Only Checkbox */}
              <div className="md:col-span-3 flex items-center md:justify-end pt-3 md:pt-0">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(editingRole.is_read_only)}
                    onChange={(e) =>
                      setEditingRole({
                        ...editingRole,
                        is_read_only: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700">Read Only</span>
                </label>
              </div>
            </div>

            {/* Modules Hierarchy Tree */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                <span>Enterprise Modules Hierarchy</span>
                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setAllModulesExpand(true)}
                    className="text-primary hover:underline font-bold"
                  >
                    Expand All
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setAllModulesExpand(false)}
                    className="text-slate-500 hover:underline font-bold"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {MASTER_RBAC_MODULES.map((mod) => {
                  const isExpanded = expandedModules[mod.moduleNumber];

                  return (
                    <div key={mod.moduleNumber} className="bg-white">
                      {/* Module Header Row */}
                      <div
                        onClick={() => toggleModuleExpand(mod.moduleNumber)}
                        className="p-3.5 flex items-center justify-between bg-slate-50/80 hover:bg-slate-100/70 transition-colors cursor-pointer select-none border-b border-slate-100"
                      >
                        <div className="flex items-center gap-2.5">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-500" />
                          )}
                          <div className="w-6 h-6 rounded-lg bg-slate-200/80 flex items-center justify-center">
                            {renderModuleIcon(mod.icon)}
                          </div>
                          <span className="font-extrabold text-xs text-slate-900">
                            {mod.moduleNumber}. {mod.name.replace(/^Module \d+:\s*/, '')}
                          </span>
                        </div>

                        <div
                          className="flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleBatchToggleModuleInModal(mod.moduleNumber, 'view', true)}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                          >
                            + All View
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBatchToggleModuleInModal(mod.moduleNumber, 'view', false)}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                          >
                            - Clear
                          </button>
                        </div>
                      </div>

                      {/* Module Nodes List / Table */}
                      {isExpanded && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 border-b border-slate-100">
                              <tr>
                                <th className="px-5 py-2.5">Sub-Feature</th>
                                <th className="px-3 py-2.5 text-center w-16">View</th>
                                {!editingRole.is_read_only && (
                                  <>
                                    <th className="px-3 py-2.5 text-center w-16">Add</th>
                                    <th className="px-3 py-2.5 text-center w-16">Edit</th>
                                    <th className="px-3 py-2.5 text-center w-16">Delete</th>
                                  </>
                                )}
                                <th className="px-4 py-2.5 text-right w-40">Sub-Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {mod.nodes.map((node) => {
                                const perm = editingRole.permissions?.[node.id] || {
                                  view: false,
                                  add: false,
                                  edit: false,
                                  delete: false,
                                };

                                return (
                                  <tr key={node.id} className="hover:bg-slate-50/50">
                                    <td className="px-5 py-2.5">
                                      <div className="font-bold text-slate-800 text-xs">
                                        {node.name}
                                      </div>
                                      <div className="text-[10px] text-slate-400">
                                        {node.nameAr}
                                      </div>
                                    </td>

                                    {/* View Checkbox */}
                                    <td className="px-3 py-2.5 text-center">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(perm.view)}
                                        onChange={() => handleToggleNodeAction(node.id, 'view')}
                                        className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                                      />
                                    </td>

                                    {/* Add / Edit / Delete Checkboxes (Hidden when Read Only) */}
                                    {!editingRole.is_read_only && (
                                      <>
                                        <td className="px-3 py-2.5 text-center">
                                          {node.hasActions !== false ? (
                                            <input
                                              type="checkbox"
                                              checked={Boolean(perm.add)}
                                              onChange={() => handleToggleNodeAction(node.id, 'add')}
                                              className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                                            />
                                          ) : (
                                            <span className="text-slate-300">—</span>
                                          )}
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                          {node.hasActions !== false ? (
                                            <input
                                              type="checkbox"
                                              checked={Boolean(perm.edit)}
                                              onChange={() => handleToggleNodeAction(node.id, 'edit')}
                                              className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                                            />
                                          ) : (
                                            <span className="text-slate-300">—</span>
                                          )}
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                          {node.hasActions !== false ? (
                                            <input
                                              type="checkbox"
                                              checked={Boolean(perm.delete)}
                                              onChange={() => handleToggleNodeAction(node.id, 'delete')}
                                              className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                                            />
                                          ) : (
                                            <span className="text-slate-300">—</span>
                                          )}
                                        </td>
                                      </>
                                    )}

                                    {/* Sub-action Triggers: ALWAYS VISIBLE */}
                                    <td className="px-4 py-2.5 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {/* Sliders Icon (Action Modal) */}
                                        {node.actionModalKey && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setActionModalTarget({
                                                modalKey: node.actionModalKey!,
                                                nodeName: node.name,
                                                nodeNameAr: node.nameAr,
                                              })
                                            }
                                            title="Configure line-specific action permissions"
                                            className="p-1 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                                          >
                                            <Sliders className="w-3.5 h-3.5" />
                                          </button>
                                        )}

                                        {/* Bar Chart Icon (Restricted Access Modal) */}
                                        {node.reportsModalKey && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setReportsModalTarget({
                                                modalKey: node.reportsModalKey!,
                                                nodeName: node.name,
                                                nodeNameAr: node.nameAr,
                                              })
                                            }
                                            title="Configure report restrictions"
                                            className="p-1 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                                          >
                                            <BarChart3 className="w-3.5 h-3.5" />
                                          </button>
                                        )}

                                        {/* Brands Access Button */}
                                        {(node.hasBrandAccessModal || node.id === 'm2_product_request') && (
                                          <button
                                            type="button"
                                            onClick={() => setIsBrandModalOpen(true)}
                                            title="Select authorized brands"
                                            className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[10px] font-bold cursor-pointer"
                                          >
                                            <Store className="w-3.5 h-3.5" />
                                            <span>Brands ({editingRole.brand_access?.length || 0})</span>
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer: Cancel & Save */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/80">
              <button
                type="button"
                onClick={handleCloseManageRoleModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleSaveRole(editingRole)}
                className="flex items-center gap-1.5 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-MODAL 1: INLINE ACTIONS MODAL (Sliders Icon)                      */}
      {/* ==================================================================== */}
      {actionModalTarget && editingRole && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setActionModalTarget(null)}
          />
          <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col z-10 animate-zoomIn overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    {ACTION_MODALS_CONFIG[actionModalTarget.modalKey]?.title || actionModalTarget.nodeName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {ACTION_MODALS_CONFIG[actionModalTarget.modalKey]?.titleAr || actionModalTarget.nodeNameAr}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActionModalTarget(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto divide-y divide-slate-100 space-y-1">
              {(ACTION_MODALS_CONFIG[actionModalTarget.modalKey]?.options || []).map((opt) => {
                const isOverridden = editingRole.action_overrides?.[actionModalTarget.modalKey]?.[opt.id];
                const isChecked = typeof isOverridden === 'boolean' ? isOverridden : opt.defaultVal;

                return (
                  <div
                    key={opt.id}
                    className="py-2.5 flex items-start justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                        <span>{opt.name}</span>
                        <span className="text-slate-400 font-normal text-[11px]">({opt.nameAr})</span>
                      </div>
                      <p className="text-[11px] text-slate-500">{opt.description}</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleActionOverride(actionModalTarget.modalKey, opt.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/70">
              <button
                type="button"
                onClick={() => setActionModalTarget(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-MODAL 2: RESTRICTED ACCESS MODAL (Bar Chart Icon)                 */}
      {/* ==================================================================== */}
      {reportsModalTarget && editingRole && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setReportsModalTarget(null)}
          />
          <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col z-10 animate-zoomIn overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    {RESTRICTED_REPORTS_CONFIG[reportsModalTarget.modalKey]?.title || reportsModalTarget.nodeName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {RESTRICTED_REPORTS_CONFIG[reportsModalTarget.modalKey]?.titleAr || reportsModalTarget.nodeNameAr}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setReportsModalTarget(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-2.5 bg-emerald-50/40 border-b border-emerald-100/60 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium text-[11.5px]">
                Select sensitive reports and analytics permitted for this role.
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleBatchToggleReports(reportsModalTarget.modalKey, true)}
                  className="px-2.5 py-0.5 bg-white text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200 hover:bg-emerald-50 cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchToggleReports(reportsModalTarget.modalKey, false)}
                  className="px-2.5 py-0.5 bg-white text-slate-600 rounded-md text-[10px] font-bold border border-slate-200 hover:bg-slate-100 cursor-pointer"
                >
                  Unselect All
                </button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-2">
              {(RESTRICTED_REPORTS_CONFIG[reportsModalTarget.modalKey]?.reports || []).map((rep) => {
                const allowedList = editingRole.restricted_reports?.[reportsModalTarget.modalKey] || [];
                const isChecked = allowedList.includes(rep.id);

                return (
                  <label
                    key={rep.id}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRestrictedReport(reportsModalTarget.modalKey, rep.id)}
                        className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-extrabold text-slate-900">{rep.name}</div>
                        <div className="text-[10.5px] text-slate-400">{rep.nameAr}</div>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-600">
                      {rep.category}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/70">
              <button
                type="button"
                onClick={() => setReportsModalTarget(null)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Apply & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SUB-MODAL 3: BRAND ACCESS MODAL (Store / Brands Button)              */}
      {/* ==================================================================== */}
      {isBrandModalOpen && editingRole && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsBrandModalOpen(false)}
          />
          <div className="relative bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col z-10 animate-zoomIn overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">
                    Authorized Brands (Product Requests)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Select brand scopes authorized for this role
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 border-b border-slate-100 bg-amber-50/30 flex items-center gap-2">
              <select
                value={selectedBrandToAdd}
                onChange={(e) => setSelectedBrandToAdd(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-900 outline-hidden"
              >
                {AUTHORIZED_BRANDS_DIRECTORY.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nameEn} ({b.nameAr})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => handleAddBrandAccess(selectedBrandToAdd)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add</span>
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-2 flex-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Assigned Brand Scopes ({editingRole.brand_access?.length || 0})
              </div>

              {(!editingRole.brand_access || editingRole.brand_access.length === 0) ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  All brands accessible by default.
                </div>
              ) : (
                editingRole.brand_access.map((bId) => {
                  const brandMeta = AUTHORIZED_BRANDS_DIRECTORY.find((b) => b.id === bId);
                  return (
                    <div
                      key={bId}
                      className="p-3 rounded-2xl border border-slate-200 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-extrabold text-slate-900">
                          {brandMeta ? brandMeta.nameEn : bId}
                        </div>
                        <div className="text-[10.5px] text-slate-400">
                          {brandMeta ? brandMeta.nameAr : bId}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Authorized
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBrandAccess(bId)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/70">
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
