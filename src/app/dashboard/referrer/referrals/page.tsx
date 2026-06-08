import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
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
import { BackButton } from '@/components/back-button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS } from '@/lib/types';
import { ChevronRight } from 'lucide-react';

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
      <BackButton href="/dashboard/referrer" label="Back to dashboard" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Referrals</h1>
        <p className="text-muted-foreground">
          Track each referral, see which A-Team is working it, and follow up. Click a
          row for full details and contact info.
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
                  <TableHead>Working A-Team</TableHead>
                  <TableHead>Homeowner</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. commission</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => {
                  // Show the estimated/earned gross commission where we can.
                  const rateVal = Number(lead.commissionValueSnapshot);
                  let commissionDisplay: string;
                  if (lead.status === 'COMPLETED_CONFIRMED' && lead.calculatedCommission) {
                    commissionDisplay = formatCurrency(Number(lead.calculatedCommission));
                  } else if (lead.estimatedJobValue != null) {
                    const gross =
                      lead.commissionTypeSnapshot === 'PERCENT'
                        ? (Number(lead.estimatedJobValue) * rateVal) / 100
                        : rateVal;
                    commissionDisplay = formatCurrency(gross);
                  } else {
                    commissionDisplay =
                      lead.commissionTypeSnapshot === 'PERCENT'
                        ? `${rateVal}% of job`
                        : formatCurrency(rateVal);
                  }
                  return (
                    <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Link href={`/dashboard/leads/${lead.id}`} className="block">
                          <div className="font-medium">{lead.providerCompany.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {lead.providerCompany.memberId}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/leads/${lead.id}`} className="block">
                          {lead.homeownerName}
                        </Link>
                      </TableCell>
                      <TableCell>{lead.category}</TableCell>
                      <TableCell>
                        <Badge className={LEAD_STATUS_COLORS[lead.status]}>
                          {LEAD_STATUS_LABELS[lead.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>{commissionDisplay}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(lead.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/dashboard/leads/${lead.id}`}
                          className="inline-flex items-center text-primary hover:underline text-sm"
                        >
                          Details
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
