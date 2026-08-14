'use server';

import { requireClubAdmin } from '@/lib/auth';
import { markPayoutPaid } from '@/lib/services/payouts';
import { revalidatePath } from 'next/cache';
import type { ApiResult } from '@/lib/types';

export async function markPayoutPaidAction(
  payoutId: string
): Promise<ApiResult<null>> {
  try {
    await requireClubAdmin();
    await markPayoutPaid(payoutId);
    revalidatePath('/admin/payouts');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed',
    };
  }
}

export async function markPayoutsPaidBulk(
  payoutIds: string[]
): Promise<ApiResult<{ paidCount: number }>> {
  try {
    await requireClubAdmin();
    let paidCount = 0;
    for (const id of payoutIds) {
      try {
        await markPayoutPaid(id);
        paidCount += 1;
      } catch {
        // skip failures (e.g. already paid) and continue
      }
    }
    revalidatePath('/admin/payouts');
    return { success: true, data: { paidCount } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed',
    };
  }
}
