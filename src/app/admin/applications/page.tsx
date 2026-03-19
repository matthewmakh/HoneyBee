import { requireSuperAdmin } from '@/lib/auth';
import { getPendingProviderApplications } from '@/lib/services/companies';
import { ApplicationsList } from './applications-list';

export default async function AdminApplicationsPage() {
  await requireSuperAdmin();

  const companies = await getPendingProviderApplications();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Provider Applications</h1>
        <p className="text-muted-foreground">
          Review and approve companies applying to receive referrals as service providers.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{companies.length} pending</span>
      </div>

      <ApplicationsList companies={companies} />
    </div>
  );
}
