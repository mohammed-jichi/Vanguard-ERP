/**
 * Vanguard HR Master Action Dispatcher
 * Extensible, open-ended action dispatcher channeling all schedule and employee profile mutations.
 * Fully open for future buttons, plugins, and UI triggers without altering core calculation or persistence logic.
 */

import { HRPersonnelService, HREmployeeRecord } from './hrPersonnelService';

export type MasterAction =
  | { type: 'DELETE_EMPLOYEE'; employeeId: string }
  | { type: 'APPLY_DAYS_OVERRIDE'; days: string[]; shift: string; isOff: boolean; allMonths: boolean; employeeId?: string }
  | { type: 'SAVE_SCHEDULE'; employeeId: string; scheduleConfig: any }
  | { type: 'SAVE_EMPLOYEE'; employee: HREmployeeRecord }
  | { type: 'APPLY_TEMPLATE'; templateName: string; allMonths: boolean; employeeId?: string }
  | { type: string; payload?: any; [key: string]: any }; // Fully open for future actions

export type MasterActionHandler = (action: MasterAction) => Promise<any> | any;

class HRMasterActionDispatcher {
  private customHandlers: Map<string, MasterActionHandler[]> = new Map();

  /**
   * Register custom action listeners for extensible third-party plugins or UI widgets.
   */
  public registerHandler(actionType: string, handler: MasterActionHandler): () => void {
    const list = this.customHandlers.get(actionType) || [];
    list.push(handler);
    this.customHandlers.set(actionType, list);
    return () => {
      const updated = (this.customHandlers.get(actionType) || []).filter((h) => h !== handler);
      this.customHandlers.set(actionType, updated);
    };
  }

  /**
   * Dispatches a MasterAction, routing through core database-first persistence routines
   * and invoking any registered third-party or sub-module handlers.
   */
  public async dispatch(action: MasterAction): Promise<any> {
    console.log('[HRMasterActionDispatcher] Dispatching action:', action.type);

    let result: any = null;

    switch (action.type) {
      case 'DELETE_EMPLOYEE': {
        const { employeeId } = action as { type: 'DELETE_EMPLOYEE'; employeeId: string };
        result = await HRPersonnelService.deleteEmployee(employeeId);
        break;
      }

      case 'SAVE_SCHEDULE': {
        const { employeeId, scheduleConfig } = action as {
          type: 'SAVE_SCHEDULE';
          employeeId: string;
          scheduleConfig: any;
        };
        const allEmployees = HRPersonnelService.getEmployees();
        const emp = allEmployees.find(
          (e) => String(e.id) === String(employeeId) || String((e as any).employee_code) === String(employeeId)
        );
        if (emp) {
          const updatedEmp: HREmployeeRecord = {
            ...emp,
            schedule_template: scheduleConfig?.templateName || emp.schedule_template,
            schedule: scheduleConfig,
            schedule_config: scheduleConfig,
          };
          result = await HRPersonnelService.saveEmployee(updatedEmp);
        } else {
          // If not in local cache, sync directly via sync-workstation
          const res = await fetch('/api/hr/sync-workstation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              employeeId,
              scheduleConfig,
              scheduleTemplate: scheduleConfig?.templateName || 'Backoffice Administration (08:00 - 16:30)',
            }),
          });
          result = await res.json();
        }
        break;
      }

      case 'SAVE_EMPLOYEE': {
        const { employee } = action as { type: 'SAVE_EMPLOYEE'; employee: HREmployeeRecord };
        result = await HRPersonnelService.saveEmployee(employee);
        break;
      }

      case 'APPLY_DAYS_OVERRIDE': {
        const { days, shift, isOff, allMonths, employeeId } = action as {
          type: 'APPLY_DAYS_OVERRIDE';
          days: string[];
          shift: string;
          isOff: boolean;
          allMonths: boolean;
          employeeId?: string;
        };
        if (employeeId) {
          const allEmployees = HRPersonnelService.getEmployees();
          const emp = allEmployees.find(
            (e) => String(e.id) === String(employeeId) || String((e as any).employee_code) === String(employeeId)
          );
          if (emp) {
            const currentConfig = emp.schedule_config || emp.schedule || {
              templateName: emp.schedule_template || 'Backoffice Administration (08:00 - 16:30)',
              workDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              offDays: ['Sun'],
              dateOverrides: {},
            };
            const updatedConfig = {
              ...currentConfig,
              workDays: isOff ? (currentConfig.workDays || []).filter((d: string) => !days.includes(d)) : [...new Set([...(currentConfig.workDays || []), ...days])],
              offDays: isOff ? [...new Set([...(currentConfig.offDays || []), ...days])] : (currentConfig.offDays || []).filter((d: string) => !days.includes(d)),
              applyToAllMonths: allMonths,
            };
            result = await HRPersonnelService.saveEmployee({
              ...emp,
              schedule: updatedConfig,
              schedule_config: updatedConfig,
            });
          }
        }
        break;
      }

      default: {
        console.log(`[HRMasterActionDispatcher] Handling custom/open action: ${action.type}`, (action as any).payload);
        break;
      }
    }

    // Invoke registered listeners for this action
    const handlers = this.customHandlers.get(action.type) || [];
    for (const handler of handlers) {
      try {
        await handler(action);
      } catch (handlerErr) {
        console.warn(`[HRMasterActionDispatcher] Handler error for ${action.type}:`, handlerErr);
      }
    }

    // Dispatch custom DOM event for cross-component subscription
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('vanguard_hr_master_action', {
          detail: { action, result },
        })
      );
    }

    return result;
  }
}

export const hrMasterActionDispatcher = new HRMasterActionDispatcher();
export const dispatchMasterHRAction = (action: MasterAction) => hrMasterActionDispatcher.dispatch(action);
