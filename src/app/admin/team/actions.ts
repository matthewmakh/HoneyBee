'use server';

import { revalidatePath } from 'next/cache';
import { requireSuperAdmin } from '@/lib/auth';
import { createAdminUser, revokeAdminUser, TeamError } from '@/lib/services/team';
import { createAdminSchema } from '@/lib/validations';
import type { ApiResult } from '@/lib/types';

/**
 * Only TeamError messages are written for an operator to read. Everything else
 * (Prisma failures, connection timeouts) carries file paths and query internals
 * that must not reach the browser, so it is logged and replaced.
 */
function toClientError(error: unknown, fallback: string): string {
  if (error instanceof TeamError) {
    return error.message;
  }
  console.error('[admin/team]', error);
  return fallback;
}

interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export async function createAdminAction(
  input: CreateAdminInput
): Promise<ApiResult<{ id: string }>> {
  try {
    const actor = await requireSuperAdmin();

    const validated = createAdminSchema.safeParse(input);
    if (!validated.success) {
      const firstIssue = validated.error.issues[0];
      return { success: false, error: firstIssue?.message ?? 'Validation failed' };
    }

    // New admins join the acting admin's company (the platform company) rather
    // than getting a member company of their own.
    const admin = await createAdminUser({
      name: validated.data.name,
      email: validated.data.email,
      password: validated.data.password,
      companyId: actor.companyId,
    });

    revalidatePath('/admin/team');
    return { success: true, data: { id: admin.id } };
  } catch (error) {
    return { success: false, error: toClientError(error, 'Could not create the admin account. Please try again.') };
  }
}

export async function revokeAdminAction(userId: string): Promise<ApiResult<null>> {
  try {
    const actor = await requireSuperAdmin();
    await revokeAdminUser(userId, actor.id);

    revalidatePath('/admin/team');
    return { success: true, data: null };
  } catch (error) {
    return { success: false, error: toClientError(error, 'Could not remove the admin account. Please try again.') };
  }
}
