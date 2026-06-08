import type {
  Company,
  User,
  ProviderProfile,
  Lead,
  LeadNote,
  PriceChangeRequest,
  WalletTransaction,
  WithdrawalRequest,
  UserRole,
  CommissionType,
  LeadStatus,
  PriceChangeStatus,
  WalletTransactionType,
  WithdrawalStatus,
  TeamRole,
  PayoutLineType,
  PayoutStatus,
  CommissionPlan,
  CommissionPlanLine,
  PayoutLedger,
  TeamMembership,
} from '@prisma/client';

// Re-export Prisma types
export type {
  Company,
  User,
  ProviderProfile,
  Lead,
  LeadNote,
  PriceChangeRequest,
  WalletTransaction,
  WithdrawalRequest,
  UserRole,
  CommissionType,
  LeadStatus,
  PriceChangeStatus,
  WalletTransactionType,
  WithdrawalStatus,
  TeamRole,
  PayoutLineType,
  PayoutStatus,
  CommissionPlan,
  CommissionPlanLine,
  PayoutLedger,
  TeamMembership,
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
    logoUrl: string | null;
    canUseReferrerPortal: boolean;
    canUseProviderPortal: boolean;
    providerApplicationPending: boolean;
    isSuspended: boolean;
    teamRole: TeamRole;
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

export interface LeadNoteWithAuthor extends LeadNote {
  authorCompany: Company;
}

export interface LeadWithCompaniesAndNotes extends LeadWithCompanies {
  notes: LeadNoteWithAuthor[];
}

export interface PriceChangeRequestWithLead extends PriceChangeRequest {
  lead: LeadWithCompanies;
  requestedByCompany: Company;
}

export interface LeadWithCompaniesNotesAndPriceRequests extends LeadWithCompaniesAndNotes {
  priceChangeRequests: PriceChangeRequest[];
}

export interface ProviderProfileWithCompany extends ProviderProfile {
  company: Company;
}

export interface WalletTransactionWithLead extends WalletTransaction {
  lead: Lead;
}

export interface WithdrawalRequestWithCompany extends WithdrawalRequest {
  company: Company;
}

// ============================================================================
// Dashboard Stats Types
// ============================================================================

export interface ReferrerDashboardStats {
  cashBalance: number;
  benefitsBalance: number;
  pendingCashEarnings: number;      // From accepted leads (not yet completed)
  pendingBenefitsEarnings: number;  // From accepted leads (not yet completed)
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
  pendingPriceChangesCount: number;
  completedDealsCount: number;
  totalCompanies: number;
  activeCompanies: number;
  suspendedCompanies: number;
  pendingApplicationsCount: number;
  pendingWithdrawalsCount: number;
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
  photos?: string[];
}

export interface UpdateProviderProfileInput {
  zipCode: string;
  serviceCategories: string[];
  shortDescription: string;
  commissionType: CommissionType;
  commissionValue: number;
  isPublished: boolean;
  logoUrl?: string | null;
}

export interface WithdrawalRequestInput {
  amount: number;
  notes?: string;
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
  commissionType?: 'PERCENT' | 'FLAT' | undefined;
  search?: string | undefined;
  sortBy?: 'commission' | 'name' | 'newest' | 'rating' | 'jobs' | undefined;
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

// ============================================================================
// MLM / Team Types
// ============================================================================

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  MEMBER: 'Bee Team Member',
  L1_MANAGER: 'L-1 Manager',
  L2_MANAGER: 'L-2 Manager',
  L3_MANAGER: 'L-3 Manager',
  CLUB_ADMIN: 'Club Admin',
  PROVIDER: 'A-Team Provider',
};

/**
 * Human-friendly grouping for "where every penny went" wallet breakdowns.
 * Maps each of the 12 payout lines to the bucket a member cares about.
 */
export const PAYOUT_CATEGORY: Record<PayoutLineType, string> = {
  DIRECT_REFERRER: 'To the referrer',
  L1_MANAGER: 'Management team',
  L2_MANAGER: 'Management team',
  L3_MANAGER: 'Management team',
  CLUB_ADMIN: 'To the club',
  ORIGINAL_SPONSOR_LIFETIME: 'Lifetime sponsor',
  POOL_BONUS_1: 'Member benefits & pools',
  POOL_BONUS_2: 'Member benefits & pools',
  POOL_BONUS_3: 'Member benefits & pools',
  POOL_BONUS_4: 'Member benefits & pools',
  POOL_BONUS_5: 'Member benefits & pools',
  PROVIDER_FEE_OFFSET: 'Platform',
};

/** Ordered list of the categories above for stable rendering. */
export const PAYOUT_CATEGORY_ORDER = [
  'To the referrer',
  'Management team',
  'To the club',
  'Lifetime sponsor',
  'Member benefits & pools',
  'Platform',
] as const;

export const PAYOUT_LINE_LABELS: Record<PayoutLineType, string> = {
  DIRECT_REFERRER: 'Direct Referrer',
  L1_MANAGER: 'L-1 Manager Override',
  L2_MANAGER: 'L-2 Manager Override',
  L3_MANAGER: 'L-3 Manager Override',
  CLUB_ADMIN: 'Club Admin Fee',
  ORIGINAL_SPONSOR_LIFETIME: 'Lifetime 1% Sponsor',
  POOL_BONUS_1: 'Pool Bonus 1',
  POOL_BONUS_2: 'Pool Bonus 2',
  POOL_BONUS_3: 'Pool Bonus 3',
  POOL_BONUS_4: 'Pool Bonus 4',
  POOL_BONUS_5: 'Pool Bonus 5',
  PROVIDER_FEE_OFFSET: 'Provider Fee / Platform',
};

/**
 * Default 12-line commission plan (% of total commission, basis points).
 * Admin can override in /admin/commission-plan.
 * Sum MUST equal 10000 bps (100%).
 */
export const DEFAULT_COMMISSION_PLAN: Array<{
  lineType: PayoutLineType;
  label: string;
  percentBps: number;
}> = [
  { lineType: 'DIRECT_REFERRER',           label: 'Direct Referrer',          percentBps: 4000 }, // 40%
  { lineType: 'L1_MANAGER',                label: 'L-1 Manager Override',     percentBps: 1000 }, // 10%
  { lineType: 'L2_MANAGER',                label: 'L-2 Manager Override',     percentBps: 500  }, // 5%
  { lineType: 'L3_MANAGER',                label: 'L-3 Manager Override',     percentBps: 300  }, // 3%
  { lineType: 'CLUB_ADMIN',                label: 'Club Admin Fee',           percentBps: 500  }, // 5%
  { lineType: 'ORIGINAL_SPONSOR_LIFETIME', label: 'Lifetime 1% Sponsor',      percentBps: 100  }, // 1%
  { lineType: 'POOL_BONUS_1',              label: 'Rank Pool',                percentBps: 300  }, // 3%
  { lineType: 'POOL_BONUS_2',              label: 'Leadership Pool',          percentBps: 200  }, // 2%
  { lineType: 'POOL_BONUS_3',              label: 'Customer Credit (Benefits)', percentBps: 1500 }, // 15%
  { lineType: 'POOL_BONUS_4',              label: 'Growth Pool',              percentBps: 100  }, // 1%
  { lineType: 'POOL_BONUS_5',              label: 'Events / Training',        percentBps: 100  }, // 1%
  { lineType: 'PROVIDER_FEE_OFFSET',       label: 'Platform',                 percentBps: 1400 }, // 14%
];

export interface UplineSnapshot {
  l1ManagerCompanyId: string | null;
  l2ManagerCompanyId: string | null;
  l3ManagerCompanyId: string | null;
  clubAdminCompanyId: string | null;
  originalSponsorCompanyId: string | null;
}

export interface TeamNode {
  id: string;
  name: string;
  memberId: string;
  teamRole: TeamRole;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  directDownline: TeamNode[];
}

/** Primary contact for a company, used in upline/downline contact links. */
export interface CompanyContact {
  name: string;
  email: string;
  phone: string | null;
}

export interface PayoutLineRow {
  id: string;
  leadId: string;
  lineType: PayoutLineType;
  label: string;
  beneficiaryCompanyId: string | null;
  beneficiaryName: string | null;
  amount: number;
  status: PayoutStatus;
  createdAt: Date;
}

/**
 * UI color for a payout row: green = available, grey = pending,
 * black = completed/paid.
 */
export function payoutStatusColor(
  status: PayoutStatus
): 'green' | 'grey' | 'black' {
  switch (status) {
    case 'AVAILABLE':
      return 'green';
    case 'PAID':
      return 'black';
    case 'PENDING_COMPLETION':
    default:
      return 'grey';
  }
}
