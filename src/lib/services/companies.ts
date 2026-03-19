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
}

/**
 * Create a new company with initial user
 */
export async function createCompany(input: CreateCompanyInput): Promise<Company> {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.userEmail },
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }

  // Get next member ID
  const lastCompany = await prisma.company.findFirst({
    orderBy: { memberId: 'desc' },
    select: { memberId: true },
  });

  let nextSequence = 1;
  if (lastCompany?.memberId) {
    const match = lastCompany.memberId.match(/HB-(\d+)/);
    if (match?.[1]) {
      nextSequence = parseInt(match[1], 10) + 1;
    }
  }

  const memberId = generateMemberId(nextSequence);
  const passwordHash = await hash(input.userPassword, 12);

  // Create company and user in transaction
  const company = await prisma.$transaction(async (tx) => {
    const newCompany = await tx.company.create({
      data: {
        name: input.name,
        memberId,
        canUseReferrerPortal: input.canUseReferrerPortal,
        canUseProviderPortal: input.canUseProviderPortal,
        providerApplicationPending: input.providerApplicationPending ?? false,
      },
    });

    await tx.user.create({
      data: {
        companyId: newCompany.id,
        name: input.userName,
        email: input.userEmail,
        passwordHash,
        role: 'USER',
      },
    });

    return newCompany;
  });

  return company;
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
 * Approve a provider application (Admin only)
 */
export async function approveProviderApplication(companyId: string): Promise<Company> {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new Error('Company not found');
  if (!company.providerApplicationPending) throw new Error('No pending application');

  return prisma.company.update({
    where: { id: companyId },
    data: {
      canUseProviderPortal: true,
      providerApplicationPending: false,
      updatedAt: new Date(),
    },
  });
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
