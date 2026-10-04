import { toast } from '../toast';
import { sanitizeFormPayload, SanitizeOptions } from '../formSanitizer';

export interface MutationOptions<T> {
  successMessage?: string;
  errorMessagePrefix?: string;
  onSuccess?: (result: T) => void;
  onError?: (error: any) => void;
  /** If provided, sanitizes the payload before execution */
  sanitizePayload?: boolean;
  sanitizeOptions?: SanitizeOptions;
}

export interface MutationResult<T> {
  data: T | null;
  error: any | null;
  success: boolean;
}

/**
 * Enterprise Safe Mutation Runner
 *
 * Enforces Zero Silent Failures:
 * 1. Executes async mutation logic.
 * 2. Catches unexpected errors or PostgREST error structures.
 * 3. Logs strictly with contextual prefix: [Vanguard ERP Mutation Failure]: <error>
 * 4. Dispatches an immediate user-facing toast alert.
 * 5. Returns structured result { data, error, success }.
 */
export async function executeMutation<T>(
  operationName: string,
  mutationFn: () => Promise<T>,
  options: MutationOptions<T> = {}
): Promise<MutationResult<T>> {
  try {
    const data = await mutationFn();

    // Check if the result itself represents a Supabase error shape: { error: { message } }
    if (data && typeof data === 'object' && 'error' in data && (data as any).error) {
      const err = (data as any).error;
      const message =
        typeof err === 'string'
          ? err
          : err?.message || err?.details || `${operationName} failed`;

      console.error(`[Vanguard ERP Mutation Failure]: ${operationName}:`, err);
      toast.error(message);
      options.onError?.(err);
      return { data: null, error: err, success: false };
    }

    if (options.successMessage) {
      toast.success(options.successMessage);
    }
    options.onSuccess?.(data);

    return { data, error: null, success: true };
  } catch (err: any) {
    const message =
      err?.message ||
      (typeof err === 'string' ? err : `${options.errorMessagePrefix || operationName} encountered an unexpected error.`);

    console.error(`[Vanguard ERP Mutation Failure]: ${operationName}:`, err);
    toast.error(message);
    options.onError?.(err);

    return { data: null, error: err, success: false };
  }
}

export { sanitizeFormPayload, type SanitizeOptions };
