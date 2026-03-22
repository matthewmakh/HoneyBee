'use server';

import { auth } from '@/lib/auth';
import { markJobCompleted } from '@/lib/services/leads';
import { markJobCompletedSchema } from '@/lib/validations';
import type { ApiResult, LeadNoteWithAuthor } from '@/lib/types';
import { prisma } from '@/lib/db';

export async function markJobCompletedAction(
  leadId: string,
  reportedJobValue: number
): Promise<ApiResult<null>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!session.user.company.canUseProviderPortal && session.user.role !== 'SUPERADMIN') {
      return { success: false, error: 'No provider portal access' };
    }

    // Validate input
    const validated = markJobCompletedSchema.safeParse({ leadId, reportedJobValue });

    if (!validated.success) {
      const firstIssue = validated.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message ?? 'Validation failed',
      };
    }

    await markJobCompleted(leadId, session.user.companyId, reportedJobValue);

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark job completed';
    return { success: false, error: message };
  }
}

// ============================================================================
// Note Actions
// ============================================================================

export async function addLeadNoteAction(
  leadId: string,
  content: string,
  photos: string[]
): Promise<ApiResult<LeadNoteWithAuthor>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify the user has access to this lead (either provider or referrer)
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { providerCompanyId: true, referrerCompanyId: true },
    });

    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }

    const isSuperAdmin = session.user.role === 'SUPERADMIN';
    const isProvider = lead.providerCompanyId === session.user.companyId;
    const isReferrer = lead.referrerCompanyId === session.user.companyId;

    if (!isSuperAdmin && !isProvider && !isReferrer) {
      return { success: false, error: 'You do not have access to this lead' };
    }

    if (!content.trim() && photos.length === 0) {
      return { success: false, error: 'Please provide a note or upload photos' };
    }

    const note = await prisma.leadNote.create({
      data: {
        leadId,
        authorCompanyId: session.user.companyId,
        authorName: session.user.name,
        content: content.trim(),
        photos,
      },
      include: {
        authorCompany: true,
      },
    });

    // Serialize Decimal fields for client component compatibility
    const serializedNote = {
      ...note,
      authorCompany: {
        ...note.authorCompany,
        cashBalance: Number(note.authorCompany.cashBalance),
        benefitsBalance: Number(note.authorCompany.benefitsBalance),
      },
    } as unknown as LeadNoteWithAuthor;

    return { success: true, data: serializedNote };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add note';
    return { success: false, error: message };
  }
}

export async function getLeadNotesAction(
  leadId: string
): Promise<ApiResult<LeadNoteWithAuthor[]>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify the user has access to this lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { providerCompanyId: true, referrerCompanyId: true },
    });

    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }

    const isSuperAdmin = session.user.role === 'SUPERADMIN';
    const isProvider = lead.providerCompanyId === session.user.companyId;
    const isReferrer = lead.referrerCompanyId === session.user.companyId;

    if (!isSuperAdmin && !isProvider && !isReferrer) {
      return { success: false, error: 'You do not have access to this lead' };
    }

    const notes = await prisma.leadNote.findMany({
      where: { leadId },
      include: { authorCompany: true },
      orderBy: { createdAt: 'desc' },
    });

    // Serialize Decimal fields for client component compatibility
    const serializedNotes = notes.map((note) => ({
      ...note,
      authorCompany: {
        ...note.authorCompany,
        cashBalance: Number(note.authorCompany.cashBalance),
        benefitsBalance: Number(note.authorCompany.benefitsBalance),
      },
    })) as unknown as LeadNoteWithAuthor[];

    return { success: true, data: serializedNotes };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch notes';
    return { success: false, error: message };
  }
}

// ============================================================================
// Price Change Request Actions
// ============================================================================

export async function requestPriceChangeAction(
  leadId: string,
  requestedPrice: number,
  reason: string
): Promise<ApiResult<null>> {
  try {
    const session = await auth();

    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    if (!session.user.company.canUseProviderPortal && session.user.role !== 'SUPERADMIN') {
      return { success: false, error: 'No provider portal access' };
    }

    if (requestedPrice <= 0) {
      return { success: false, error: 'Please enter a valid price' };
    }

    if (!reason.trim()) {
      return { success: false, error: 'Please provide a reason for the price change' };
    }

    // Verify the lead belongs to this provider and is accepted
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      select: { 
        providerCompanyId: true, 
        status: true, 
        estimatedJobValue: true 
      },
    });

    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }

    if (lead.providerCompanyId !== session.user.companyId) {
      return { success: false, error: 'This lead does not belong to your company' };
    }

    if (lead.status !== 'ACCEPTED') {
      return { success: false, error: 'Price changes can only be requested for accepted leads' };
    }

    // If no estimatedJobValue exists (legacy leads), allow setting one directly
    if (!lead.estimatedJobValue) {
      // For legacy leads without a price, set it directly without admin approval
      await prisma.lead.update({
        where: { id: leadId },
        data: { estimatedJobValue: requestedPrice },
      });
      return { success: true };
    }

    // Check for existing pending request
    const existingRequest = await prisma.priceChangeRequest.findFirst({
      where: {
        leadId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return { success: false, error: 'There is already a pending price change request for this lead' };
    }

    await prisma.priceChangeRequest.create({
      data: {
        leadId,
        requestedByCompanyId: session.user.companyId,
        requestedByName: session.user.name,
        currentPrice: lead.estimatedJobValue,
        requestedPrice,
        reason: reason.trim(),
      },
    });

    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit price change request';
    return { success: false, error: message };
  }
}
