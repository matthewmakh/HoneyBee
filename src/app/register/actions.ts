'use server';

import { createCompany } from '@/lib/services/companies';
import { resolveSponsorByMemberId } from '@/lib/services/teams';
import { registerSchema } from '@/lib/validations';
import type { ApiResult } from '@/lib/types';

interface RegisterInput {
  companyName: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  canUseReferrerPortal: boolean;
  canUseProviderPortal: boolean;
  agreedToRules: boolean;
  referralSource?: string;
  enrollmentNote?: string;
  /** Member ID from a sponsor's invite link (?sponsor=HB-000123). */
  sponsorMemberId?: string | undefined;
}

export async function registerUser(input: RegisterInput): Promise<ApiResult<{ companyId: string }>> {
  try {
    // Validate input
    const validated = registerSchema.safeParse(input);

    if (!validated.success) {
      const firstIssue = validated.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message ?? 'Validation failed',
      };
    }

    // An invalid or suspended sponsor code never blocks a signup — the member
    // simply enrolls unsponsored, the same as arriving without a link.
    const sponsor = input.sponsorMemberId
      ? await resolveSponsorByMemberId(input.sponsorMemberId)
      : null;

    // Provider access requires admin approval — never granted at registration
    const company = await createCompany({
      name: input.companyName,
      canUseReferrerPortal: input.canUseReferrerPortal,
      canUseProviderPortal: false,
      providerApplicationPending: input.canUseProviderPortal,
      userName: input.name,
      userEmail: input.email,
      userPassword: input.password,
      agreedToRules: input.agreedToRules,
      referralSource: input.referralSource?.trim() || null,
      enrollmentNote: input.enrollmentNote?.trim() || null,
      sponsorCompanyId: sponsor?.id ?? null,
    });

    return {
      success: true,
      data: { companyId: company.id },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Used by the register page to show who the invite link belongs to before the
 * visitor commits. Returns null for unknown or inactive sponsor codes.
 */
export async function getSponsorPreview(
  memberId: string
): Promise<{ name: string; memberId: string } | null> {
  const sponsor = await resolveSponsorByMemberId(memberId);
  return sponsor ? { name: sponsor.name, memberId: sponsor.memberId } : null;
}
