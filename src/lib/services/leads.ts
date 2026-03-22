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
  photos?: string[];
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
      photos: input.photos ?? [],
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
 * Requires estimated job value to calculate pending commission
 */
export async function acceptLead(
  leadId: string,
  providerCompanyId: string,
  estimatedJobValue: number
): Promise<LeadWithCompanies> {
  if (estimatedJobValue <= 0) {
    throw new Error('Estimated job value must be greater than 0');
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

  if (lead.status !== 'SUBMITTED') {
    throw new Error('Lead can only be accepted when in SUBMITTED status');
  }

  return prisma.lead.update({
    where: { id: leadId },
    data: {
      status: 'ACCEPTED',
      estimatedJobValue: estimatedJobValue,
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
 * Get leads for provider company with notes and price change requests included
 */
export async function getProviderLeadsWithNotes(
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
      notes: {
        include: { authorCompany: true },
        orderBy: { createdAt: 'desc' },
      },
      priceChangeRequests: {
        orderBy: { createdAt: 'desc' },
        take: 1, // Only get the most recent
      },
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
 * Get referrer dashboard stats including pending earnings
 */
export async function getReferrerDashboardStats(
  companyId: string
): Promise<ReferrerDashboardStats> {
  const [company, leadStats, acceptedLeads] = await Promise.all([
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
    // Get accepted leads with estimated values (for pending earnings)
    prisma.lead.findMany({
      where: {
        referrerCompanyId: companyId,
        status: { in: ['ACCEPTED', 'AWAITING_ADMIN_CONFIRMATION'] },
        estimatedJobValue: { not: null },
      },
      select: {
        estimatedJobValue: true,
        commissionTypeSnapshot: true,
        commissionValueSnapshot: true,
      },
    }),
  ]);

  if (!company) {
    throw new Error('Company not found');
  }

  // Calculate pending earnings from accepted leads
  let totalPendingCommission = 0;
  for (const lead of acceptedLeads) {
    if (lead.estimatedJobValue) {
      const estimatedValue = Number(lead.estimatedJobValue);
      const commissionValue = Number(lead.commissionValueSnapshot);
      
      if (lead.commissionTypeSnapshot === 'PERCENT') {
        totalPendingCommission += estimatedValue * (commissionValue / 100);
      } else {
        totalPendingCommission += commissionValue;
      }
    }
  }

  // Split pending commission (50% cash, 40% benefits)
  const pendingCashEarnings = Math.round((totalPendingCommission * 0.5) * 100) / 100;
  const pendingBenefitsEarnings = Math.round((totalPendingCommission * 0.4) * 100) / 100;

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
    pendingCashEarnings,
    pendingBenefitsEarnings,
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

// ============================================================================
// Price Change Requests
// ============================================================================

/**
 * Create a price change request
 */
export async function createPriceChangeRequest(
  leadId: string,
  providerCompanyId: string,
  requestedByName: string,
  requestedPrice: number,
  reason: string
) {
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
    throw new Error('Price changes can only be requested for accepted leads');
  }

  if (!lead.estimatedJobValue) {
    throw new Error('Lead does not have an estimated job value');
  }

  // Check if there's already a pending price change request
  const existingRequest = await prisma.priceChangeRequest.findFirst({
    where: {
      leadId,
      status: 'PENDING',
    },
  });

  if (existingRequest) {
    throw new Error('There is already a pending price change request for this lead');
  }

  return prisma.priceChangeRequest.create({
    data: {
      leadId,
      requestedByCompanyId: providerCompanyId,
      requestedByName,
      currentPrice: lead.estimatedJobValue,
      requestedPrice,
      reason,
    },
    include: {
      lead: {
        include: {
          providerCompany: true,
          referrerCompany: true,
        },
      },
      requestedByCompany: true,
    },
  });
}

/**
 * Get pending price change requests (Admin only)
 */
export async function getPendingPriceChangeRequests() {
  return prisma.priceChangeRequest.findMany({
    where: {
      status: 'PENDING',
    },
    include: {
      lead: {
        include: {
          providerCompany: true,
          referrerCompany: true,
        },
      },
      requestedByCompany: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Approve a price change request (Admin only)
 */
export async function approvePriceChangeRequest(
  requestId: string,
  adminNotes?: string
) {
  const request = await prisma.priceChangeRequest.findUnique({
    where: { id: requestId },
    include: { lead: true },
  });

  if (!request) {
    throw new Error('Price change request not found');
  }

  if (request.status !== 'PENDING') {
    throw new Error('Price change request is not pending');
  }

  // Update both the request and the lead's estimated value
  return prisma.$transaction([
    prisma.priceChangeRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        adminNotes,
        resolvedAt: new Date(),
      },
    }),
    prisma.lead.update({
      where: { id: request.leadId },
      data: {
        estimatedJobValue: request.requestedPrice,
        updatedAt: new Date(),
      },
    }),
  ]);
}

/**
 * Reject a price change request (Admin only)
 */
export async function rejectPriceChangeRequest(
  requestId: string,
  adminNotes?: string
) {
  const request = await prisma.priceChangeRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error('Price change request not found');
  }

  if (request.status !== 'PENDING') {
    throw new Error('Price change request is not pending');
  }

  return prisma.priceChangeRequest.update({
    where: { id: requestId },
    data: {
      status: 'REJECTED',
      adminNotes,
      resolvedAt: new Date(),
    },
  });
}

/**
 * Update estimated job value directly (used when lead's estimatedJobValue needs updating)
 */
export async function updateLeadEstimatedValue(
  leadId: string,
  providerCompanyId: string,
  newValue: number
) {
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
    throw new Error('Can only update estimated value for accepted leads');
  }

  return prisma.lead.update({
    where: { id: leadId },
    data: {
      estimatedJobValue: newValue,
      updatedAt: new Date(),
    },
    include: {
      providerCompany: true,
      referrerCompany: true,
    },
  });
}

// ============================================================================
// Enhanced Stats & Job History
// ============================================================================

export interface ReferrerJobHistoryStats {
  // Lifetime earnings
  lifetimeTotalEarnings: number;
  lifetimeCashEarnings: number;
  lifetimeBenefitsEarnings: number;
  
  // This month
  monthTotalEarnings: number;
  monthCashEarnings: number;
  monthBenefitsEarnings: number;
  
  // Achievement stats
  highestSingleJobEarning: number;
  averageJobEarning: number;
  totalJobsCompleted: number;
  thisMonthJobsCompleted: number;
  
  // Recent completed jobs
  recentCompletedJobs: {
    id: string;
    providerName: string;
    homeownerName: string;
    category: string;
    jobValue: number;
    commission: number;
    cashPortion: number;
    benefitsPortion: number;
    completedAt: Date;
  }[];
}

export interface ProviderJobHistoryStats {
  // Revenue stats
  lifetimeJobValue: number;
  lifetimeCommissionPaid: number;
  thisMonthJobValue: number;
  thisMonthCommissionPaid: number;
  
  // Job stats
  totalJobsCompleted: number;
  thisMonthJobsCompleted: number;
  averageJobValue: number;
  highestJobValue: number;
  
  // Recent completed jobs
  recentCompletedJobs: {
    id: string;
    referrerName: string;
    homeownerName: string;
    category: string;
    jobValue: number;
    commissionPaid: number;
    completedAt: Date;
  }[];
}

/**
 * Get enhanced referrer job history and earnings stats
 */
export async function getReferrerJobHistoryStats(
  companyId: string
): Promise<ReferrerJobHistoryStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all completed jobs for this referrer
  const completedJobs = await prisma.lead.findMany({
    where: {
      referrerCompanyId: companyId,
      status: 'COMPLETED_CONFIRMED',
      calculatedCommission: { not: null },
    },
    include: {
      providerCompany: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Calculate lifetime stats
  let lifetimeTotalEarnings = 0;
  let highestSingleJobEarning = 0;
  let monthTotalEarnings = 0;
  let thisMonthJobsCompleted = 0;

  const recentCompletedJobs = completedJobs.slice(0, 10).map(job => {
    const commission = Number(job.calculatedCommission ?? 0);
    const cashPortion = Math.round(commission * 0.5 * 100) / 100;
    const benefitsPortion = Math.round(commission * 0.4 * 100) / 100;
    
    return {
      id: job.id,
      providerName: job.providerCompany.name,
      homeownerName: job.homeownerName,
      category: job.category,
      jobValue: Number(job.reportedJobValue ?? 0),
      commission,
      cashPortion,
      benefitsPortion,
      completedAt: job.updatedAt,
    };
  });

  for (const job of completedJobs) {
    const commission = Number(job.calculatedCommission ?? 0);
    lifetimeTotalEarnings += commission;
    
    if (commission > highestSingleJobEarning) {
      highestSingleJobEarning = commission;
    }
    
    if (job.updatedAt >= startOfMonth) {
      monthTotalEarnings += commission;
      thisMonthJobsCompleted++;
    }
  }

  const lifetimeCashEarnings = Math.round(lifetimeTotalEarnings * 0.5 * 100) / 100;
  const lifetimeBenefitsEarnings = Math.round(lifetimeTotalEarnings * 0.4 * 100) / 100;
  const monthCashEarnings = Math.round(monthTotalEarnings * 0.5 * 100) / 100;
  const monthBenefitsEarnings = Math.round(monthTotalEarnings * 0.4 * 100) / 100;
  const averageJobEarning = completedJobs.length > 0 
    ? Math.round(lifetimeTotalEarnings / completedJobs.length * 100) / 100 
    : 0;

  return {
    lifetimeTotalEarnings,
    lifetimeCashEarnings,
    lifetimeBenefitsEarnings,
    monthTotalEarnings,
    monthCashEarnings,
    monthBenefitsEarnings,
    highestSingleJobEarning,
    averageJobEarning,
    totalJobsCompleted: completedJobs.length,
    thisMonthJobsCompleted,
    recentCompletedJobs,
  };
}

/**
 * Get enhanced provider job history and revenue stats
 */
export async function getProviderJobHistoryStats(
  companyId: string
): Promise<ProviderJobHistoryStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get all completed jobs for this provider
  const completedJobs = await prisma.lead.findMany({
    where: {
      providerCompanyId: companyId,
      status: 'COMPLETED_CONFIRMED',
      reportedJobValue: { not: null },
    },
    include: {
      referrerCompany: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Calculate stats
  let lifetimeJobValue = 0;
  let lifetimeCommissionPaid = 0;
  let thisMonthJobValue = 0;
  let thisMonthCommissionPaid = 0;
  let thisMonthJobsCompleted = 0;
  let highestJobValue = 0;

  const recentCompletedJobs = completedJobs.slice(0, 10).map(job => {
    const jobValue = Number(job.reportedJobValue ?? 0);
    const commissionPaid = Number(job.calculatedCommission ?? 0);
    
    return {
      id: job.id,
      referrerName: job.referrerCompany.name,
      homeownerName: job.homeownerName,
      category: job.category,
      jobValue,
      commissionPaid,
      completedAt: job.updatedAt,
    };
  });

  for (const job of completedJobs) {
    const jobValue = Number(job.reportedJobValue ?? 0);
    const commission = Number(job.calculatedCommission ?? 0);
    
    lifetimeJobValue += jobValue;
    lifetimeCommissionPaid += commission;
    
    if (jobValue > highestJobValue) {
      highestJobValue = jobValue;
    }
    
    if (job.updatedAt >= startOfMonth) {
      thisMonthJobValue += jobValue;
      thisMonthCommissionPaid += commission;
      thisMonthJobsCompleted++;
    }
  }

  const averageJobValue = completedJobs.length > 0 
    ? Math.round(lifetimeJobValue / completedJobs.length * 100) / 100 
    : 0;

  return {
    lifetimeJobValue,
    lifetimeCommissionPaid,
    thisMonthJobValue,
    thisMonthCommissionPaid,
    totalJobsCompleted: completedJobs.length,
    thisMonthJobsCompleted,
    averageJobValue,
    highestJobValue,
    recentCompletedJobs,
  };
}
