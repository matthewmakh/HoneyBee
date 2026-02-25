'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import type { ApiResult } from '@/lib/types';

export async function toggleCompanyStatusAction(
  companyId: string,
  isActive: boolean
): Promise<ApiResult<null>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (session.user.role !== 'SUPERADMIN') {
      return { success: false, error: 'Super Admin access required' };
    }

    // isActive = true means not suspended, isSuspended = !isActive
    await db.company.update({
      where: { id: companyId },
      data: { isSuspended: !isActive },
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update company status';
    return { success: false, error: message };
  }
}

export async function deleteCompanyAction(companyId: string): Promise<ApiResult<null>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (session.user.role !== 'SUPERADMIN') {
      return { success: false, error: 'Super Admin access required' };
    }

    // Check if company has any wallet transactions
    const hasTransactions = await db.walletTransaction.findFirst({
      where: {
        companyId,
      },
    });

    if (hasTransactions) {
      return {
        success: false,
        error: 'Cannot delete company with financial history. Consider suspending instead.',
      };
    }

    // Delete in proper order to handle foreign key constraints
    await db.$transaction(async (tx) => {
      // Delete all leads where company is referrer or provider
      await tx.lead.deleteMany({
        where: {
          OR: [
            { referrerCompanyId: companyId },
            { providerCompanyId: companyId },
          ],
        },
      });

      // Delete provider profile for this company
      await tx.providerProfile.deleteMany({
        where: { companyId },
      });

      // Delete all users in the company
      await tx.user.deleteMany({
        where: { companyId },
      });

      // Finally delete the company
      await tx.company.delete({
        where: { id: companyId },
      });
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete company';
    return { success: false, error: message };
  }
}
