'use server';

import { auth } from '@/lib/auth';
import { markJobCompleted } from '@/lib/services/leads';
import { markJobCompletedSchema } from '@/lib/validations';
import type { ApiResult } from '@/lib/types';

export async function markJobCompletedAction(
  leadId: string,
  reportedJobValue: number
): Promise<ApiResult<null>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!session.user.company.canUseProviderPortal && session.user.role !== 'SUPERADMIN') {
      return { success: false, error: 'No provider portal access' };
    }

    // Validate input
    const validated = markJobCompletedSchema.safeParse({ leadId, reportedJobValue });

    if (!validated.success) {
      const firstIssue = validated.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message ?? 'Validation failed',
      };
    }

    await markJobCompleted(leadId, session.user.companyId, reportedJobValue);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark job completed';
    return { success: false, error: message };
  }
}
