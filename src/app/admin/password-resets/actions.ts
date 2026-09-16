'use server';

import { requireClubAdmin } from '@/lib/auth';
import { findUserIdByEmail } from '@/lib/email';
import { createResetTokenForUser } from '@/lib/services/password-reset';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import type { ApiResult } from '@/lib/types';

export interface GeneratedResetLink {
  token: string;
  userName: string;
  email: string;
}

/**
 * Admin: mint a reset link for any member by email — the recovery path when a
 * member is locked out and there's no automated email delivery yet.
 */
export async function createResetLinkByEmailAction(
  email: string
): Promise<ApiResult<GeneratedResetLink>> {
  try {
    await requireClubAdmin();

    const userId = await findUserIdByEmail(email);
    if (!userId) {
      return { success: false, error: 'No account found with that email.' };
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    if (!user) {
      return { success: false, error: 'No account found with that email.' };
    }

    const token = await createResetTokenForUser(userId);
    revalidatePath('/admin/password-resets');
    return {
      success: true,
      data: { token, userName: user.name, email: user.email },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create reset link',
    };
  }
}
