import { prisma } from '@/lib/db';
import type { ProviderProfileWithCompany, ProviderSearchFilters, CommissionType } from '@/lib/types';

// ============================================================================
// Provider Profile Management
// ============================================================================

interface CreateProviderProfileInput {
  companyId: string;
  zipCode: string;
  serviceCategories: string[];
  shortDescription: string;
  commissionType: CommissionType;
  commissionValue: number;
}

interface UpdateProviderProfileInput {
  zipCode: string;
  serviceCategories: string[];
  shortDescription: string;
  commissionType: CommissionType;
  commissionValue: number;
  isPublished: boolean;
  logoUrl?: string | null;
}

/**
 * Create a provider profile for a company
 */
export async function createProviderProfile(
  input: CreateProviderProfileInput
): Promise<ProviderProfileWithCompany> {
  // Check if company exists and has provider access
  const company = await prisma.company.findUnique({
    where: { id: input.companyId },
    select: { id: true, canUseProviderPortal: true },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  if (!company.canUseProviderPortal) {
    throw new Error('Company does not have provider portal access');
  }

  // Check if profile already exists
  const existingProfile = await prisma.providerProfile.findUnique({
    where: { companyId: input.companyId },
  });

  if (existingProfile) {
    throw new Error('Provider profile already exists for this company');
  }

  return prisma.providerProfile.create({
    data: {
      companyId: input.companyId,
      zipCode: input.zipCode,
      serviceCategories: input.serviceCategories,
      shortDescription: input.shortDescription,
      commissionType: input.commissionType,
      commissionValue: input.commissionValue,
      isPublished: true,
    },
    include: {
      company: true,
    },
  });
}

/**
 * Update provider profile
 */
export async function updateProviderProfile(
  companyId: string,
  input: UpdateProviderProfileInput
): Promise<ProviderProfileWithCompany> {
  const profile = await prisma.providerProfile.findUnique({
    where: { companyId },
  });

  if (!profile) {
    throw new Error('Provider profile not found');
  }

  // Build data object conditionally for logoUrl
  const updateData: Parameters<typeof prisma.providerProfile.update>[0]['data'] = {
    zipCode: input.zipCode,
    serviceCategories: input.serviceCategories,
    shortDescription: input.shortDescription,
    commissionType: input.commissionType,
    commissionValue: input.commissionValue,
    isPublished: input.isPublished,
    updatedAt: new Date(),
  };

  // Update company logo if provided
  if (input.logoUrl !== undefined) {
    await prisma.company.update({
      where: { id: companyId },
      data: { logoUrl: input.logoUrl },
    });
  }

  return prisma.providerProfile.update({
    where: { companyId },
    data: updateData,
    include: {
      company: true,
    },
  });
}

/**
 * Get provider profile by company ID
 */
export async function getProviderProfile(
  companyId: string
): Promise<ProviderProfileWithCompany | null> {
  return prisma.providerProfile.findUnique({
    where: { companyId },
    include: { company: true },
  });
}

// ============================================================================
// Provider Directory Search
// ============================================================================

/**
 * Search published providers with filters
 */
export async function searchProviders(
  filters: ProviderSearchFilters,
  excludeCompanyId?: string
): Promise<ProviderProfileWithCompany[]> {
  // Build where clause using Prisma types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {
    isPublished: true,
    company: {
      isSuspended: false,
      canUseProviderPortal: true,
    },
  };

  // Exclude requester's own company
  if (excludeCompanyId) {
    whereClause.companyId = { not: excludeCompanyId };
  }

  // Filter by category
  if (filters.category) {
    whereClause.serviceCategories = {
      has: filters.category,
    };
  }

  // Filter by zip code
  if (filters.zipCode) {
    whereClause.zipCode = {
      startsWith: filters.zipCode.slice(0, 3), // Match first 3 digits for area
    };
  }

  // Filter by commission type
  if (filters.commissionType) {
    whereClause.commissionType = filters.commissionType;
  }

  // Search by company name
  if (filters.search) {
    whereClause.company = {
      ...whereClause.company,
      name: {
        contains: filters.search,
        mode: 'insensitive',
      },
    };
  }

  // Build order by clause
  type OrderByType = 
    | { createdAt: 'asc' | 'desc' }
    | { commissionValue: 'asc' | 'desc' }
    | { company: { name: 'asc' | 'desc' } };
  
  let orderBy: OrderByType = { createdAt: 'desc' };

  if (filters.sortBy === 'commission') {
    orderBy = { commissionValue: filters.sortOrder ?? 'desc' };
  } else if (filters.sortBy === 'name') {
    orderBy = { company: { name: filters.sortOrder ?? 'asc' } };
  } else if (filters.sortBy === 'newest') {
    orderBy = { createdAt: filters.sortOrder ?? 'desc' };
  }
  // Note: 'rating' and 'jobs' sorting is handled client-side after fetching stats

  return prisma.providerProfile.findMany({
    where: whereClause,
    include: {
      company: true,
    },
    orderBy,
    take: 100, // Limit results
  });
}

/**
 * Get all service categories that have active providers
 */
export async function getActiveServiceCategories(): Promise<string[]> {
  const profiles = await prisma.providerProfile.findMany({
    where: {
      isPublished: true,
      company: {
        isSuspended: false,
      },
    },
    select: {
      serviceCategories: true,
    },
  });

  const categories = new Set<string>();
  profiles.forEach((profile: { serviceCategories: string[] }) => {
    profile.serviceCategories.forEach((cat: string) => categories.add(cat));
  });

  return Array.from(categories).sort();
}

/**
 * Get jobs completed count for multiple providers at once
 */
export async function getProvidersJobsCompleted(companyIds: string[]) {
  const results = await prisma.lead.groupBy({
    by: ['providerCompanyId'],
    where: {
      providerCompanyId: { in: companyIds },
      status: 'COMPLETED_CONFIRMED',
    },
    _count: { id: true },
  });

  const jobsMap = new Map<string, number>();
  for (const r of results) {
    jobsMap.set(r.providerCompanyId, r._count.id);
  }

  return jobsMap;
}
