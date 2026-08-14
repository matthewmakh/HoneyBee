'use server';

import { requireClubAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { ApiResult } from '@/lib/types';
import { processLeadCompletion } from '@/lib/services/finance';

// Provider Application Actions
export async function approveProviderApplicationAction(companyId: string): Promise<ApiResult<null>> {
  try {
    await requireClubAdmin();

    await prisma.company.update({
      where: { id: companyId },
      data: { 
        canUseProviderPortal: true,
        providerApplicationPending: false,
      },
    });

    revalidatePath('/admin/approvals');
    revalidatePath('/admin/accounts');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to approve application';
    return { success: false, error: message };
  }
}

export async function rejectProviderApplicationAction(companyId: string): Promise<ApiResult<null>> {
  try {
    await requireClubAdmin();

    await prisma.$transaction(async (tx) => {
      // Remove the provider profile
      await tx.providerProfile.deleteMany({
        where: { companyId },
      });
      
      // Update the company
      await tx.company.update({
        where: { id: companyId },
        data: { providerApplicationPending: false },
      });
    });

    revalidatePath('/admin/approvals');
    revalidatePath('/admin/accounts');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject application';
    return { success: false, error: message };
  }
}

// Price Change Request Actions
export async function approvePriceChangeRequestAction(
  requestId: string,
  adminNotes?: string
): Promise<ApiResult<null>> {
  try {
    await requireClubAdmin();

    const request = await prisma.priceChangeRequest.findUnique({
      where: { id: requestId },
      include: { lead: true },
    });

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    await prisma.$transaction(async (tx) => {
      // Update the lead's estimated job value
      await tx.lead.update({
        where: { id: request.leadId },
        data: { estimatedJobValue: request.requestedPrice },
      });

      // Update the request status
      await tx.priceChangeRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          adminNotes: adminNotes ?? null,
          resolvedAt: new Date(),
        },
      });
    });

    revalidatePath('/admin/approvals');
    revalidatePath('/admin/price-changes');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to approve price change';
    return { success: false, error: message };
  }
}

export async function rejectPriceChangeRequestAction(
  requestId: string,
  adminNotes?: string
): Promise<ApiResult<null>> {
  try {
    await requireClubAdmin();

    await prisma.priceChangeRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        adminNotes: adminNotes ?? null,
        resolvedAt: new Date(),
      },
    });

    revalidatePath('/admin/approvals');
    revalidatePath('/admin/price-changes');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject price change';
    return { success: false, error: message };
  }
}

// Withdrawal Request Actions
export async function approveWithdrawalRequestAction(requestId: string): Promise<ApiResult<null>> {
  try {
    await requireClubAdmin();

    const request = await prisma.withdrawalRequest.findUnique({
      where: { id: requestId },
      include: { company: true },
    });

    if (!request) {
      return { success: false, error: 'Request not found' };
    }

    if (Number(request.company.cashBalance) < Number(request.amount)) {
      return { success: false, error: 'Insufficient balance' };
    }

    await prisma.$transaction(async (tx) => {
      // Deduct from company balance
      await tx.company.update({
        where: { id: request.companyId },
        data: {
          cashBalance: {
            decrement: request.amount,
          },
        },
      });

      // Update request status
      await tx.withdrawalRequest.update({
        where: { id: requestId },
        data: { status: 'COMPLETED' },
      });
    });

    revalidatePath('/admin/approvals');
    revalidatePath('/admin/withdrawals');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to approve withdrawal';
    return { success: false, error: message };
  }
}

export async function rejectWithdrawalRequestAction(requestId: string): Promise<ApiResult<null>> {
  try {
    await requireClubAdmin();

    await prisma.withdrawalRequest.update({
      where: { id: requestId },
      data: { status: 'REJECTED' },
    });

    revalidatePath('/admin/approvals');
    revalidatePath('/admin/withdrawals');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject withdrawal';
    return { success: false, error: message };
  }
}

// Pending Deal Actions
export async function confirmDealAction(leadId: string): Promise<ApiResult<null>> {
  try {
    await requireClubAdmin();

    await processLeadCompletion(leadId);

    revalidatePath('/admin/approvals');
    revalidatePath('/admin/pending');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to confirm deal';
    return { success: false, error: message };
  }
}

export async function rejectDealAction(leadId: string): Promise<ApiResult<null>> {
  try {
    await requireClubAdmin();

    // Revert the lead back to accepted status
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status: 'ACCEPTED',
        reportedJobValue: null,
        calculatedCommission: null,
      },
    });

    revalidatePath('/admin/approvals');
    revalidatePath('/admin/pending');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reject deal';
    return { success: false, error: message };
  }
}
