import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProviderLeads } from '@/lib/services/leads';
import { NewLeadsList } from './new-leads-list';

export default async function NewLeadsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.company.canUseProviderPortal && session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const leads = await getProviderLeads(session.user.companyId, 'SUBMITTED');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Leads</h1>
        <p className="text-muted-foreground">
          Review incoming referrals and accept or reject them
        </p>
      </div>

      <NewLeadsList leads={leads} />
    </div>
  );
}
