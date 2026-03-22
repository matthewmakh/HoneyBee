'use server';

import { auth } from '@/lib/auth';
import { approvePriceChangeRequest, rejectPriceChangeRequest } from '@/lib/services/leads';
import type { ApiResult } from '@/lib/types';

export async function approvePriceChangeAction(
  requestId: string,
  adminNotes?: string
): Promise<ApiResult<null>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (session.user.role !== 'SUPERADMIN') {
      return { success: false, error: 'Super Admin access required' };
    }

    await approvePriceChangeRequest(requestId, adminNotes);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to approve price change';
    return { success: false, error: message };
  }
}

export async function rejectPriceChangeAction(
  requestId: string,
  adminNotes?: string
): Promise<ApiResult<null>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (session.user.role !== 'SUPERADMIN') {
      return { success: false, error: 'Super Admin access required' };
    }

    await rejectPriceChangeRequest(requestId, adminNotes);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject price change';
    return { success: false, error: message };
  }
}
