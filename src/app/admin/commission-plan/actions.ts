'use server';

import { requireSuperAdmin } from '@/lib/auth';
import { updateActivePlan } from '@/lib/services/commission-plan';
import { updateCommissionPlanSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import type { ApiResult } from '@/lib/types';

export async function saveCommissionPlan(input: unknown): Promise<ApiResult<null>> {
  try {
    await requireSuperAdmin();
    const parsed = updateCommissionPlanSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Validation failed',
      };
    }
    await updateActivePlan(parsed.data);
    revalidatePath('/admin/commission-plan');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed',
    };
  }
}
