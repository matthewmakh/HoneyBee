'use server';

import { createCompany } from '@/lib/services/companies';
import { registerSchema } from '@/lib/validations';
import type { ApiResult } from '@/lib/types';

interface RegisterInput {
  companyName: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  canUseReferrerPortal: boolean;
  canUseProviderPortal: boolean;
}

export async function registerUser(input: RegisterInput): Promise<ApiResult<{ companyId: string }>> {
  try {
    // Validate input
    const validated = registerSchema.safeParse(input);
    
    if (!validated.success) {
      const firstIssue = validated.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message ?? 'Validation failed',
      };
    }

    // Create company and user
    const company = await createCompany({
      name: input.companyName,
      canUseReferrerPortal: input.canUseReferrerPortal,
      canUseProviderPortal: input.canUseProviderPortal,
      userName: input.name,
      userEmail: input.email,
      userPassword: input.password,
    });

    return {
      success: true,
      data: { companyId: company.id },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return {
      success: false,
      error: message,
    };
  }
}
