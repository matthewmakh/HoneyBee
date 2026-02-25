import { prisma } from '@/lib/db';
import { calculateCommission } from './finance';
import type {
  LeadWithCompanies,
  ReferrerDashboardStats,
  ProviderDashboardStats,
  LeadStatus,
} from '@/lib/types';

// ============================================================================
// Lead Creation
// ============================================================================

interface CreateLeadInput {
  referrerCompanyId: string;
  providerCompanyId: string;
  homeownerName: string;
  homeownerPhone: string;
  homeownerAddress: string;
  projectDescription: string;
  category: string;
}

/**
 * Create a new lead with commission snapshot
 * Commission type/value is captured at submission time
 */
export async function createLead(input: CreateLeadInput): Promise<LeadWithCompanies> {
  // Validate referrer company exists and has referrer access
  const referrerCompany = await prisma.company.findUnique({
    where: { id: input.referrerCompanyId },
    select: { id: true, canUseReferrerPortal: true, isSuspended: true },
  });

  if (!referrerCompany) {
    throw new Error('Referrer company not found');
  }

  if (!referrerCompany.canUseReferrerPortal) {
    throw new Error('Company does not have referrer portal access');
  }

  if (referrerCompany.isSuspended) {
    throw new Error('Company is suspended');
  }

  // Validate provider company and get profile
  const providerProfile = await prisma.providerProfile.findUnique({
    where: { companyId: input.providerCompanyId },
    include: {
      company: {
        select: { id: true, canUseProviderPortal: true, isSuspended: true },
      },
    },
  });

  if (!providerProfile) {
    throw new Error('Provider profile not found');
  }

  if (!providerProfile.company.canUseProviderPortal) {
    throw new Error('Provider does not have provider portal access');
  }

  if (providerProfile.company.isSuspended) {
    throw new Error('Provider company is suspended');
  }

  if (!providerProfile.isPublished) {
    throw new Error('Provider is not accepting leads');
  }

  // Prevent self-referral
  if (input.referrerCompanyId === input.providerCompanyId) {
    throw new Error('Cannot submit a lead to your own company');
  }

  // Create lead with commission snapshot
  const lead = await prisma.lead.create({
    data: {
      referrerCompanyId: input.referrerCompanyId,
      providerCompanyId: input.providerCompanyId,
      homeownerName: input.homeownerName,
      homeownerPhone: input.homeownerPhone,
      homeownerAddress: input.homeownerAddress,
      projectDescription: input.projectDescription,
      category: input.category,
      status: 'SUBMITTED',
      commissionTypeSnapshot: providerProfile.commissionType,
      commissionValueSnapshot: providerProfile.commissionValue,
    },
    include: {
      providerCompany: true,
      referrerCompany: true,
    },
  });

  return lead;
}

// ============================================================================
// Lead Status Transitions
// ============================================================================

/**
 * Accept a lead (Provider action)
 */
export async function acceptLead(
  leadId: string,
  providerCompanyId: string
): Promise<LeadWithCompanies> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    throw new Error('Lead not found');
  }

  if (lead.providerCompanyId !== providerCompanyId) {
    throw new Error('Unauthorized: This lead does not belong to your company');
  }

  if (lead.status !== 'SUBMITTED') {
    throw new Error('Lead can only be accepted when in SUBMITTED status');
  }

  return prisma.lead.update({
    where: { id: leadId },
    data: {
      status: 'ACCEPTED',
      updatedAt: new Date(),
    },
    include: {
      providerCompany: true,
      referrerCompany: true,
    },
  });
}

/**
 * Reject a lead (Provider action)
 */
export async function rejectLead(
  leadId: string,
  providerCompanyId: string
): Promise<LeadWithCompanies> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    throw new Error('Lead not found');
  }

  if (lead.providerCompanyId !== providerCompanyId) {
    throw new Error('Unauthorized: This lead does not belong to your company');
  }

  if (lead.status !== 'SUBMITTED') {
    throw new Error('Lead can only be rejected when in SUBMITTED status');
  }

  return prisma.lead.update({
    where: { id: leadId },
    data: {
      status: 'REJECTED',
      updatedAt: new Date(),
    },
    include: {
      providerCompany: true,
      referrerCompany: true,
    },
  });
}

/**
 * Mark job as completed (Provider action)
 * Calculates commission and sets status to awaiting admin confirmation
 */
