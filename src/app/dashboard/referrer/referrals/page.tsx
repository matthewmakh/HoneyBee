import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getReferrerLeads } from '@/lib/services/leads';
import {
  Button,
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
  EmptyState,
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
            <EmptyState
              art="referrals"
              title="No referrals yet"
              description="Find a provider in the directory and send them your first lead — you'll be able to track it right here."
              action={
                <Link href="/dashboard/referrer/providers">
                  <Button>Browse providers</Button>
                </Link>
              }
            />
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
