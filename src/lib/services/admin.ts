import { prisma } from '@/lib/db';
import type { Company, User, WalletTransaction, Lead, ProviderProfile, PriceChangeRequest } from '@prisma/client';

// ============================================================================
// Types
// ============================================================================

export interface AdminCompanyView extends Company {
  users: Pick<User, 'id' | 'name' | 'email' | 'phone' | 'role' | 'lastActiveAt' | 'createdAt'>[];
  providerProfile: ProviderProfile | null;
  _count: {
    leadsAsProvider: number;
    leadsAsReferrer: number;
    walletTransactions: number;
  };
}

export interface AdminUserView extends User {
  company: Pick<Company, 'id' | 'name' | 'memberId' | 'isSuspended'>;
}

export interface AdminTransactionView extends WalletTransaction {
  company: Pick<Company, 'id' | 'name' | 'memberId'> | null;
  lead: Pick<Lead, 'id' | 'homeownerName' | 'category' | 'status'> & {
    providerCompany: Pick<Company, 'id' | 'name'>;
    referrerCompany: Pick<Company, 'id' | 'name'>;
  };
}

export interface AdminLeadView extends Lead {
  providerCompany: Pick<Company, 'id' | 'name' | 'memberId'>;
  referrerCompany: Pick<Company, 'id' | 'name' | 'memberId'>;
}

export interface PendingApprovalCounts {
  providerApplications: number;
  pendingDeals: number;
  priceChangeRequests: number;
  withdrawalRequests: number;
}

export interface AdminOverviewStats {
  // Financial
  totalPlatformProfit: number;
  totalCommissionsPaid: number;
  totalCashPaidOut: number;
  totalBenefitsCredits: number;
  
  // Companies
  totalCompanies: number;
  activeCompanies: number;
  suspendedCompanies: number;
  providersCount: number;
  referrersCount: number;
  
  // Users
  totalUsers: number;
  activeUsersLast24h: number;
  activeUsersLast7d: number;
  
  // Leads
  totalLeads: number;
  pendingLeads: number;
  acceptedLeads: number;
  completedLeads: number;
  rejectedLeads: number;
  
  // Pending Approvals
  pendingApprovals: PendingApprovalCounts;
}