export async function markJobCompleted(
  leadId: string,
  providerCompanyId: string,
  reportedJobValue: number
): Promise<LeadWithCompanies> {
  if (reportedJobValue <= 0) {
    throw new Error('Job value must be positive');
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead) {
    throw new Error('Lead not found');
  }

  if (lead.providerCompanyId !== providerCompanyId) {
    throw new Error('Unauthorized: This lead does not belong to your company');
  }

  if (lead.status !== 'ACCEPTED') {
    throw new Error('Lead must be in ACCEPTED status to mark as completed');
  }

  // Calculate commission using snapshotted values (SERVER-SIDE ONLY)
  const calculatedCommission = calculateCommission(
    reportedJobValue,
    lead.commissionTypeSnapshot,
    Number(lead.commissionValueSnapshot)
  );

  return prisma.lead.update({
    where: { id: leadId },
    data: {
      status: 'AWAITING_ADMIN_CONFIRMATION',
      reportedJobValue: reportedJobValue,
      calculatedCommission: calculatedCommission,
      updatedAt: new Date(),
    },
    include: {
      providerCompany: true,
      referrerCompany: true,
    },
  });
}

// ============================================================================
// Lead Queries
// ============================================================================

/**
 * Get leads for provider company
 */
export async function getProviderLeads(
  providerCompanyId: string,
  status?: LeadStatus
) {
  return prisma.lead.findMany({
    where: {
      providerCompanyId,
      ...(status && { status }),
    },
    include: {
      providerCompany: true,
      referrerCompany: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get leads for referrer company
 */
export async function getReferrerLeads(
  referrerCompanyId: string,
  status?: LeadStatus
) {
  return prisma.lead.findMany({
    where: {
      referrerCompanyId,
      ...(status && { status }),
    },
    include: {
      providerCompany: true,
      referrerCompany: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get leads awaiting admin confirmation (Admin only)
 */
export async function getLeadsAwaitingConfirmation() {
  return prisma.lead.findMany({
    where: {
      status: 'AWAITING_ADMIN_CONFIRMATION',
    },
    include: {
      providerCompany: true,
      referrerCompany: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Get lead by ID
 */
export async function getLeadById(leadId: string): Promise<LeadWithCompanies | null> {
  return prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      providerCompany: true,
      referrerCompany: true,
    },
  });
}

// ============================================================================
// Dashboard Statistics
// ============================================================================

/**
 * Get referrer dashboard stats
 */
export async function getReferrerDashboardStats(
  companyId: string
): Promise<ReferrerDashboardStats> {
  const [company, leadStats] = await Promise.all([
    prisma.company.findUnique({
      where: { id: companyId },
      select: {
        cashBalance: true,
        benefitsBalance: true,
      },
    }),
    prisma.lead.groupBy({
      by: ['status'],
      where: { referrerCompanyId: companyId },
      _count: true,
    }),
  ]);

  if (!company) {
    throw new Error('Company not found');
  }

  const statusCounts: Record<string, number> = {};
  for (const item of leadStats) {
    statusCounts[item.status] = item._count;
  }

  const totalReferrals = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const acceptedReferrals =
    (statusCounts.ACCEPTED ?? 0) +
    (statusCounts.AWAITING_ADMIN_CONFIRMATION ?? 0) +
    (statusCounts.COMPLETED_CONFIRMED ?? 0);
  const completedReferrals = statusCounts.COMPLETED_CONFIRMED ?? 0;
  const pendingReferrals = statusCounts.SUBMITTED ?? 0;

  return {
    cashBalance: Number(company.cashBalance),
    benefitsBalance: Number(company.benefitsBalance),
    totalReferrals,
    acceptedReferrals,
    completedReferrals,
    pendingReferrals,
  };
}

/**
 * Get provider dashboard stats
 */
export async function getProviderDashboardStats(
  companyId: string
): Promise<ProviderDashboardStats> {
  const leadStats = await prisma.lead.groupBy({
    by: ['status'],
    where: { providerCompanyId: companyId },
    _count: true,
  });

  const statusCounts: Record<string, number> = {};
  for (const item of leadStats) {
    statusCounts[item.status] = item._count;
  }

  return {
    newLeadsCount: statusCounts.SUBMITTED ?? 0,
    acceptedLeadsCount: statusCounts.ACCEPTED ?? 0,
    awaitingConfirmationCount: statusCounts.AWAITING_ADMIN_CONFIRMATION ?? 0,
    completedDealsCount: statusCounts.COMPLETED_CONFIRMED ?? 0,
  };
}
