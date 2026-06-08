import { prisma } from '@/lib/db';
import type { PayoutLineRow, PayoutStatus, PayoutLineType } from '@/lib/types';
import { PAYOUT_LINE_LABELS, PAYOUT_CATEGORY } from '@/lib/types';

/**
 * A single lead's full commission split — every payout line, who it went to, and
 * which "where every penny went" bucket it belongs to. Used by both wallets so a
 * Bee Team member or A-Team provider can see the complete breakdown of a deal.
 */
export interface LeadSplitLine {
  id: string;
  lineType: PayoutLineType;
  label: string;
  category: string;
  beneficiaryName: string | null;
  amount: number;
  status: PayoutStatus;
}

export interface LeadSplit {
  leadId: string;
  homeownerName: string;
  providerName: string;
  referrerName: string;
  totalCommission: number;
  lines: LeadSplitLine[];
}

/**
 * Build the full 12-line split for every lead a company is party to, on the
 * given side. `referrer` → leads they sent; `provider` → leads they worked.
 */
export async function getLeadSplits(
  companyId: string,
  side: 'referrer' | 'provider'
): Promise<LeadSplit[]> {
  const leads = await prisma.lead.findMany({
    where: side === 'referrer' ? { referrerCompanyId: companyId } : { providerCompanyId: companyId },
    select: {
      id: true,
      homeownerName: true,
      providerCompany: { select: { name: true } },
      referrerCompany: { select: { name: true } },
      payoutLines: {
        include: { beneficiaryCompany: { select: { name: true } } },
        orderBy: { lineType: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return leads
    .filter((l) => l.payoutLines.length > 0)
    .map((l) => {
      const lines: LeadSplitLine[] = l.payoutLines.map((p) => ({
        id: p.id,
        lineType: p.lineType,
        label: PAYOUT_LINE_LABELS[p.lineType],
        category: PAYOUT_CATEGORY[p.lineType],
        beneficiaryName: p.beneficiaryCompany?.name ?? null,
        amount: Number(p.amount),
        status: p.status,
      }));
      return {
        leadId: l.id,
        homeownerName: l.homeownerName,
        providerName: l.providerCompany.name,
        referrerName: l.referrerCompany.name,
        totalCommission: lines.reduce((s, x) => s + x.amount, 0),
        lines,
      };
    });
}

/**
 * Aggregate a company's own earned/pending payout lines by category, so the
 * wallet can show "what makes up my money" at a glance.
 */
export async function getEarningsByCategory(companyId: string) {
  const rows = await prisma.payoutLedger.findMany({
    where: { beneficiaryCompanyId: companyId },
    select: { lineType: true, amount: true, status: true },
  });
  const map = new Map<string, { available: number; pending: number; total: number }>();
  for (const r of rows) {
    const category = PAYOUT_CATEGORY[r.lineType];
    const entry = map.get(category) ?? { available: 0, pending: 0, total: 0 };
    const amount = Number(r.amount);
    entry.total += amount;
    if (r.status === 'AVAILABLE' || r.status === 'PAID') entry.available += amount;
    if (r.status === 'PENDING_COMPLETION') entry.pending += amount;
    map.set(category, entry);
  }
  return map;
}

/**
 * All payout rows where `companyId` is the beneficiary — grouped by lead.
 * Used by the 12-line wallet view.
 */
export async function getPayoutsForBeneficiary(
  companyId: string
): Promise<PayoutLineRow[]> {
  const rows = await prisma.payoutLedger.findMany({
    where: { beneficiaryCompanyId: companyId },
    include: {
      lead: {
        select: {
          id: true,
          homeownerName: true,
          category: true,
          providerCompany: { select: { name: true } },
        },
      },
      beneficiaryCompany: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return rows.map((r) => ({
    id: r.id,
    leadId: r.leadId,
    lineType: r.lineType,
    label: PAYOUT_LINE_LABELS[r.lineType],
    beneficiaryCompanyId: r.beneficiaryCompanyId,
    beneficiaryName: r.beneficiaryCompany?.name ?? null,
    amount: Number(r.amount),
    status: r.status,
    createdAt: r.createdAt,
  }));
}

/**
 * All payouts tied to a single lead (for in-depth breakdown).
 */
export async function getPayoutsForLead(leadId: string): Promise<PayoutLineRow[]> {
  const rows = await prisma.payoutLedger.findMany({
    where: { leadId },
    include: { beneficiaryCompany: { select: { name: true } } },
    orderBy: { lineType: 'asc' },
  });
  return rows.map((r) => ({
    id: r.id,
    leadId: r.leadId,
    lineType: r.lineType,
    label: PAYOUT_LINE_LABELS[r.lineType],
    beneficiaryCompanyId: r.beneficiaryCompanyId,
    beneficiaryName: r.beneficiaryCompany?.name ?? null,
    amount: Number(r.amount),
    status: r.status,
    createdAt: r.createdAt,
  }));
}

export interface PayoutSummary {
  green: number;  // AVAILABLE
  grey: number;   // PENDING_COMPLETION
  black: number;  // PAID
  ytdGreen: number;
  ytdBlack: number;
  lifetime: number;
}

export async function getPayoutSummary(
  companyId: string
): Promise<PayoutSummary> {
  const rows = await prisma.payoutLedger.findMany({
    where: { beneficiaryCompanyId: companyId },
    select: { amount: true, status: true, createdAt: true },
  });
  const startOfYear = new Date(new Date().getFullYear(), 0, 1);
  let green = 0;
  let grey = 0;
  let black = 0;
  let ytdGreen = 0;
  let ytdBlack = 0;
  let lifetime = 0;
  for (const r of rows) {
    const a = Number(r.amount);
    lifetime += a;
    if (r.status === 'AVAILABLE') green += a;
    if (r.status === 'PENDING_COMPLETION') grey += a;
    if (r.status === 'PAID') black += a;
    if (r.createdAt >= startOfYear) {
      if (r.status === 'AVAILABLE') ytdGreen += a;
      if (r.status === 'PAID') ytdBlack += a;
    }
  }
  return {
    green: round2(green),
    grey: round2(grey),
    black: round2(black),
    ytdGreen: round2(ytdGreen),
    ytdBlack: round2(ytdBlack),
    lifetime: round2(lifetime),
  };
}

/**
 * Admin-facing queue: list all payouts across beneficiaries filtered by status.
 */
export async function getGlobalPayouts(status?: PayoutStatus) {
  return prisma.payoutLedger.findMany({
    ...(status ? { where: { status } } : {}),
    include: {
      beneficiaryCompany: { select: { id: true, name: true, memberId: true } },
      lead: {
        select: {
          id: true,
          homeownerName: true,
          providerCompany: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
}

/**
 * Provider "What you owe" view — reads from providerOwedBalance + ledger rows.
 */
export async function getProviderOwed(companyId: string) {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { providerOwedBalance: true },
  });
  const charges = await prisma.walletTransaction.findMany({
    where: { companyId, type: 'PROVIDER_CHARGE' },
    include: {
      lead: {
        select: {
          id: true,
          homeownerName: true,
          reportedJobValue: true,
          referrerCompany: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  const totalJobValue = charges.reduce(
    (sum, c) => sum + Number(c.lead.reportedJobValue ?? 0),
    0
  );
  const totalCommissionPaid = charges.reduce((sum, c) => sum + Number(c.amount), 0);
  const roi =
    totalCommissionPaid > 0
      ? round2((totalJobValue - totalCommissionPaid) / totalCommissionPaid)
      : 0;
  return {
    owedBalance: Number(company?.providerOwedBalance ?? 0),
    totalCommissionPaid: round2(totalCommissionPaid),
    totalJobValueFromReferrals: round2(totalJobValue),
    roi,
    charges,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Admin action: mark an AVAILABLE payout line as PAID (for manual off-platform
 * payments that don't go through the WithdrawalRequest flow).
 */
export async function markPayoutPaid(payoutId: string): Promise<void> {
  const row = await prisma.payoutLedger.findUnique({ where: { id: payoutId } });
  if (!row) throw new Error('Payout not found');
  if (row.status !== 'AVAILABLE') throw new Error('Payout is not AVAILABLE');
  await prisma.$transaction(async (tx) => {
    await tx.payoutLedger.update({
      where: { id: payoutId },
      data: { status: 'PAID', paidAt: new Date() },
    });
    if (row.beneficiaryCompanyId) {
      await tx.company.update({
        where: { id: row.beneficiaryCompanyId },
        data: { cashBalance: { decrement: row.amount } },
      });
    }
  });
}
