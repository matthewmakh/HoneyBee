'use server';

import { requireSuperAdmin } from '@/lib/auth';
import { changeL1Manager } from '@/lib/services/teams';
import { revalidatePath } from 'next/cache';
import type { ApiResult } from '@/lib/types';

/**
 * Assign (or reassign) a member's L-1 Manager. Used by admins to give an
 * unassigned member an upline. Reuses changeL1Manager so cycle protection and
 * membership history are handled consistently.
 */
export async function assignManagerAction(
  memberCompanyId: string,
  managerCompanyId: string
): Promise<ApiResult<null>> {
  try {
    await requireSuperAdmin();
    if (!memberCompanyId || !managerCompanyId) {
      return { success: false, error: 'Member and manager are required' };
    }
    await changeL1Manager(memberCompanyId, managerCompanyId);
    revalidatePath('/admin/team');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to assign manager',
    };
  }
}
