'use server';

import { resetPasswordWithToken } from '@/lib/services/password-reset';
import type { ApiResult } from '@/lib/types';

export async function resetPasswordAction(
  token: string,
  password: string,
  confirmPassword: string
): Promise<ApiResult<null>> {
  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' };
  }
  const result = await resetPasswordWithToken(token, password);
  if (!result.ok) {
    return { success: false, error: result.error };
  }
  return { success: true };
}
