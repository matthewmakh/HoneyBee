'use server';

import { auth } from '@/lib/auth';
import { changeL1Manager } from '@/lib/services/teams';
import { changeL1ManagerSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import type { ApiResult } from '@/lib/types';

export async function changeMyL1Manager(input: unknown): Promise<ApiResult<null>> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    const parsed = changeL1ManagerSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Invalid input',
      };
    }

    await changeL1Manager(session.user.companyId, parsed.data.newL1ManagerCompanyId);
    revalidatePath('/dashboard/referrer/team');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to change manager',
    };
  }
}
