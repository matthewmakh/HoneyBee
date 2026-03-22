import { requireSuperAdmin } from '@/lib/auth';
import { getAllLeadsSimple, getLeadStats } from '@/lib/services/admin';
import { LeadsList } from './leads-list';

export default async function AdminLeadsPage() {
  await requireSuperAdmin();

  const [leads, stats] = await Promise.all([
    getAllLeadsSimple(),
    getLeadStats(),
  ]);

  // Serialize for client component
  const serializedLeads = leads.map(lead => ({
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All Leads</h1>
        <p className="text-muted-foreground">
          Complete view of all platform leads and their status
        </p>
      </div>

      <LeadsList leads={serializedLeads} stats={stats} />
    </div>
  );
}
