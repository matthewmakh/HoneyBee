import { requireSuperAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { CompaniesList } from './companies-list';

interface CompanyWithCounts {
  id: string;
  name: string;
  memberId: string;
  canUseReferrerPortal: boolean;
  canUseProviderPortal: boolean;
  isSuspended: boolean;
  createdAt: Date;
  _count: {
    users: number;
  };
}

export default async function CompaniesPage() {
  await requireSuperAdmin();

  const companies: CompanyWithCounts[] = await db.company.findMany({
    include: {
      _count: {
        select: {
          users: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const companiesWithStats = companies.map((company) => {
    // Determine type based on portal access
    let type: 'REFERRER' | 'PROVIDER' | 'BOTH' = 'REFERRER';
    if (company.canUseReferrerPortal && company.canUseProviderPortal) {
      type = 'BOTH';
    } else if (company.canUseProviderPortal) {
      type = 'PROVIDER';
    }
    
    return {
      id: company.id,
      name: company.name,
      memberId: company.memberId,
      type,
      isActive: !company.isSuspended,
      createdAt: company.createdAt.toISOString(),
      userCount: company._count.users,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Companies</h2>
        <p className="text-muted-foreground">
          Manage all registered companies on the platform
        </p>
      </div>

      <CompaniesList companies={companiesWithStats} />
    </div>
  );
}
