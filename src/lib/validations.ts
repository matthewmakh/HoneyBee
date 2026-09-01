import { z } from 'zod';
import { SERVICE_CATEGORIES } from './types';

// ============================================================================
// Auth Schemas
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  canUseReferrerPortal: z.boolean().default(true),
  canUseProviderPortal: z.boolean().default(false),
  // Enrollment agreement
  agreedToRules: z.boolean().refine((v) => v === true, {
    message: 'You must agree to all club rules to enroll',
  }),
  referralSource: z.string().max(200, 'Too long').optional(),
  enrollmentNote: z.string().max(1000, 'Too long').optional(),
  // Member ID carried by a sponsor's invite link (e.g. HB-000123)
  sponsorMemberId: z.string().max(20, 'Invalid sponsor code').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => data.canUseReferrerPortal || data.canUseProviderPortal, {
  message: 'At least one portal must be selected',
  path: ['canUseReferrerPortal'],
});

// ============================================================================
// Lead Schemas
// ============================================================================

export const submitLeadSchema = z.object({
  providerCompanyId: z.string().cuid('Invalid provider ID'),
  homeownerName: z.string().min(2, 'Homeowner name is required'),
  homeownerPhone: z.string().min(10, 'Valid phone number is required'),
  homeownerAddress: z.string().min(5, 'Address is required'),
  projectDescription: z.string().min(10, 'Project description is required'),
  category: z.string().min(1, 'Category is required'),
  photos: z.array(z.string().url()).max(5, 'Maximum 5 photos').optional().default([]),
});

export const acceptLeadSchema = z.object({
  leadId: z.string().cuid('Invalid lead ID'),
});

export const rejectLeadSchema = z.object({
  leadId: z.string().cuid('Invalid lead ID'),
});

export const markJobCompletedSchema = z.object({
  leadId: z.string().cuid('Invalid lead ID'),
  reportedJobValue: z.number().positive('Job value must be positive').max(10000000, 'Job value too large'),
});

export const confirmCompletionSchema = z.object({
  leadId: z.string().cuid('Invalid lead ID'),
});

// ============================================================================
// Provider Profile Schemas
// ============================================================================

export const updateProviderProfileSchema = z.object({
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  serviceCategories: z.array(z.string()).min(1, 'At least one category is required'),
  shortDescription: z.string().min(20, 'Description must be at least 20 characters').max(500, 'Description too long'),
  commissionType: z.enum(['PERCENT', 'FLAT']),
  commissionValue: z.number().positive('Commission value must be positive').max(100, 'Commission value too large'),
  isPublished: z.boolean(),
  logoUrl: z.string().url().nullable().optional(),
});

export const createProviderProfileSchema = z.object({
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  serviceCategories: z.array(z.enum(SERVICE_CATEGORIES as unknown as readonly [string, ...string[]])).min(1, 'At least one category is required'),
  shortDescription: z.string().min(20, 'Description must be at least 20 characters').max(500, 'Description too long'),
  commissionType: z.enum(['PERCENT', 'FLAT']),
  commissionValue: z.number().positive('Commission value must be positive').max(100, 'Commission value too large'),
});

// ============================================================================
// Admin Schemas
// ============================================================================

export const suspendCompanySchema = z.object({
  companyId: z.string().cuid('Invalid company ID'),
  suspend: z.boolean(),
});

export const deleteCompanySchema = z.object({
  companyId: z.string().cuid('Invalid company ID'),
});

// ============================================================================
// Withdrawal Schemas
// ============================================================================

export const createWithdrawalSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(1000000, 'Amount too large'),
  notes: z.string().max(500, 'Notes too long').optional(),
});

// ============================================================================
// Search Schemas
// ============================================================================

export const providerSearchSchema = z.object({
  category: z.string().optional(),
  zipCode: z.string().optional(),
  sortBy: z.enum(['commission', 'name', 'newest']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ============================================================================
// Type exports from schemas
// ============================================================================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SubmitLeadInput = z.infer<typeof submitLeadSchema>;
export type AcceptLeadInput = z.infer<typeof acceptLeadSchema>;
export type RejectLeadInput = z.infer<typeof rejectLeadSchema>;
export type MarkJobCompletedInput = z.infer<typeof markJobCompletedSchema>;
export type ConfirmCompletionInput = z.infer<typeof confirmCompletionSchema>;
export type UpdateProviderProfileInput = z.infer<typeof updateProviderProfileSchema>;
export type CreateProviderProfileInput = z.infer<typeof createProviderProfileSchema>;
export type SuspendCompanyInput = z.infer<typeof suspendCompanySchema>;
export type DeleteCompanyInput = z.infer<typeof deleteCompanySchema>;
export type ProviderSearchInput = z.infer<typeof providerSearchSchema>;

// ============================================================================
// MLM / Catalogue Schemas
// ============================================================================

/** Count words in a string (trimmed, whitespace-separated). */
export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export const updatePitchSchema = z.object({
  pitchPhotos: z
    .array(z.string().url())
    .min(1, 'Upload at least 1 photo')
    .max(4, 'Maximum 4 photos'),
  pitchText: z
    .string()
    .min(1, 'Pitch text is required')
    .refine((t) => wordCount(t) <= 200, '200 words maximum'),
  dos: z.array(z.string().min(1)).max(10).default([]),
  donts: z.array(z.string().min(1)).max(10).default([]),
});

export const updateCatalogueSchema = updatePitchSchema.extend({
  searchRadiusMiles: z.number().int().positive().max(500).optional(),
});

export const changeL1ManagerSchema = z.object({
  newL1ManagerCompanyId: z.string().cuid('Invalid manager ID'),
});

export const commissionPlanLineInput = z.object({
  lineType: z.enum([
    'DIRECT_REFERRER',
    'L1_MANAGER',
    'L2_MANAGER',
    'L3_MANAGER',
    'CLUB_ADMIN',
    'ORIGINAL_SPONSOR_LIFETIME',
    'POOL_BONUS_1',
    'POOL_BONUS_2',
    'POOL_BONUS_3',
    'POOL_BONUS_4',
    'POOL_BONUS_5',
    'PROVIDER_FEE_OFFSET',
  ]),
  label: z.string().min(1).max(100),
  percentBps: z.number().int().min(0).max(10000),
  isActive: z.boolean(),
});

export const updateCommissionPlanSchema = z
  .object({
    name: z.string().min(1).max(100),
    lines: z.array(commissionPlanLineInput).length(12, 'Must have exactly 12 lines'),
  })
  .refine(
    (data) => {
      const total = data.lines
        .filter((l) => l.isActive)
        .reduce((sum, l) => sum + l.percentBps, 0);
      return total === 10000;
    },
    { message: 'Active lines must sum to exactly 100% (10000 bps)', path: ['lines'] }
  );

export type UpdatePitchInput = z.infer<typeof updatePitchSchema>;
export type UpdateCatalogueInput = z.infer<typeof updateCatalogueSchema>;
export type ChangeL1ManagerInput = z.infer<typeof changeL1ManagerSchema>;
export type UpdateCommissionPlanInput = z.infer<typeof updateCommissionPlanSchema>;
