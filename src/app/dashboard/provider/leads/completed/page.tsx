import { requireProviderAccess } from '@/lib/auth';
import Link from 'next/link';
import { getProviderLeads } from '@/lib/services/leads';
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

export default async function ProviderCompletedLeadsPage() {
  const user = await requireProviderAccess();

  const [sold, lost] = await Promise.all([
    getProviderLeads(user.companyId, 'COMPLETED_CONFIRMED'),
    getProviderLeads(user.companyId, 'REJECTED'),
  ]);

  // Newest first across both buckets.
  const leads = [...sold, ...lost].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  return (
    <div className="space-y-6">
      <BackButton href="/dashboard/provider" label="Back to dashboard" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Completed &amp; Lost Leads</h1>
        <p className="text-muted-foreground">
          Jobs you&apos;ve closed (sold) and leads you declined (lost). Click a row for full
          details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>
            {sold.length} sold · {lost.length} lost
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No completed or lost leads yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Homeowner</TableHead>
                  <TableHead>Referred by</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead className="text-right">Job Value</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/leads/${lead.id}`} className="block">
                        {lead.homeownerName}
                      </Link>
                    </TableCell>
                    <TableCell>{lead.referrerCompany.name}</TableCell>
                    <TableCell>{lead.category}</TableCell>
                    <TableCell>
                      <Badge className={LEAD_STATUS_COLORS[lead.status]}>
                        {lead.status === 'COMPLETED_CONFIRMED'
                          ? 'Sold'
                          : lead.status === 'REJECTED'
                          ? 'Lost'
                          : LEAD_STATUS_LABELS[lead.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {lead.reportedJobValue != null
                        ? formatCurrency(Number(lead.reportedJobValue))
                        : '—'}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(lead.updatedAt)}
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
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