// ============================================================================
// Admin Overview Stats
// ============================================================================

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    platformProfit,
    totalCommissions,
    cashPayouts,
    benefitsCredits,
    companyStats,
    providersCount,
    referrersCount,
    totalUsers,
    activeUsers24h,
    activeUsers7d,
    leadStats,
    pendingApprovals,
  ] = await Promise.all([
    // Platform profit (sum of all platform profit transactions)
    prisma.walletTransaction.aggregate({
      where: { type: 'PLATFORM_PROFIT' },
      _sum: { amount: true },
    }),
    
    // Total commissions paid (cash + benefits)
    prisma.walletTransaction.aggregate({
      where: { type: { in: ['CASH', 'BENEFITS'] } },
      _sum: { amount: true },
    }),
    
    // Cash paid out
    prisma.walletTransaction.aggregate({
      where: { type: 'CASH' },
      _sum: { amount: true },
    }),
    
    // Benefits credits
    prisma.walletTransaction.aggregate({
      where: { type: 'BENEFITS' },
      _sum: { amount: true },
    }),
    
    // Company stats
    prisma.company.groupBy({
      by: ['isSuspended'],
      _count: true,
    }),
    
    // Providers count
    prisma.company.count({
      where: { canUseProviderPortal: true },
    }),
    
    // Referrers count
    prisma.company.count({
      where: { canUseReferrerPortal: true },
    }),
    
    // Total users
    prisma.user.count(),
    
    // Active users last 24h
    prisma.user.count({
      where: { lastActiveAt: { gte: last24h } },
    }),
    
    // Active users last 7d  
    prisma.user.count({
      where: { lastActiveAt: { gte: last7d } },
    }),
    
    // Lead stats by status
    prisma.lead.groupBy({
      by: ['status'],
      _count: true,
    }),
    
    // Pending approvals
    Promise.all([
      prisma.company.count({ where: { providerApplicationPending: true } }),
      prisma.lead.count({ where: { status: 'AWAITING_ADMIN_CONFIRMATION' } }),
      prisma.priceChangeRequest.count({ where: { status: 'PENDING' } }),
      prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
    ]),
  ]);

  const companyStatsByStatus = companyStats.reduce((acc, stat) => {
    if (stat.isSuspended) {
      acc.suspended = stat._count;
    } else {
      acc.active = stat._count;
    }
    return acc;
  }, { active: 0, suspended: 0 });

  const leadStatsByStatus = leadStats.reduce((acc, stat) => {
    acc[stat.status] = stat._count;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalPlatformProfit: Number(platformProfit._sum.amount ?? 0),
    totalCommissionsPaid: Number(totalCommissions._sum.amount ?? 0),
    totalCashPaidOut: Number(cashPayouts._sum.amount ?? 0),
    totalBenefitsCredits: Number(benefitsCredits._sum.amount ?? 0),
    
    totalCompanies: companyStatsByStatus.active + companyStatsByStatus.suspended,
    activeCompanies: companyStatsByStatus.active,
    suspendedCompanies: companyStatsByStatus.suspended,
    providersCount,
    referrersCount,
    
    totalUsers,
    activeUsersLast24h: activeUsers24h,
    activeUsersLast7d: activeUsers7d,
    
    totalLeads: Object.values(leadStatsByStatus).reduce((a, b) => a + b, 0),
    pendingLeads: leadStatsByStatus.SUBMITTED ?? 0,
    acceptedLeads: leadStatsByStatus.ACCEPTED ?? 0,
    completedLeads: leadStatsByStatus.COMPLETED_CONFIRMED ?? 0,
    rejectedLeads: leadStatsByStatus.REJECTED ?? 0,
    
    pendingApprovals: {
      providerApplications: pendingApprovals[0],
      pendingDeals: pendingApprovals[1],
      priceChangeRequests: pendingApprovals[2],
      withdrawalRequests: pendingApprovals[3],
    },
  };
}

// ============================================================================
// Company Management
// ============================================================================

export async function getAllCompaniesWithDetails(
  options: {
    search?: string;
    status?: 'all' | 'active' | 'suspended';
    type?: 'all' | 'provider' | 'referrer';
    sortBy?: 'name' | 'createdAt' | 'lastActive';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<AdminCompanyView[]> {
  const { search, status = 'all', type = 'all', sortBy = 'createdAt', sortOrder = 'desc' } = options;

  const where: Parameters<typeof prisma.company.findMany>[0]['where'] = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { memberId: { contains: search, mode: 'insensitive' } },
      { users: { some: { email: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  if (status !== 'all') {
    where.isSuspended = status === 'suspended';
  }

  if (type === 'provider') {
    where.canUseProviderPortal = true;
  } else if (type === 'referrer') {
    where.canUseReferrerPortal = true;
  }

  const orderBy: Parameters<typeof prisma.company.findMany>[0]['orderBy'] = {};
  if (sortBy === 'lastActive') {
    // Sort by most recent user activity
    orderBy.users = { _count: sortOrder };
  } else {
    orderBy[sortBy] = sortOrder;
  }

  const companies = await prisma.company.findMany({
    where,
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          lastActiveAt: true,
          createdAt: true,
        },
        orderBy: { lastActiveAt: 'desc' },
      },
      providerProfile: true,
      _count: {
        select: {
          leadsAsProvider: true,
          leadsAsReferrer: true,
          walletTransactions: true,
        },
      },
    },
    orderBy,
  });

  return companies;
}

export async function getCompanyById(companyId: string): Promise<AdminCompanyView | null> {
  return prisma.company.findUnique({
    where: { id: companyId },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          lastActiveAt: true,
          createdAt: true,
        },
      },
      providerProfile: true,
      _count: {
        select: {
          leadsAsProvider: true,
          leadsAsReferrer: true,
          walletTransactions: true,
        },
      },
    },
  });
}

export async function suspendCompany(companyId: string): Promise<void> {
  await prisma.company.update({
    where: { id: companyId },
    data: { isSuspended: true },
  });
}

