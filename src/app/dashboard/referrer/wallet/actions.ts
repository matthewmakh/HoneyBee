'use server';

import { requireReferrerAccess } from '@/lib/auth';
import { createWithdrawalRequest } from '@/lib/services/finance';
import { revalidatePath } from 'next/cache';
import type { ApiResult } from '@/lib/types';

export async function requestWithdrawalAction(
  amount: number,
  notes?: string
): Promise<ApiResult<null>> {
  try {
    const user = await requireReferrerAccess();
    await createWithdrawalRequest(user.companyId, amount, notes);
    revalidatePath('/dashboard/referrer/wallet');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to submit request' };
  }
}
