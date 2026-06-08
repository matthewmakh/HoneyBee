'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { createLead } from '@/lib/services/leads';
import type { ApiResult } from '@/lib/types';

const multiReferralSchema = z.object({
  providerCompanyIds: z
    .array(z.string().cuid('Invalid product'))
    .min(1, 'Select at least one product to refer')
    .max(3, 'You can refer up to three products'),
  homeownerName: z.string().min(2, 'Homeowner name is required'),
  homeownerPhone: z.string().min(10, 'Valid phone number is required'),
  homeownerAddress: z.string().min(5, 'Address is required'),
  projectDescription: z.string().min(10, 'Project description is required'),
  category: z.string().min(1, 'Category is required'),
  photos: z.array(z.string().url()).max(5, 'Maximum 5 photos').optional().default([]),
});

export type MultiReferralInput = z.input<typeof multiReferralSchema>;

export interface MultiReferralResult {
  submitted: { providerCompanyId: string; leadId: string }[];
  failed: { providerCompanyId: string; error: string }[];
}

/**
 * Submit the same homeowner referral to each selected A-Team product. Each
 * provider gets its own lead (with its own commission snapshot). We collect
 * per-provider results so the UI can report partial success.
 */
export async function submitMultiReferral(
  input: MultiReferralInput
): Promise<ApiResult<MultiReferralResult>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }
    if (!session.user.company.canUseReferrerPortal && session.user.role !== 'SUPERADMIN') {
      return { success: false, error: 'No referrer portal access' };
    }

    const parsed = multiReferralSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Validation failed',
      };
    }

    const data = parsed.data;
    const submitted: MultiReferralResult['submitted'] = [];
    const failed: MultiReferralResult['failed'] = [];

    for (const providerCompanyId of data.providerCompanyIds) {
      try {
        const lead = await createLead({
          referrerCompanyId: session.user.companyId,
          providerCompanyId,
          homeownerName: data.homeownerName,
          homeownerPhone: data.homeownerPhone,
          homeownerAddress: data.homeownerAddress,
          projectDescription: data.projectDescription,
          category: data.category,
          photos: data.photos ?? [],
        });
        submitted.push({ providerCompanyId, leadId: lead.id });
      } catch (error) {
        failed.push({
          providerCompanyId,
          error: error instanceof Error ? error.message : 'Failed to submit',
        });
      }
    }

    if (submitted.length === 0) {
      return {
        success: false,
        error: failed[0]?.error ?? 'Failed to submit referral',
      };
    }

    return { success: true, data: { submitted, failed } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit referral',
    };
  }
}
