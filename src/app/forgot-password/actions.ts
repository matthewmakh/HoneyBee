'use server';

import { requestPasswordReset } from '@/lib/services/password-reset';
import type { ApiResult } from '@/lib/types';

/**
 * Open a password-reset request. Always reports success so the form can't be
 * used to discover which emails have accounts.
 */
export async function requestPasswordResetAction(email: string): Promise<ApiResult<null>> {
  try {
    if (email?.trim()) {
      await requestPasswordReset(email);
    }
    return { success: true };
  } catch {
    // Still report success — the admin panel is the source of truth.
    return { success: true };
  }
}
