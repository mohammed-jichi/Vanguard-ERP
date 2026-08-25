/**
 * Vanguard ERP System - Strict UOM & Quantity Step Validation Library
 * 
 * Strict UOM list:
 * ['bag', 'bottle', 'box', 'bucket', 'can', 'capsule', 'CFT', 'CTN', 'dozen', 'gallon', 'gram', 'jar', 'kilogram', 'liter', 'offer', 'sachet', 'tube', 'unit']
 */

export const STRICT_UOM_LIST: string[] = [
  'bag',
  'bottle',
  'box',
  'bucket',
  'can',
  'capsule',
  'CFT',
  'CTN',
  'dozen',
  'gallon',
  'gram',
  'jar',
  'kilogram',
  'liter',
  'offer',
  'sachet',
  'tube',
  'unit'
];

export const INTEGER_UOMS: string[] = [
  'bag',
  'bottle',
  'can',
  'capsule',
  'jar',
  'sachet',
  'tube',
  'unit'
];

export const DECIMAL_UOMS: string[] = [
  'gram',
  'kilogram',
  'liter'
];

export const PACK_UOMS: string[] = [
  'box',
  'bucket',
  'CFT',
  'CTN',
  'dozen',
  'gallon',
  'offer'
];

export interface UomValidationResult {
  isValid: boolean;
  error?: string;
  step: string;
  isIntegerOnly: boolean;
  isPackSize: boolean;
}

/**
 * Returns the HTML input `step` attribute based on UOM type
 */
export function getUomInputStep(uom: string): string {
  const normalized = (uom || '').toLowerCase();
  if (INTEGER_UOMS.includes(normalized)) {
    return '1';
  }
  if (DECIMAL_UOMS.includes(normalized)) {
    return '0.001';
  }
  if (PACK_UOMS.includes(normalized)) {
    return '0.25';
  }
  return '1';
}

/**
 * Validates quantity input based on strict UOM rules
 */
export function validateUomQuantity(uom: string, quantity: number): UomValidationResult {
  const normalized = (uom || '').toLowerCase();
  const isInteger = INTEGER_UOMS.includes(normalized);
  const isDecimal = DECIMAL_UOMS.includes(normalized);
  const isPack = PACK_UOMS.includes(normalized);

  if (isNaN(quantity) || quantity < 0) {
    return {
      isValid: false,
      error: 'الكمية يجب أن تكون رقماً موجباً أكبر من أو يساوي صفر',
      step: getUomInputStep(uom),
      isIntegerOnly: isInteger,
      isPackSize: isPack
    };
  }

  // Strict Integer Validation
  if (isInteger && !Number.isInteger(quantity)) {
    return {
      isValid: false,
      error: `الوحدة المحددة (${uom}) تتطلب أعداداً صحيحة فقط بدون كسور! (Strict Integer Required)`,
      step: '1',
      isIntegerOnly: true,
      isPackSize: false
    };
  }

  return {
    isValid: true,
    step: getUomInputStep(uom),
    isIntegerOnly: isInteger,
    isPackSize: isPack
  };
}

/**
 * Calculates total base units when fractions of pack sizes are entered
 * e.g., 0.5 box of 12 units = 6 base units
 */
export function calculateBaseUnitQuantity(uom: string, inputQty: number, packSize: number = 1): number {
  const normalized = (uom || '').toLowerCase();
  
  if (PACK_UOMS.includes(normalized) && packSize > 1) {
    return inputQty * packSize;
  }
  
  if (normalized === 'dozen') {
    return inputQty * 12;
  }

  return inputQty;
}
