import { prisma } from '@/lib/db';
import type {
  AdminDashboardStats,
  CommissionType,
  WithdrawalRequestWithCompany,
  UplineSnapshot,
  PayoutLineType,
  CommissionPlanLine,
} from '@/lib/types';

// ============================================================================
// Commission Calculation (Server-Side Only)
// ============================================================================

/**
 * Calculate gross commission from reported job value and provider offer.
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

  const commission =
    commissionType === 'PERCENT'
      ? reportedJobValue * (commissionValue / 100)
      : commissionValue;

  return Math.round(commission * 100) / 100;
}

// ============================================================================
// 12-Line Payout Split
// ============================================================================

export interface PayoutLineResult {
  lineType: PayoutLineType;
  label: string;
  beneficiaryCompanyId: string | null;
  amount: number;
}

/**
 * Map line type -> beneficiary company id from the lead's upline snapshot.
 * Returns null for pools / platform lines (not tied to a single person).
 */
function beneficiaryForLine(
  lineType: PayoutLineType,
  referrerCompanyId: string,
  upline: UplineSnapshot
): string | null {
  switch (lineType) {
    case 'DIRECT_REFERRER':
      return referrerCompanyId;
    case 'L1_MANAGER':
      return upline.l1ManagerCompanyId;
    case 'L2_MANAGER':
      return upline.l2ManagerCompanyId;
    case 'L3_MANAGER':
      return upline.l3ManagerCompanyId;
    case 'CLUB_ADMIN':
      return upline.clubAdminCompanyId;
    case 'ORIGINAL_SPONSOR_LIFETIME':
      return upline.originalSponsorCompanyId;
    default:
      return null; // pools / platform fee
  }
}

/**
 * Split a total commission across the 12 configured lines.
 * Inactive lines are skipped. Lines with no beneficiary are still created
 * (with beneficiaryCompanyId = null) so admin can allocate pool funds.
 */
export function splitCommissionAcrossLines(
  totalCommission: number,
  planLines: Pick<CommissionPlanLine, 'lineType' | 'label' | 'percentBps' | 'isActive'>[],
  referrerCompanyId: string,
  upline: UplineSnapshot
): PayoutLineResult[] {
  const results: PayoutLineResult[] = [];
  for (const line of planLines) {
    if (!line.isActive) continue;
    const amount = Math.round(totalCommission * (line.percentBps / 10000) * 100) / 100;
    results.push({
      lineType: line.lineType,
      label: line.label,
      beneficiaryCompanyId: beneficiaryForLine(line.lineType, referrerCompanyId, upline),
      amount,
    });
  }
  return results;
}

// ============================================================================
// Active Commission Plan
// ============================================================================

/**
 * Get the active commission plan's lines, or an empty list if none configured.
 * Callers should ensure an active plan exists (seed / admin setup).
 */
export async function getActivePlanLines() {
  const plan = await prisma.commissionPlan.findFirst({
    where: { isActive: true },
    include: { lines: true },
  });
  return plan?.lines ?? [];
}

// ============================================================================
// Lead Lifecycle Hooks
// ============================================================================

/**
 * Called when a provider accepts a lead (with an estimatedJobValue).
 * Creates 12 PENDING_COMPLETION payout rows so the wallet can show grey
 * "in-flight" amounts per line.
 */
export async function createPendingPayoutLines(
  leadId: string,
  estimatedCommission: number
): Promise<void> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { referrerCompanyId: true, uplineSnapshotJson: true },
  });
  if (!lead) throw new Error('Lead not found');

  const upline = (lead.uplineSnapshotJson as unknown as UplineSnapshot | null) ?? {
    l1ManagerCompanyId: null,
    l2ManagerCompanyId: null,
    l3ManagerCompanyId: null,
    clubAdminCompanyId: null,
    originalSponsorCompanyId: null,
  };

  const planLines = await getActivePlanLines();
  if (planLines.length === 0) return; // no plan configured yet

  const lines = splitCommissionAcrossLines(
    estimatedCommission,
    planLines,
    lead.referrerCompanyId,
    upline
  );

  await prisma.$transaction(async (tx) => {
    // Delete any existing pending lines for this lead (re-accept / price change)
    await tx.payoutLedger.deleteMany({
      where: { leadId, status: 'PENDING_COMPLETION' },
    });
    for (const line of lines) {
      await tx.payoutLedger.create({
        data: {
          leadId,
          lineType: line.lineType,
          beneficiaryCompanyId: line.beneficiaryCompanyId,
          amount: line.amount,
          status: 'PENDING_COMPLETION',
        },
      });
    }
  });
}

