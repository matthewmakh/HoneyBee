'use server';

import { auth } from '@/lib/auth';
import { processLeadCompletion } from '@/lib/services/finance';
import { createReviewRequest } from '@/lib/services/reviews';
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

    // Create a review request for the customer (non-critical, don't fail if this errors)
    try {
      const review = await createReviewRequest(leadId);
      // TODO: Send review link to customer via email/SMS
      console.log(`Review created for lead ${leadId}: /review/${review.token}`);
    } catch (reviewError) {
      console.error('Failed to create review request:', reviewError);
      // Don't fail the whole deal confirmation if review creation fails
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to confirm deal';
    return { success: false, error: message };
  }
}
