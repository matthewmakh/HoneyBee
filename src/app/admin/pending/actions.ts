'use server';

import { auth } from '@/lib/auth';
import { processLeadCompletion } from '@/lib/services/finance';
import type { ApiResult } from '@/lib/types';

export async function confirmDealAction(leadId: string): Promise<ApiResult<null>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (session.user.role !== 'SUPERADMIN') {
      return { success: false, error: 'Super Admin access required' };
    }

    // Process the completion - this handles all balance updates and ledger entries
    await processLeadCompletion(leadId);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to confirm deal';
    return { success: false, error: message };
  }
}
