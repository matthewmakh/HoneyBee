import { requireClubAdmin } from '@/lib/auth';
import { getAllCompaniesWithDetails } from '@/lib/services/admin';
import { AccountsList } from './accounts-list';

export default async function AccountsPage() {
  await requireClubAdmin();

  const companies = await getAllCompaniesWithDetails({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Serialize Decimal fields
  const serializedCompanies = companies.map((company) => ({
    ...company,
    cashBalance: Number(company.cashBalance),
    benefitsBalance: Number(company.benefitsBalance),
    providerProfile: company.providerProfile ? {
      ...company.providerProfile,
      commissionValue: Number(company.providerProfile.commissionValue),
    } : null,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Management</h1>
        <p className="text-muted-foreground">
          View and manage all companies and users on the platform
        </p>
      </div>
      
      <AccountsList companies={serializedCompanies} />
    </div>
  );
}
