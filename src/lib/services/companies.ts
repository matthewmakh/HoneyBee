import { prisma } from '@/lib/db';
import { hash } from 'bcryptjs';
import { generateMemberId } from '@/lib/utils';
import type { Company, CompanyWithProfile } from '@/lib/types';

// ============================================================================
// Company Management
// ============================================================================

interface CreateCompanyInput {
  name: string;
  canUseReferrerPortal: boolean;
  canUseProviderPortal: boolean;
  providerApplicationPending?: boolean;
  userName: string;
  userEmail: string;
  userPassword: string;
  // Enrollment agreement captured at sign-up
  agreedToRules?: boolean;
  referralSource?: string | null;
  enrollmentNote?: string | null;
  /**
   * Company of the member whose invite link was used. Becomes the new
   * member's L-1 manager AND their immutable original sponsor (the lifetime
   * 1% line), mirroring what changeL1Manager maintains.
   */
  sponsorCompanyId?: string | null;
}

/**
 * Compute the next sequential member ID (HB-NNNNNN).
 *
 * IMPORTANT: We must NOT rely on `orderBy: { memberId: 'desc' }` here. Member IDs
 * are strings, and demo/seed rows use non-numeric formats like `HB-MLM-0001` which
 * sort *after* `HB-000005` lexically ('M' > '0'). That made the old logic reset the
 * sequence back to 1 and try to recreate `HB-000001`, throwing a unique-constraint
 * error on every registration. Instead, scan every member ID, keep only the
 * canonical `HB-<digits>` ones, and take the true numeric maximum.
 */
async function getNextMemberId(): Promise<string> {
  const companies = await prisma.company.findMany({ select: { memberId: true } });
  let maxSequence = 0;
  for (const { memberId } of companies) {
    const match = memberId.match(/^HB-(\d+)$/);
    if (match?.[1]) {
      maxSequence = Math.max(maxSequence, parseInt(match[1], 10));
    }
  }
  return generateMemberId(maxSequence + 1);
}

/**
 * Create a new company with initial user
 */
export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  // Emails are case-insensitive — store them normalized and check for an
  // existing account regardless of case so "Mike@" and "mike@" can't collide.
  const normalizedEmail = input.userEmail.trim().toLowerCase();
  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  const passwordHash = await hash(input.userPassword, 12);

  // Create company and user in a transaction. Retry on the (rare) chance that
  // two registrations race for the same sequential member ID.
  const MAX_ATTEMPTS = 5;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const memberId = await getNextMemberId();
    try {
      return await prisma.$transaction(async (tx) => {
        const newCompany = await tx.company.create({
          data: {
            name: input.name,
            memberId,
            canUseReferrerPortal: input.canUseReferrerPortal,
            canUseProviderPortal: input.canUseProviderPortal,
            providerApplicationPending: input.providerApplicationPending ?? false,
            agreedToRulesAt: input.agreedToRules ? new Date() : null,
            referralSource: input.referralSource ?? null,
            enrollmentNote: input.enrollmentNote ?? null,
            l1ManagerCompanyId: input.sponsorCompanyId ?? null,
            originalSponsorCompanyId: input.sponsorCompanyId ?? null,
          },
        });

        await tx.user.create({
          data: {
            companyId: newCompany.id,
            name: input.userName,
            email: normalizedEmail,
            passwordHash,
            role: 'USER',
          },
        });

        if (input.sponsorCompanyId) {
          await tx.teamMembership.create({
            data: {
              companyId: newCompany.id,
              l1ManagerCompanyId: input.sponsorCompanyId,
            },
          });
        }

        return newCompany;
      });
    } catch (error) {
      // P2002 = unique constraint violation. If it's the memberId racing, retry
      // with a freshly computed sequence; anything else (e.g. email) bubbles up.
      const isMemberIdRace =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002' &&
        String((error as { meta?: { target?: string[] } }).meta?.target ?? '').includes(
          'memberId'
        );
      if (isMemberIdRace && attempt < MAX_ATTEMPTS - 1) {
        continue;
      }
      throw error;
    }
  }

  // Unreachable in practice — the loop either returns or throws.
  throw new Error('Could not allocate a unique member ID. Please try again.');
}

/**
 * Get company by ID with provider profile
 */
export async function getCompanyWithProfile(
  companyId: string
): Promise<CompanyWithProfile | null> {
  return prisma.company.findUnique({
    where: { id: companyId },
    include: {
      providerProfile: true,
    },
  });
}

