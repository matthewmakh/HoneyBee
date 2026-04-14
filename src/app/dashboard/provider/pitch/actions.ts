'use server';

import { auth } from '@/lib/auth';
import { updatePitch } from '@/lib/services/catalogue';
import { updatePitchSchema } from '@/lib/validations';
import type { ApiResult } from '@/lib/types';

export async function savePitch(input: unknown): Promise<ApiResult<{ slug: string | null }>> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: 'Unauthorized' };
    if (!session.user.company.canUseProviderPortal && session.user.role !== 'SUPERADMIN') {
      return { success: false, error: 'No provider portal access' };
    }

    const parsed = updatePitchSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? 'Validation failed',
      };
    }

    const profile = await updatePitch(session.user.companyId, parsed.data);
    return { success: true, data: { slug: profile.publicSlug ?? null } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save pitch',
    };
  }
}
