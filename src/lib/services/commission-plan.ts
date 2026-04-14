import { prisma } from '@/lib/db';
import { DEFAULT_COMMISSION_PLAN } from '@/lib/types';
import type { UpdateCommissionPlanInput } from '@/lib/validations';
import type { CommissionPlan, CommissionPlanLine } from '@/lib/types';

export async function getActivePlan(): Promise<
  (CommissionPlan & { lines: CommissionPlanLine[] }) | null
> {
  return prisma.commissionPlan.findFirst({
    where: { isActive: true },
    include: { lines: true },
  });
}

/**
 * Ensure there's an active 12-line plan. Seeds the default if none exists.
 */
export async function ensureActivePlan(): Promise<
  CommissionPlan & { lines: CommissionPlanLine[] }
> {
  const existing = await getActivePlan();
  if (existing) return existing;

  const plan = await prisma.commissionPlan.create({
    data: {
      name: 'Default 12-Line Plan',
      isActive: true,
      lines: {
        create: DEFAULT_COMMISSION_PLAN.map((l) => ({
          lineType: l.lineType,
          label: l.label,
          percentBps: l.percentBps,
          isActive: true,
        })),
      },
    },
    include: { lines: true },
  });
  return plan;
}

/**
 * Replace the active plan. Validation enforced upstream via
 * `updateCommissionPlanSchema` (active lines sum to 10000 bps).
 */
export async function updateActivePlan(
  input: UpdateCommissionPlanInput
): Promise<CommissionPlan & { lines: CommissionPlanLine[] }> {
  return prisma.$transaction(async (tx) => {
    const current = await tx.commissionPlan.findFirst({ where: { isActive: true } });
    if (current) {
      await tx.commissionPlan.update({
        where: { id: current.id },
        data: { isActive: false },
      });
    }
    return tx.commissionPlan.create({
      data: {
        name: input.name,
        isActive: true,
        lines: {
          create: input.lines.map((l) => ({
            lineType: l.lineType,
            label: l.label,
            percentBps: l.percentBps,
            isActive: l.isActive,
          })),
        },
      },
      include: { lines: true },
    });
  });
}