/**
 * Get all companies (Admin only)
 */
export async function getAllCompanies(): Promise<CompanyWithProfile[]> {
  return prisma.company.findMany({
    include: {
      providerProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Suspend or unsuspend a company (Admin only)
 */
export async function setCompanySuspension(
  companyId: string,
  suspend: boolean
): Promise<Company> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      users: {
        select: { role: true },
      },
    },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  // Prevent suspending company with SUPERADMIN users
  const hasSuperAdmin = company.users.some((u: { role: string }) => u.role === 'SUPERADMIN');
  if (hasSuperAdmin && suspend) {
    throw new Error('Cannot suspend company with super admin users');
  }

  return prisma.company.update({
    where: { id: companyId },
    data: {
      isSuspended: suspend,
      updatedAt: new Date(),
    },
  });
}

/**
 * Delete a company and all related data (Admin only)
 */
export async function deleteCompany(companyId: string): Promise<void> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      users: {
        select: { role: true },
      },
    },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  // Prevent deleting company with SUPERADMIN users
  const hasSuperAdmin = company.users.some((u: { role: string }) => u.role === 'SUPERADMIN');
  if (hasSuperAdmin) {
    throw new Error('Cannot delete company with super admin users');
  }

  // Delete company (cascades to users, leads, etc.)
  await prisma.company.delete({
    where: { id: companyId },
  });
}

/**
 * Get company by member ID
 */
export async function getCompanyByMemberId(
  memberId: string
): Promise<Company | null> {
  return prisma.company.findUnique({
    where: { memberId },
  });
}

/**
 * Get all companies with pending provider applications (Admin only)
 */
export async function getPendingProviderApplications(): Promise<CompanyWithProfile[]> {
  return prisma.company.findMany({
    where: { providerApplicationPending: true },
    include: { providerProfile: true },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Sentinel ZIP used by auto-created placeholder provider profiles so the
 * provider portal knows a profile still needs to be completed. A provider with
 * this ZIP shows up in the A-Team catalogue immediately but is nudged to finish
 * setup the first time they sign in.
 */
export const PLACEHOLDER_PROVIDER_ZIP = '00000';

/**
 * Ensure a company has a ProviderProfile so it appears in the A-Team catalogue.
 * Newly approved providers had no profile, which silently kept them out of the
 * directory entirely (referrers could never find or refer to them). We create a
 * minimal *published* placeholder profile they can flesh out in settings.
 */
export async function ensureProviderProfile(companyId: string): Promise<void> {
  const existing = await prisma.providerProfile.findUnique({ where: { companyId } });
  if (existing) return;

  await prisma.providerProfile.create({
    data: {
      companyId,
      zipCode: PLACEHOLDER_PROVIDER_ZIP,
      serviceCategories: ['Other'],
      shortDescription:
        'New A-Team provider. Profile setup in progress — full details coming soon.',
      commissionType: 'PERCENT',
      commissionValue: 10,
      isPublished: true,
    },
  });
}

/**
 * Approve a provider application (Admin only)
 * Providers automatically get referrer access as well
 */
export async function approveProviderApplication(companyId: string): Promise<Company> {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new Error('Company not found');
  if (!company.providerApplicationPending) throw new Error('No pending application');

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: {
      canUseProviderPortal: true,
      canUseReferrerPortal: true, // Providers automatically get referrer access
      providerApplicationPending: false,
      // Tag them as an A-Team provider in the MLM model.
      teamRole: 'PROVIDER',
      updatedAt: new Date(),
    },
  });

  // Approving an A-Team provider must add them to the catalogue right away.
  await ensureProviderProfile(companyId);

  return updated;
}

/**
 * Reject a provider application (Admin only)
 */
export async function rejectProviderApplication(companyId: string): Promise<Company> {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new Error('Company not found');
  if (!company.providerApplicationPending) throw new Error('No pending application');

  return prisma.company.update({
    where: { id: companyId },
    data: {
      providerApplicationPending: false,
      updatedAt: new Date(),
    },
  });
}

/**
 * Update company logo URL
 */
export async function updateCompanyLogo(companyId: string, logoUrl: string | null): Promise<Company> {
  return prisma.company.update({
    where: { id: companyId },
    data: { logoUrl, updatedAt: new Date() },
  });
}
