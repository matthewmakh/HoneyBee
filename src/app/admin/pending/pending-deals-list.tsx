'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils';
import { calculateCommissionSplit } from '@/lib/services/finance';
import type { LeadWithCompanies } from '@/lib/types';
import { confirmDealAction } from './actions';
import { CheckCircle } from 'lucide-react';

interface PendingDealsListProps {
  leads: LeadWithCompanies[];
}

export function PendingDealsList({ leads }: PendingDealsListProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleConfirm = async (leadId: string) => {
    setProcessingId(leadId);
    const result = await confirmDealAction(leadId);
    if (result.success) {
      router.refresh();
    }
    setProcessingId(null);
  };

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No pending confirmations at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map((lead) => {
        const commission = Number(lead.calculatedCommission ?? 0);
        const split = calculateCommissionSplit(commission);

        return (
          <Card key={lead.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{lead.homeownerName}</CardTitle>
                  <CardDescription>{lead.category}</CardDescription>
                </div>
                <Badge variant="purple">Awaiting Confirmation</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Referrer</p>
                  <p className="font-medium">{lead.referrerCompany.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.referrerCompany.memberId}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground mb-1">Provider</p>
                  <p className="font-medium">{lead.providerCompany.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.providerCompany.memberId}</p>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Value</TableHead>
                      <TableHead>Commission Type</TableHead>
                      <TableHead>Total Commission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        {formatCurrency(Number(lead.reportedJobValue))}
                      </TableCell>
                      <TableCell>
                        {lead.commissionTypeSnapshot === 'PERCENT'
                          ? `${Number(lead.commissionValueSnapshot)}%`
                          : formatCurrency(Number(lead.commissionValueSnapshot))}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(commission)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-2">Commission Split (Upon Confirmation)</p>
                <div className="grid gap-2 sm:grid-cols-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Referrer Cash (50%)</p>
                    <p className="font-medium">{formatCurrency(split.referrerCash)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Referrer Benefits (40%)</p>
                    <p className="font-medium">{formatCurrency(split.referrerBenefits)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Platform Profit (10%)</p>
                    <p className="font-medium">{formatCurrency(split.platformProfit)}</p>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Submitted: {formatDate(lead.createdAt)} • Marked Complete: {formatDate(lead.updatedAt)}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={() => handleConfirm(lead.id)}
                disabled={processingId === lead.id}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {processingId === lead.id ? 'Processing...' : 'Confirm Completion'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
