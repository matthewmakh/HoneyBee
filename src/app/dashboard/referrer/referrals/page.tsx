import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getReferrerLeads } from '@/lib/services/leads';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/lib/types';

export default async function MyReferralsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.company.canUseReferrerPortal && session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const leads = await getReferrerLeads(session.user.companyId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Referrals</h1>
        <p className="text-muted-foreground">
          Track the status of your submitted referrals
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Referrals</CardTitle>
          <CardDescription>
            {leads.length} total referral{leads.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No referrals yet. Start by finding a provider and submitting your first lead!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead>Homeowner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lead.providerCompany.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {lead.providerCompany.memberId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{lead.homeownerName}</TableCell>
                    <TableCell>{lead.category}</TableCell>
                    <TableCell>
                      <Badge className={LEAD_STATUS_COLORS[lead.status]}>
                        {LEAD_STATUS_LABELS[lead.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lead.status === 'COMPLETED_CONFIRMED' && lead.calculatedCommission
                        ? formatCurrency(Number(lead.calculatedCommission))
                        : lead.commissionTypeSnapshot === 'PERCENT'
                        ? `${Number(lead.commissionValueSnapshot)}%`
                        : formatCurrency(Number(lead.commissionValueSnapshot))}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
