import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProviderLeadsWithNotes } from '@/lib/services/leads';
import { AcceptedLeadsList } from './accepted-leads-list';
import { serializeDecimal } from '@/lib/utils';
import { BackButton } from '@/components/back-button';
import type { LeadWithCompaniesNotesAndPriceRequests } from '@/lib/types';

export default async function AcceptedLeadsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.company.canUseProviderPortal && session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const leads = await getProviderLeadsWithNotes(session.user.companyId, 'ACCEPTED');

  return (
    <div className="space-y-6">
      <BackButton href="/dashboard/provider" label="Back to dashboard" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accepted Leads</h1>
        <p className="text-muted-foreground">
          Mark jobs as completed when finished
        </p>
      </div>

      <AcceptedLeadsList leads={serializeDecimal(leads) as LeadWithCompaniesNotesAndPriceRequests[]} />
    </div>
  );
}
