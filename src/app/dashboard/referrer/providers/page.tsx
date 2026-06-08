import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { searchProviders, getActiveServiceCategories, getProvidersJobsCompleted } from '@/lib/services/providers';
import { getProvidersRatingStats } from '@/lib/services/reviews';
import { ProviderDirectory } from './provider-directory';
import { ProviderDirectorySkeleton } from './provider-directory-skeleton';
import { serializeDecimal } from '@/lib/utils';
import { BackButton } from '@/components/back-button';
import { Suspense } from 'react';

interface PageProps {
  searchParams: Promise<{
    category?: string;
    zipCode?: string;
    commissionType?: 'PERCENT' | 'FLAT';
    search?: string;
    sortBy?: 'commission' | 'name' | 'newest' | 'rating' | 'jobs';
    sortOrder?: 'asc' | 'desc';
  }>;
}

async function ProviderDirectoryContent({ 
  params, 
  userCompanyId 
}: { 
  params: Awaited<PageProps['searchParams']>; 
  userCompanyId: string;
}) {
  const [providers, categories] = await Promise.all([
    searchProviders(
      {
        category: params.category,
        zipCode: params.zipCode,
        commissionType: params.commissionType,
        search: params.search,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      },
      userCompanyId // Exclude own company
    ),
    getActiveServiceCategories(),
  ]);

  // Fetch rating stats and jobs completed for all providers
  const providerIds = providers.map((p) => p.id);
  const companyIds = providers.map((p) => p.companyId);
  
  const [ratingStatsMap, jobsCompletedMap] = await Promise.all([
    providerIds.length > 0 ? getProvidersRatingStats(providerIds) : new Map(),
    companyIds.length > 0 ? getProvidersJobsCompleted(companyIds) : new Map(),
  ]);
  
  // Convert Maps to serializable objects
  const ratingStats: Record<string, { averageRating: number; reviewCount: number }> = {};
  ratingStatsMap.forEach((value, key) => {
    ratingStats[key] = value;
  });

  const jobsCompleted: Record<string, number> = {};
  jobsCompletedMap.forEach((value, key) => {
    jobsCompleted[key] = value;
  });

  return (
    <ProviderDirectory
      providers={serializeDecimal(providers)}
      categories={categories}
      ratingStats={ratingStats}
      jobsCompleted={jobsCompleted}
      currentFilters={{
        category: params.category,
        zipCode: params.zipCode,
        commissionType: params.commissionType,
        search: params.search,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      }}
    />
  );
}

export default async function ProvidersPage({ searchParams }: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.company.canUseReferrerPortal && session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const params = await searchParams;

  return (
    <div className="space-y-6">
      <BackButton href="/dashboard/referrer" label="Back to dashboard" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">A-Team Catalog</h1>
        <p className="text-muted-foreground">
          Browse service providers and submit referrals
        </p>
      </div>

      <Suspense fallback={<ProviderDirectorySkeleton />}>
        <ProviderDirectoryContent params={params} userCompanyId={session.user.companyId} />
      </Suspense>
    </div>
  );
}
