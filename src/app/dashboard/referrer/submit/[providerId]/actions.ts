'use server';

import { auth } from '@/lib/auth';
import { createLead } from '@/lib/services/leads';
import { submitLeadSchema } from '@/lib/validations';
import type { ApiResult } from '@/lib/types';

interface SubmitLeadInput {
  providerCompanyId: string;
  homeownerName: string;
  homeownerPhone: string;
  homeownerAddress: string;
  projectDescription: string;
  category: string;
}

export async function submitLead(input: SubmitLeadInput): Promise<ApiResult<{ leadId: string }>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!session.user.company.canUseReferrerPortal && session.user.role !== 'SUPERADMIN') {
      return { success: false, error: 'No referrer portal access' };
    }

    // Validate input
    const validated = submitLeadSchema.safeParse(input);

    if (!validated.success) {
      const firstIssue = validated.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message ?? 'Validation failed',
      };
    }

    // Create lead with commission snapshot
    const lead = await createLead({
      referrerCompanyId: session.user.companyId,
      providerCompanyId: input.providerCompanyId,
      homeownerName: input.homeownerName,
      homeownerPhone: input.homeownerPhone,
      homeownerAddress: input.homeownerAddress,
      projectDescription: input.projectDescription,
      category: input.category,
    });

    return {
      success: true,
      data: { leadId: lead.id },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit lead';
    return { success: false, error: message };
  }
}
