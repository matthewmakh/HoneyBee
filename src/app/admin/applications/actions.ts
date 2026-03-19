'use server';

import { requireSuperAdmin } from '@/lib/auth';
import { approveProviderApplication, rejectProviderApplication } from '@/lib/services/companies';
import { revalidatePath } from 'next/cache';
import type { ApiResult } from '@/lib/types';

export async function approveApplicationAction(companyId: string): Promise<ApiResult<null>> {
  try {
    await requireSuperAdmin();
    await approveProviderApplication(companyId);
    revalidatePath('/admin/applications');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to approve' };
  }
}

export async function rejectApplicationAction(companyId: string): Promise<ApiResult<null>> {
  try {
    await requireSuperAdmin();
    await rejectProviderApplication(companyId);
    revalidatePath('/admin/applications');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reject' };
  }
}
