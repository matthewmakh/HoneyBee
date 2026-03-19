'use server';

import { auth } from '@/lib/auth';
import { createProviderProfile, updateProviderProfile, getProviderProfile } from '@/lib/services/providers';
import { updateProviderProfileSchema } from '@/lib/validations';
import type { ApiResult, CommissionType } from '@/lib/types';

interface SaveProfileInput {
  zipCode: string;
  serviceCategories: string[];
  shortDescription: string;
  commissionType: CommissionType;
  commissionValue: number;
  isPublished: boolean;
  logoUrl?: string | null;
}

export async function saveProviderProfile(input: SaveProfileInput): Promise<ApiResult<null>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!session.user.company.canUseProviderPortal && session.user.role !== 'SUPERADMIN') {
      return { success: false, error: 'No provider portal access' };
    }

    // Validate input
    const validated = updateProviderProfileSchema.safeParse(input);

    if (!validated.success) {
      const firstIssue = validated.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message ?? 'Validation failed',
      };
    }

    // Check if profile exists
    const existingProfile = await getProviderProfile(session.user.companyId);

    if (existingProfile) {
      // Update existing profile (logoUrl passed through to update company logo)
      await updateProviderProfile(session.user.companyId, {
        ...input,
        logoUrl: input.logoUrl ?? null,
      });
    } else {
      // Create new profile
      await createProviderProfile({
        companyId: session.user.companyId,
        zipCode: input.zipCode,
        serviceCategories: input.serviceCategories,
        shortDescription: input.shortDescription,
        commissionType: input.commissionType,
        commissionValue: input.commissionValue,
      });
      // Set logo separately if provided
      if (input.logoUrl) {
        const { updateCompanyLogo } = await import('@/lib/services/companies');
        await updateCompanyLogo(session.user.companyId, input.logoUrl);
      }
    }

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save profile';
    return { success: false, error: message };
  }
}
