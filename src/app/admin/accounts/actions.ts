'use server';

import { requireSuperAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { ApiResult } from '@/lib/types';

export async function suspendCompanyAction(companyId: string): Promise<ApiResult<null>> {
  try {
    await requireSuperAdmin();

    await prisma.company.update({
      where: { id: companyId },
      data: { isSuspended: true },
    });

    revalidatePath('/admin/accounts');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to suspend company';
    return { success: false, error: message };
  }
}

export async function unsuspendCompanyAction(companyId: string): Promise<ApiResult<null>> {
  try {
    await requireSuperAdmin();

    await prisma.company.update({
      where: { id: companyId },
      data: { isSuspended: false },
    });

    revalidatePath('/admin/accounts');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to unsuspend company';
    return { success: false, error: message };
  }
}

export async function toggleProviderAccessAction(companyId: string, enable: boolean): Promise<ApiResult<null>> {
  try {
    await requireSuperAdmin();

    await prisma.company.update({
      where: { id: companyId },
      data: { 
        canUseProviderPortal: enable,
        providerApplicationPending: false,
      },
    });

    revalidatePath('/admin/accounts');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update provider access';
    return { success: false, error: message };
  }
}

export async function toggleReferrerAccessAction(companyId: string, enable: boolean): Promise<ApiResult<null>> {
  try {
    await requireSuperAdmin();

    await prisma.company.update({
      where: { id: companyId },
      data: { canUseReferrerPortal: enable },
    });

    revalidatePath('/admin/accounts');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update referrer access';
    return { success: false, error: message };
  }
}

export async function updateUserContactAction(
  userId: string, 
  data: { name?: string; email?: string; phone?: string }
): Promise<ApiResult<null>> {
  try {
    await requireSuperAdmin();

    await prisma.user.update({
      where: { id: userId },
      data,
    });

    revalidatePath('/admin/accounts');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return { success: false, error: message };
  }
}
