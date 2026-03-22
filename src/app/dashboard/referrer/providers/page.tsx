import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { searchProviders, getActiveServiceCategories } from '@/lib/services/providers';
import { ProviderDirectory } from './provider-directory';
import { serializeDecimal } from '@/lib/utils';

interface PageProps {
  searchParams: Promise<{
    category?: string;
    zipCode?: string;
    sortBy?: 'commission' | 'name' | 'newest';
    sortOrder?: 'asc' | 'desc';
  }>;
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

  const [providers, categories] = await Promise.all([
    searchProviders(
      {
        category: params.category,
        zipCode: params.zipCode,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      },
      session.user.companyId // Exclude own company
    ),
    getActiveServiceCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Provider Directory</h1>
        <p className="text-muted-foreground">
          Find service providers and submit referrals
        </p>
      </div>

      <ProviderDirectory
        providers={serializeDecimal(providers)}
        categories={categories}
        currentFilters={{
          category: params.category,
          zipCode: params.zipCode,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        }}
      />
    </div>
  );
}
