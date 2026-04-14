import { requireSuperAdmin } from '@/lib/auth';
import { ensureActivePlan } from '@/lib/services/commission-plan';
import { DEFAULT_COMMISSION_PLAN } from '@/lib/types';
import { PlanEditor } from './plan-editor';

export default async function CommissionPlanPage() {
  await requireSuperAdmin();
  const plan = await ensureActivePlan();

  // Keep 12 lines in canonical order
  const lines = DEFAULT_COMMISSION_PLAN.map((def) => {
    const existing = plan.lines.find((l) => l.lineType === def.lineType);
    return {
      lineType: def.lineType,
      label: existing?.label ?? def.label,
      percentBps: existing?.percentBps ?? def.percentBps,
      isActive: existing?.isActive ?? true,
    };
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Commission Plan</h1>
        <p className="text-sm text-muted-foreground">
          Configure how each closed referral&apos;s commission splits across 12 lines.
        </p>
      </div>
      <PlanEditor initial={{ name: plan.name, lines }} />
    </div>
  );
}
