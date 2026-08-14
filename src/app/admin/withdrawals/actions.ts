'use server';

import { requireClubAdmin } from '@/lib/auth';
import { completeWithdrawalRequest, rejectWithdrawalRequest } from '@/lib/services/finance';
import { revalidatePath } from 'next/cache';
import type { ApiResult } from '@/lib/types';

export async function completeWithdrawalAction(requestId: string): Promise<ApiResult<null>> {
  try {
    await requireClubAdmin();
    await completeWithdrawalRequest(requestId);
    revalidatePath('/admin/withdrawals');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to complete' };
  }
}

export async function rejectWithdrawalAction(requestId: string): Promise<ApiResult<null>> {
  try {
    await requireClubAdmin();
    await rejectWithdrawalRequest(requestId);
    revalidatePath('/admin/withdrawals');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reject' };
  }
}