/**
 * Process lead completion: release all payout lines, credit balances,
 * write WalletTransaction rows, and flag provider's PROVIDER_CHARGE.
 */
export async function processLeadCompletion(leadId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.findUnique({
      where: { id: leadId },
      include: { referrerCompany: true },
    });
    if (!lead) throw new Error('Lead not found');
    if (lead.status !== 'AWAITING_ADMIN_CONFIRMATION') {
      throw new Error('Lead must be awaiting admin confirmation');
    }
    if (lead.calculatedCommission === null) {
      throw new Error('Lead commission has not been calculated');
    }

    const totalCommission = Number(lead.calculatedCommission);
    const upline =
      (lead.uplineSnapshotJson as unknown as UplineSnapshot | null) ?? {
        l1ManagerCompanyId: null,
        l2ManagerCompanyId: null,
        l3ManagerCompanyId: null,
        clubAdminCompanyId: null,
        originalSponsorCompanyId: null,
      };

    // Mark lead completed
    await tx.lead.update({
      where: { id: leadId },
      data: { status: 'COMPLETED_CONFIRMED', updatedAt: new Date() },
    });

    // Recompute from active plan (in case plan changed between accept & complete)
    const plan = await tx.commissionPlan.findFirst({
      where: { isActive: true },
      include: { lines: true },
    });
    const planLines = plan?.lines ?? [];

    const lines = splitCommissionAcrossLines(
      totalCommission,
      planLines,
      lead.referrerCompanyId,
      upline
    );

    // Remove pending rows; recreate as AVAILABLE
    await tx.payoutLedger.deleteMany({ where: { leadId } });

    for (const line of lines) {
      await tx.payoutLedger.create({
        data: {
          leadId,
          lineType: line.lineType,
          beneficiaryCompanyId: line.beneficiaryCompanyId,
          amount: line.amount,
          status: 'AVAILABLE',
          releasedAt: new Date(),
        },
      });

      // Credit beneficiary cash balance + wallet transaction
      if (line.beneficiaryCompanyId && line.amount > 0) {
        await tx.company.update({
          where: { id: line.beneficiaryCompanyId },
          data: { cashBalance: { increment: line.amount } },
        });
        await tx.walletTransaction.create({
          data: {
            companyId: line.beneficiaryCompanyId,
            leadId,
            type: walletTypeFor(line.lineType),
            amount: line.amount,
          },
        });
      } else if (line.amount > 0) {
        // Pool / platform — no beneficiary; park as platform profit
        await tx.walletTransaction.create({
          data: {
            companyId: null,
            leadId,
            type: 'PLATFORM_PROFIT',
            amount: line.amount,
          },
        });
      }
    }

    // Provider owes the full commission (accounted for ROI).
    await tx.company.update({
      where: { id: lead.providerCompanyId },
      data: { providerOwedBalance: { increment: totalCommission } },
    });
    await tx.walletTransaction.create({
      data: {
        companyId: lead.providerCompanyId,
        leadId,
        type: 'PROVIDER_CHARGE',
        amount: totalCommission,
      },
    });
  });
}

