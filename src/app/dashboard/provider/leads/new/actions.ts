'use server';

import { auth } from '@/lib/auth';
import { acceptLead, rejectLead } from '@/lib/services/leads';
import type { ApiResult } from '@/lib/types';

export async function acceptLeadAction(leadId: string): Promise<ApiResult<null>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!session.user.company.canUseProviderPortal && session.user.role !== 'SUPERADMIN') {
      return { success: false, error: 'No provider portal access' };
    }

    await acceptLead(leadId, session.user.companyId);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to accept lead';
    return { success: false, error: message };
  }
}

export async function rejectLeadAction(leadId: string): Promise<ApiResult<null>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!session.user.company.canUseProviderPortal && session.user.role !== 'SUPERADMIN') {
      return { success: false, error: 'No provider portal access' };
    }

    await rejectLead(leadId, session.user.companyId);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject lead';
    return { success: false, error: message };
  }
}
