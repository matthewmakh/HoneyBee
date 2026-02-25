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