export async function unsuspendCompany(companyId: string): Promise<void> {
  await prisma.company.update({
    where: { id: companyId },
    data: { isSuspended: false },
  });
}

// ============================================================================
// User Management
// ============================================================================

export async function getAllUsers(
  options: {
    search?: string;
    companyId?: string;
    role?: 'all' | 'USER' | 'SUPERADMIN';
    sortBy?: 'name' | 'email' | 'lastActiveAt' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<AdminUserView[]> {
  const { search, companyId, role = 'all', sortBy = 'lastActiveAt', sortOrder = 'desc' } = options;

  const where: Parameters<typeof prisma.user.findMany>[0]['where'] = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (companyId) {
    where.companyId = companyId;
  }

  if (role !== 'all') {
    where.role = role;
  }

  return prisma.user.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          name: true,
          memberId: true,
          isSuspended: true,
        },
      },
    },
    orderBy: { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' },
  });
}

export async function updateUserLastActive(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { lastActiveAt: new Date() },
  });
}

// ============================================================================
// Transaction Log
// ============================================================================

export async function getAllTransactions(
  options: {
    search?: string;
    companyId?: string;
    type?: 'all' | 'CASH' | 'BENEFITS' | 'PLATFORM_PROFIT';
    startDate?: Date;
    endDate?: Date;
    sortBy?: 'createdAt' | 'amount';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ transactions: AdminTransactionView[]; total: number }> {
  const { 
    search, 
    companyId, 
    type = 'all', 
    startDate, 
    endDate, 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    limit = 50,
    offset = 0,
  } = options;

  const where: Parameters<typeof prisma.walletTransaction.findMany>[0]['where'] = {};

  if (companyId) {
    where.companyId = companyId;
  }

  if (type !== 'all') {
    where.type = type;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  if (search) {
    where.OR = [
      { company: { name: { contains: search, mode: 'insensitive' } } },
      { company: { memberId: { contains: search, mode: 'insensitive' } } },
      { lead: { homeownerName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            memberId: true,
          },
        },
        lead: {
          select: {
            id: true,
            homeownerName: true,
            category: true,
            status: true,
            providerCompany: {
              select: { id: true, name: true },
            },
            referrerCompany: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
    }),
    prisma.walletTransaction.count({ where }),
  ]);

  return { transactions, total };
}

// ============================================================================
// Lead Management
// ============================================================================

export async function getAllLeads(
  options: {
    search?: string;
    status?: string;
    providerCompanyId?: string;
    referrerCompanyId?: string;
    startDate?: Date;
    endDate?: Date;
    sortBy?: 'createdAt' | 'updatedAt' | 'homeownerName';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ leads: AdminLeadView[]; total: number }> {
  const {
    search,
    status,
    providerCompanyId,
    referrerCompanyId,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    limit = 50,
    offset = 0,
  } = options;

  const where: Parameters<typeof prisma.lead.findMany>[0]['where'] = {};

  if (search) {
    where.OR = [
      { homeownerName: { contains: search, mode: 'insensitive' } },
      { homeownerPhone: { contains: search, mode: 'insensitive' } },
      { homeownerAddress: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status && status !== 'all') {
    where.status = status as any;
  }

  if (providerCompanyId) {
    where.providerCompanyId = providerCompanyId;
  }

  if (referrerCompanyId) {
    where.referrerCompanyId = referrerCompanyId;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        providerCompany: {
          select: { id: true, name: true, memberId: true },
        },
        referrerCompany: {
          select: { id: true, name: true, memberId: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
    }),
    prisma.lead.count({ where }),
  ]);

  return { leads, total };
}

// ============================================================================
// Pending Approvals
// ============================================================================

export async function getPendingProviderApplications() {
  return prisma.company.findMany({
    where: { providerApplicationPending: true },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
        take: 1,
      },
      providerProfile: true,
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getPendingPriceChangeRequests() {
  return prisma.priceChangeRequest.findMany({
    where: { status: 'PENDING' },
    include: {
      lead: {
        include: {
          providerCompany: {
            select: { id: true, name: true, memberId: true },
          },
          referrerCompany: {
            select: { id: true, name: true, memberId: true },
          },
        },
      },
      requestedByCompany: {
        select: { id: true, name: true, memberId: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getPendingWithdrawals() {
  return prisma.withdrawalRequest.findMany({
    where: { status: 'PENDING' },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          memberId: true,
          cashBalance: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getPendingDeals() {
  return prisma.lead.findMany({
    where: { status: 'AWAITING_ADMIN_CONFIRMATION' },
    include: {
      providerCompany: {
        select: { id: true, name: true, memberId: true },
      },
      referrerCompany: {
        select: { id: true, name: true, memberId: true },
      },
    },
    orderBy: { updatedAt: 'asc' },
  });
}

// ============================================================================
// Activity Log
// ============================================================================

export async function getRecentActivity(limit = 20) {
  // Get recent transactions, leads, and other activity
  const [recentTransactions, recentLeads, recentUsers] = await Promise.all([
    prisma.walletTransaction.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { name: true, memberId: true } },
      },
    }),
    prisma.lead.findMany({
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        providerCompany: { select: { name: true } },
        referrerCompany: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        company: { select: { name: true } },
      },
    }),
  ]);

  return {
    recentTransactions,
    recentLeads,
    recentUsers,
  };
}

// ============================================================================
// All Leads View
// ============================================================================

export interface AdminLeadWithDetails {
  id: string;
  homeownerName: string;
  homeownerPhone: string;
  homeownerAddress: string;
  category: string;
  projectDescription: string;
  status: string;
  estimatedJobValue: number | null;
  reportedJobValue: number | null;
  calculatedCommission: number | null;
  commissionTypeSnapshot: string;
  commissionValueSnapshot: number;
  createdAt: Date;
  updatedAt: Date;
  providerCompany: {
    id: string;
    name: string;
    memberId: string;
  };
  referrerCompany: {
    id: string;
    name: string;
    memberId: string;
  };
}

export async function getAllLeadsSimple(): Promise<AdminLeadWithDetails[]> {
  const leads = await prisma.lead.findMany({
    include: {
      providerCompany: {
        select: { id: true, name: true, memberId: true },
      },
      referrerCompany: {
        select: { id: true, name: true, memberId: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return leads.map(lead => ({
    id: lead.id,
    homeownerName: lead.homeownerName,
    homeownerPhone: lead.homeownerPhone,
    homeownerAddress: lead.homeownerAddress,
    category: lead.category,
    projectDescription: lead.projectDescription,
    status: lead.status,
    estimatedJobValue: lead.estimatedJobValue ? Number(lead.estimatedJobValue) : null,
    reportedJobValue: lead.reportedJobValue ? Number(lead.reportedJobValue) : null,
    calculatedCommission: lead.calculatedCommission ? Number(lead.calculatedCommission) : null,
    commissionTypeSnapshot: lead.commissionTypeSnapshot,
    commissionValueSnapshot: Number(lead.commissionValueSnapshot),
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
    providerCompany: lead.providerCompany,
    referrerCompany: lead.referrerCompany,
  }));
}

export interface LeadStats {
  totalLeads: number;
  totalJobValue: number;
  totalCommissions: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
}

export async function getLeadStats(): Promise<LeadStats> {
  const [leads, statusCounts, categoryCounts] = await Promise.all([
    prisma.lead.aggregate({
      _sum: {
        reportedJobValue: true,
        calculatedCommission: true,
      },
      _count: true,
    }),
    prisma.lead.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.lead.groupBy({
      by: ['category'],
      _count: true,
    }),
  ]);

  const byStatus: Record<string, number> = {};
  for (const item of statusCounts) {
    byStatus[item.status] = item._count;
  }

  const byCategory: Record<string, number> = {};
  for (const item of categoryCounts) {
    byCategory[item.category] = item._count;
  }

  return {
    totalLeads: leads._count,
    totalJobValue: Number(leads._sum.reportedJobValue ?? 0),
    totalCommissions: Number(leads._sum.calculatedCommission ?? 0),
    byStatus,
    byCategory,
  };
}
