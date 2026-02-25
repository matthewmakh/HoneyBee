import type {
  Company,
  User,
  ProviderProfile,
  Lead,
  WalletTransaction,
  UserRole,
  CommissionType,
  LeadStatus,
  WalletTransactionType,
} from '@prisma/client';

// Re-export Prisma types
export type {
  Company,
  User,
  ProviderProfile,
  Lead,
  WalletTransaction,
  UserRole,
  CommissionType,
  LeadStatus,
  WalletTransactionType,
};

// ============================================================================
// Session Types
// ============================================================================

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string;
  company: {
    id: string;
    name: string;
    memberId: string;
    canUseReferrerPortal: boolean;
    canUseProviderPortal: boolean;
    isSuspended: boolean;
  };
}

// ============================================================================
// Extended Types with Relations
// ============================================================================

export interface CompanyWithProfile extends Company {
  providerProfile: ProviderProfile | null;
}

export interface LeadWithCompanies extends Lead {
  providerCompany: Company;
  referrerCompany: Company;
}

export interface ProviderProfileWithCompany extends ProviderProfile {
  company: Company;
}

export interface WalletTransactionWithLead extends WalletTransaction {
  lead: Lead;
}

// ============================================================================
// Dashboard Stats Types
// ============================================================================

export interface ReferrerDashboardStats {
  cashBalance: number;
  benefitsBalance: number;
  totalReferrals: number;
  acceptedReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
}

export interface ProviderDashboardStats {
  newLeadsCount: number;
  acceptedLeadsCount: number;
  awaitingConfirmationCount: number;
  completedDealsCount: number;
}

export interface AdminDashboardStats {
  totalPlatformProfit: number;
  pendingConfirmationsCount: number;
  completedDealsCount: number;
  totalCompanies: number;
  activeCompanies: number;
  suspendedCompanies: number;
}

// ============================================================================
// Form Types
// ============================================================================

export interface SubmitLeadInput {
  providerCompanyId: string;
  homeownerName: string;
  homeownerPhone: string;
  homeownerAddress: string;
  projectDescription: string;
  category: string;
}

export interface UpdateProviderProfileInput {
  zipCode: string;
  serviceCategories: string[];
  shortDescription: string;
  commissionType: CommissionType;
  commissionValue: number;
  isPublished: boolean;
}

export interface MarkJobCompletedInput {
  leadId: string;
  reportedJobValue: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Search & Filter Types
// ============================================================================

export interface ProviderSearchFilters {
  category?: string | undefined;
  zipCode?: string | undefined;
  sortBy?: 'commission' | 'name' | 'newest' | undefined;
  sortOrder?: 'asc' | 'desc' | undefined;
}

export interface LeadFilters {
  status?: LeadStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

// ============================================================================
// Service Categories
// ============================================================================

export const SERVICE_CATEGORIES = [
  'Plumbing',
  'Electrical',
  'HVAC',
  'Roofing',
  'Landscaping',
  'Painting',
  'Flooring',
  'Carpentry',
  'General Contractor',
  'Windows & Doors',
  'Siding',
  'Gutters',
  'Fencing',
  'Concrete',
  'Masonry',
  'Pool Services',
  'Home Cleaning',
  'Pest Control',
  'Home Security',
  'Solar Installation',
  'Kitchen Remodeling',
  'Bathroom Remodeling',
  'Basement Finishing',
  'Deck Building',
  'Garage Doors',
  'Appliance Repair',
  'Handyman Services',
  'Moving Services',
  'Tree Services',
  'Other',
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

// ============================================================================
// Lead Status Labels
// ============================================================================

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  SUBMITTED: 'Submitted',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  AWAITING_ADMIN_CONFIRMATION: 'Awaiting Confirmation',
  COMPLETED_CONFIRMED: 'Completed',
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-yellow-100 text-yellow-800',
  REJECTED: 'bg-red-100 text-red-800',
  AWAITING_ADMIN_CONFIRMATION: 'bg-purple-100 text-purple-800',
  COMPLETED_CONFIRMED: 'bg-green-100 text-green-800',
};
