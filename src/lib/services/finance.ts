import { prisma } from '@/lib/db';
import type { AdminDashboardStats, CommissionType } from '@/lib/types';

// ============================================================================
// Commission Calculation (Server-Side Only)
// ============================================================================

/**
 * Calculate commission based on commission type and value
 * MUST be called server-side only - never expose to client
 */
export function calculateCommission(
  reportedJobValue: number,
  commissionType: CommissionType,
  commissionValue: number
): number {
  if (reportedJobValue <= 0) {
    throw new Error('Job value must be positive');
  }

  if (commissionValue <= 0) {
    throw new Error('Commission value must be positive');
  }

  let commission: number;

  if (commissionType === 'PERCENT') {
    // Percent-based commission
    commission = reportedJobValue * (commissionValue / 100);
  } else {
    // Flat commission
    commission = commissionValue;
  }

  // Round to 2 decimal places
  return Math.round(commission * 100) / 100;
}

// ============================================================================
// Commission Split Constants
// ============================================================================

const REFERRER_CASH_PERCENTAGE = 50;
const REFERRER_BENEFITS_PERCENTAGE = 40;
const PLATFORM_PROFIT_PERCENTAGE = 10;

/**
 * Calculate the split of commission
 * Returns percentages that sum to 100%
 */
export function calculateCommissionSplit(totalCommission: number): {
  referrerCash: number;
  referrerBenefits: number;
  platformProfit: number;
} {
  return {
    referrerCash: Math.round((totalCommission * REFERRER_CASH_PERCENTAGE / 100) * 100) / 100,
    referrerBenefits: Math.round((totalCommission * REFERRER_BENEFITS_PERCENTAGE / 100) * 100) / 100,
    platformProfit: Math.round((totalCommission * PLATFORM_PROFIT_PERCENTAGE / 100) * 100) / 100,
  };
}

// ============================================================================
// Process Completion (Transaction-Based)
// ============================================================================

/**
 * Process the completion of a lead with proper atomic transactions
 * This is called when Super Admin confirms a completed job
 * 
 * CRITICAL: All balance updates MUST be accompanied by transaction records
 */
export async function processLeadCompletion(leadId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. Fetch the lead with all necessary data
    const lead = await tx.lead.findUnique({
      where: { id: leadId },
      include: {
        referrerCompany: true,
      },
    });

    if (!lead) {
      throw new Error('Lead not found');
    }

    if (lead.status !== 'AWAITING_ADMIN_CONFIRMATION') {
      throw new Error('Lead must be awaiting admin confirmation');
    }

    if (lead.calculatedCommission === null) {
      throw new Error('Lead commission has not been calculated');
    }

    const totalCommission = Number(lead.calculatedCommission);
    const split = calculateCommissionSplit(totalCommission);

    // 2. Update lead status to completed
    await tx.lead.update({
      where: { id: leadId },
      data: {
        status: 'COMPLETED_CONFIRMED',
        updatedAt: new Date(),
      },
    });

    // 3. Update referrer company balances
    await tx.company.update({
      where: { id: lead.referrerCompanyId },
      data: {
        cashBalance: {
          increment: split.referrerCash,
        },
        benefitsBalance: {
          increment: split.referrerBenefits,
        },
      },
    });

    // 4. Create wallet transaction for cash credit
    await tx.walletTransaction.create({
      data: {
        companyId: lead.referrerCompanyId,
        leadId: lead.id,
        type: 'CASH',
        amount: split.referrerCash,
      },
    });

    // 5. Create wallet transaction for benefits credit
    await tx.walletTransaction.create({
      data: {
        companyId: lead.referrerCompanyId,
        leadId: lead.id,
        type: 'BENEFITS',
        amount: split.referrerBenefits,
      },
    });

    // 6. Create platform profit ledger entry (no company - platform level)
    await tx.walletTransaction.create({
      data: {
        companyId: null, // Platform profit
        leadId: lead.id,
        type: 'PLATFORM_PROFIT',
        amount: split.platformProfit,
      },
    });
  });
}

// ============================================================================
// Balance Queries
// ============================================================================

/**
 * Get company balances (returns actual numbers)
 */
export async function getCompanyBalances(
  companyId: string
): Promise<{ cashBalance: number; benefitsBalance: number }> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      cashBalance: true,
      benefitsBalance: true,
    },
  });

  if (!company) {
    throw new Error('Company not found');
  }

  return {
    cashBalance: Number(company.cashBalance),
    benefitsBalance: Number(company.benefitsBalance),
  };
}

/**
 * Get total platform profit from all completed deals
 */
export async function getTotalPlatformProfit(): Promise<number> {
  const result = await prisma.walletTransaction.aggregate({
    where: {
      type: 'PLATFORM_PROFIT',
    },
    _sum: {
      amount: true,
    },
  });

  return Number(result._sum.amount ?? 0);
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [
    platformProfit,
    pendingCount,
    completedCount,
    companyStats,
  ] = await Promise.all([
    getTotalPlatformProfit(),
    prisma.lead.count({
      where: { status: 'AWAITING_ADMIN_CONFIRMATION' },
    }),
    prisma.lead.count({
      where: { status: 'COMPLETED_CONFIRMED' },
    }),
    prisma.company.aggregate({
      _count: true,
    }),
  ]);

  const [activeCount, suspendedCount] = await Promise.all([
    prisma.company.count({ where: { isSuspended: false } }),
    prisma.company.count({ where: { isSuspended: true } }),
  ]);

  return {
    totalPlatformProfit: platformProfit,
    pendingConfirmationsCount: pendingCount,
    completedDealsCount: completedCount,
    totalCompanies: companyStats._count,
    activeCompanies: activeCount,
    suspendedCompanies: suspendedCount,
  };
}

/**
 * Get wallet transaction history for a company
 */
export async function getCompanyTransactionHistory(
  companyId: string,
  limit = 50
) {
  return prisma.walletTransaction.findMany({
    where: { companyId },
    include: {
      lead: {
        select: {
          id: true,
          homeownerName: true,
          category: true,
          providerCompany: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
