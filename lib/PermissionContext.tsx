'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { RoleDefinition } from '@/types/rbac';
import { CANONICAL_SEED_ROLES, MASTER_RBAC_MODULES, ACTION_MODALS_CONFIG } from '@/lib/rbacMasterTree';

interface PermissionContextType {
  roles: RoleDefinition[];
  activeRole: RoleDefinition;
  activeRoleId: string;
  setActiveRoleId: (id: string) => void;
  isLoading: boolean;
  canAccess: (moduleKey: string, action?: 'view' | 'add' | 'edit' | 'delete', nodeId?: string) => boolean;
  canExecuteAction: (modalKey: string, actionId: string) => boolean;
  canViewReport: (reportsModalKey: string, reportId: string) => boolean;
  hasBrandAccess: (brandId: string, action?: 'view' | 'request') => boolean;
  updateRole: (role: RoleDefinition) => Promise<boolean>;
  deleteRole: (id: string) => Promise<boolean>;
  refreshRoles: () => Promise<void>;
  isReadOnly: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

const STORAGE_ACTIVE_ROLE_KEY = 'vanguard_active_role_id';

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<RoleDefinition[]>(CANONICAL_SEED_ROLES);
  const [activeRoleId, setActiveRoleIdState] = useState<string>('r_super');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize active role from storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedRoleId = localStorage.getItem(STORAGE_ACTIVE_ROLE_KEY);
      if (savedRoleId) {
        setActiveRoleIdState(savedRoleId);
      }
    }
  }, []);

  const refreshRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/rbac/roles');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.roles) && data.roles.length > 0) {
          setRoles(data.roles);
        }
      }
    } catch (err) {
      console.warn('[PermissionContext] Failed to fetch roles from API, using fallback:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRoles();
  }, [refreshRoles]);

  const setActiveRoleId = useCallback((id: string) => {
    setActiveRoleIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ACTIVE_ROLE_KEY, id);
    }
  }, []);

  const activeRole: RoleDefinition =
    roles.find((r) => r.id === activeRoleId) ||
    roles.find((r) => r.id === 'r_super') ||
    CANONICAL_SEED_ROLES[0];

  const isReadOnly = Boolean(activeRole?.is_read_only);

  /**
   * Check whether the active role can access a module, action, or specific node
   */
  const canAccess = useCallback(
    (moduleKey: string, action: 'view' | 'add' | 'edit' | 'delete' = 'view', nodeId?: string): boolean => {
      if (!activeRole) return true;

      // Super Administrator always has full permission
      if (activeRole.id === 'r_super') {
        return true;
      }

      // If role is set to Read Only, mutation actions are instantly denied
      if (activeRole.is_read_only && (action === 'add' || action === 'edit' || action === 'delete')) {
        return false;
      }

      // If checking a specific node
      if (nodeId) {
        const nodePerm = activeRole.permissions?.[nodeId];
        if (nodePerm && typeof nodePerm[action] === 'boolean') {
          return nodePerm[action]!;
        }
        return action === 'view';
      }

      // If checking at module level without specific node:
      // Find the module in the master tree
      const mod = MASTER_RBAC_MODULES.find(
        (m: any) => m.moduleCode === moduleKey || m.moduleCode.replace(/^mod\d+_/, '') === moduleKey
      );
      if (!mod) {
        return true;
      }

      // If action is view, check if at least one node in this module has view permission
      if (action === 'view') {
        return mod.nodes.some((node: any) => {
          const perm = activeRole.permissions?.[node.id];
          return perm?.view ?? true;
        });
      }

      // For add/edit/delete at module level
      return mod.nodes.some((node: any) => {
        const perm = activeRole.permissions?.[node.id];
        return Boolean(perm?.[action]);
      });
    },
    [activeRole]
  );

  /**
   * Check granular action overrides (Sliders modal options)
   */
  const canExecuteAction = useCallback(
    (modalKey: string, actionId: string): boolean => {
      if (!activeRole || activeRole.id === 'r_super') {
        return true;
      }

      // Check role's action_overrides for this modalKey
      const overrideVal = activeRole.action_overrides?.[modalKey]?.[actionId];
      if (typeof overrideVal === 'boolean') {
        return overrideVal;
      }

      // Fallback: check other modals in action_overrides
      for (const overrides of Object.values(activeRole.action_overrides || {})) {
        if (typeof overrides?.[actionId] === 'boolean') {
          return overrides[actionId];
        }
      }

      // Fallback to configuration default value
      const modalCfg = ACTION_MODALS_CONFIG[modalKey];
      if (modalCfg) {
        const opt = modalCfg.options.find((o) => o.id === actionId);
        if (opt) return opt.defaultVal;
      }

      return false;
    },
    [activeRole]
  );

  /**
   * Check restricted reports (Chart modal)
   */
  const canViewReport = useCallback(
    (reportsModalKey: string, reportId: string): boolean => {
      if (!activeRole || activeRole.id === 'r_super') {
        return true;
      }

      // Check role's restricted_reports for this reportsModalKey
      const allowedReports = activeRole.restricted_reports?.[reportsModalKey];
      if (Array.isArray(allowedReports)) {
        return allowedReports.includes(reportId);
      }

      // Fallback: check all restricted_reports entries
      for (const list of Object.values(activeRole.restricted_reports || {})) {
        if (Array.isArray(list) && list.includes(reportId)) {
          return true;
        }
      }

      return false;
    },
    [activeRole]
  );

  /**
   * Check multi-brand authorized access (Product Request)
   */
  const hasBrandAccess = useCallback(
    (brandId: string, action: 'view' | 'request' = 'view'): boolean => {
      if (!activeRole || activeRole.id === 'r_super') {
        return true;
      }

      if (!activeRole.brand_access || activeRole.brand_access.length === 0) {
        return true;
      }

      return activeRole.brand_access.includes(brandId);
    },
    [activeRole]
  );

  /**
   * Update role definition and persist
   */
  const updateRole = useCallback(async (role: RoleDefinition): Promise<boolean> => {
    try {
      // Optimistic update
      setRoles((prev) => {
        const idx = prev.findIndex((r) => r.id === role.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = role;
          return updated;
        }
        return [...prev, role];
      });

      const res = await fetch('/api/rbac/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!res.ok) {
        console.error('[PermissionContext] Failed to persist role:', await res.text());
        return false;
      }

      const data = await res.json();
      if (data.roles) {
        setRoles(data.roles);
      }
      return true;
    } catch (err) {
      console.error('[PermissionContext] Error updating role:', err);
      return false;
    }
  }, []);

  /**
   * Delete role definition
   */
  const deleteRole = useCallback(async (id: string): Promise<boolean> => {
    if (id === 'r_super') {
      alert('Super Administrator role cannot be deleted');
      return false;
    }

    try {
      setRoles((prev) => prev.filter((r) => r.id !== id));
      if (activeRoleId === id) {
        setActiveRoleId('r_super');
      }

      const res = await fetch(`/api/rbac/roles?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        console.error('[PermissionContext] Failed to delete role:', await res.text());
        return false;
      }

      const data = await res.json();
      if (data.roles) {
        setRoles(data.roles);
      }
      return true;
    } catch (err) {
      console.error('[PermissionContext] Error deleting role:', err);
      return false;
    }
  }, [activeRoleId, setActiveRoleId]);

  return (
    <PermissionContext.Provider
      value={{
        roles,
        activeRole,
        activeRoleId,
        setActiveRoleId,
        isLoading,
        canAccess,
        canExecuteAction,
        canViewReport,
        hasBrandAccess,
        updateRole,
        deleteRole,
        refreshRoles,
        isReadOnly,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermission(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
}
