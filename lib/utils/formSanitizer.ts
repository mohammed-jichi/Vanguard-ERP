export interface SanitizeOptions {
  stripPrefixes?: boolean;
  emptyToNull?: boolean;
}

export function sanitizeFormPayload<T extends Record<string, any>>(
  raw: T,
  options?: SanitizeOptions
): Partial<T> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (
        trimmed === '' ||
        trimmed === 'Pending Device Sync' ||
        trimmed.toLowerCase() === 'select...' ||
        trimmed.toLowerCase() === 'select'
      ) {
        sanitized[key] = null;
      } else if (trimmed.includes(' - ')) {
        sanitized[key] = trimmed.split(' - ')[0].trim();
      } else {
        sanitized[key] = trimmed;
      }
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized as Partial<T>;
}
