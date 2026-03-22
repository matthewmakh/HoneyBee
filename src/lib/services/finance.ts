import { prisma } from '@/lib/db';
import type { AdminDashboardStats, CommissionType, WithdrawalRequestWithCompany } from '@/lib/types';

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
    pendingApplicationsCount,
    pendingWithdrawalsCount,
    pendingPriceChangesCount,
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
    prisma.company.count({ where: { providerApplicationPending: true } }),
    prisma.withdrawalRequest.count({ where: { status: 'PENDING' } }),
    prisma.priceChangeRequest.count({ where: { status: 'PENDING' } }),
  ]);

  const [activeCount, suspendedCount] = await Promise.all([
    prisma.company.count({ where: { isSuspended: false } }),
    prisma.company.count({ where: { isSuspended: true } }),
  ]);

  return {
    totalPlatformProfit: platformProfit,
    pendingConfirmationsCount: pendingCount,
    pendingPriceChangesCount,
    completedDealsCount: completedCount,
    totalCompanies: companyStats._count,
    activeCompanies: activeCount,
    suspendedCompanies: suspendedCount,
    pendingApplicationsCount,
    pendingWithdrawalsCount,
  };
}

// ============================================================================
// Withdrawal Requests
// ============================================================================

/**
 * Create a withdrawal request for a referrer company
 */
export async function createWithdrawalRequest(
  companyId: string,
  amount: number,
  notes?: string
) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { cashBalance: true },
  });

  if (!company) throw new Error('Company not found');

  if (Number(company.cashBalance) < amount) {
    throw new Error('Insufficient cash balance');
  }

  // Check for existing pending request
  const existing = await prisma.withdrawalRequest.findFirst({
    where: { companyId, status: 'PENDING' },
  });

  if (existing) {
    throw new Error('You already have a pending withdrawal request');
  }

  return prisma.withdrawalRequest.create({
    data: { companyId, amount, notes: notes ?? null },
  });
}

/**
 * Get all pending withdrawal requests (Admin only)
 */
export async function getPendingWithdrawalRequests(): Promise<WithdrawalRequestWithCompany[]> {
  return prisma.withdrawalRequest.findMany({
    where: { status: 'PENDING' },
    include: { company: true },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Get all withdrawal requests for a company
 */
export async function getCompanyWithdrawalRequests(companyId: string) {
  return prisma.withdrawalRequest.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Mark a withdrawal request as completed (Admin) — deducts from balance
 */
export async function completeWithdrawalRequest(requestId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const request = await tx.withdrawalRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error('Withdrawal request not found');
    if (request.status !== 'PENDING') throw new Error('Request is not pending');

    const company = await tx.company.findUnique({
      where: { id: request.companyId },
      select: { cashBalance: true },
    });

    if (!company) throw new Error('Company not found');
    if (Number(company.cashBalance) < Number(request.amount)) {
      throw new Error('Insufficient balance to complete withdrawal');
    }

    await tx.withdrawalRequest.update({
      where: { id: requestId },
      data: { status: 'COMPLETED', updatedAt: new Date() },
    });

    await tx.company.update({
      where: { id: request.companyId },
      data: { cashBalance: { decrement: request.amount } },
    });
  });
}

/**
 * Reject a withdrawal request (Admin)
 */
export async function rejectWithdrawalRequest(requestId: string): Promise<void> {
  const request = await prisma.withdrawalRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new Error('Withdrawal request not found');
  if (request.status !== 'PENDING') throw new Error('Request is not pending');

  await prisma.withdrawalRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED', updatedAt: new Date() },
  });
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