function walletTypeFor(lineType: PayoutLineType) {
  switch (lineType) {
    case 'DIRECT_REFERRER':
      return 'CASH' as const;
    case 'L1_MANAGER':
    case 'L2_MANAGER':
    case 'L3_MANAGER':
      return 'MANAGEMENT_OVERRIDE' as const;
    case 'CLUB_ADMIN':
      return 'CLUB_ADMIN_FEE' as const;
    case 'ORIGINAL_SPONSOR_LIFETIME':
      return 'LIFETIME_SPONSOR' as const;
    case 'POOL_BONUS_1':
    case 'POOL_BONUS_2':
    case 'POOL_BONUS_3':
    case 'POOL_BONUS_4':
    case 'POOL_BONUS_5':
      return 'POOL_BONUS' as const;
    case 'PROVIDER_FEE_OFFSET':
    default:
      return 'PLATFORM_PROFIT' as const;
  }
}

// ============================================================================
// Balance Queries
// ============================================================================

export async function getCompanyBalances(
  companyId: string
): Promise<{ cashBalance: number; benefitsBalance: number; providerOwedBalance: number }> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { cashBalance: true, benefitsBalance: true, providerOwedBalance: true },
  });
  if (!company) throw new Error('Company not found');
  return {
    cashBalance: Number(company.cashBalance),
    benefitsBalance: Number(company.benefitsBalance),
    providerOwedBalance: Number(company.providerOwedBalance),
  };
}

export async function getTotalPlatformProfit(): Promise<number> {
  const result = await prisma.walletTransaction.aggregate({
    where: { type: 'PLATFORM_PROFIT' },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

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
    prisma.lead.count({ where: { status: 'AWAITING_ADMIN_CONFIRMATION' } }),
    prisma.lead.count({ where: { status: 'COMPLETED_CONFIRMED' } }),
    prisma.company.aggregate({ _count: true }),
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

export async function getPendingWithdrawalRequests(): Promise<WithdrawalRequestWithCompany[]> {
  return prisma.withdrawalRequest.findMany({
    where: { status: 'PENDING' },
    include: { company: true },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getCompanyWithdrawalRequests(companyId: string) {
  return prisma.withdrawalRequest.findMany({
    where: { companyId },
    orderBy: { createdAt: 'desc' },
  });
}

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

    // Mark all AVAILABLE payout lines for this beneficiary/lead as PAID if
    // it makes sense. (Simple: mark earliest AVAILABLE lines up to amount as PAID.)
    // For now: mark up to `amount` of AVAILABLE lines as PAID in oldest-first order.
    let remaining = Number(request.amount);
    const lines = await tx.payoutLedger.findMany({
      where: { beneficiaryCompanyId: request.companyId, status: 'AVAILABLE' },
      orderBy: { createdAt: 'asc' },
    });
    for (const line of lines) {
      if (remaining <= 0) break;
      const lineAmount = Number(line.amount);
      if (lineAmount <= remaining) {
        await tx.payoutLedger.update({
          where: { id: line.id },
          data: { status: 'PAID', paidAt: new Date() },
        });
        remaining -= lineAmount;
      }
    }
  });
}

export async function rejectWithdrawalRequest(requestId: string): Promise<void> {
  const request = await prisma.withdrawalRequest.findUnique({ where: { id: requestId } });
  if (!request) throw new Error('Withdrawal request not found');
  if (request.status !== 'PENDING') throw new Error('Request is not pending');

  await prisma.withdrawalRequest.update({
    where: { id: requestId },
    data: { status: 'REJECTED', updatedAt: new Date() },
  });
}

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
          providerCompany: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

// ============================================================================
// Legacy Back-compat shim (used by referrer dashboard/wallet pages)
// ============================================================================

/**
 * Returns a rough 50/40/10 split for legacy UI surfaces that haven't been
 * updated to the 12-line model. Prefer PayoutLedger rows for new UIs.
 */
export function calculateCommissionSplit(totalCommission: number): {
  referrerCash: number;
  referrerBenefits: number;
  platformProfit: number;
} {
  return {
    referrerCash: Math.round(totalCommission * 0.5 * 100) / 100,
    referrerBenefits: Math.round(totalCommission * 0.4 * 100) / 100,
    platformProfit: Math.round(totalCommission * 0.1 * 100) / 100,
  };
}
