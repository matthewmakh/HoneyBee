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
  Textarea,
  Label,
} from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { PriceChangeRequestWithLead } from '@/lib/types';
import { approvePriceChangeAction, rejectPriceChangeAction } from './actions';
import { Check, X, TrendingUp, TrendingDown, ArrowRight, Building2 } from 'lucide-react';

interface PriceChangesListProps {
  requests: PriceChangeRequestWithLead[];
}

export function PriceChangesList({ requests }: PriceChangesListProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    const result = await approvePriceChangeAction(requestId, adminNotes[requestId]);
    if (result.success) {
      router.refresh();
    }
    setProcessingId(null);
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    const result = await rejectPriceChangeAction(requestId, adminNotes[requestId]);
    if (result.success) {
      router.refresh();
    }
    setProcessingId(null);
  };

  const setNotes = (requestId: string, notes: string) => {
    setAdminNotes((prev) => ({ ...prev, [requestId]: notes }));
  };

  const calculateCommission = (
    jobValue: number,
    commissionType: string,
    commissionValue: number
  ) => {
    if (commissionType === 'PERCENT') {
      return jobValue * (commissionValue / 100);
    }
    return commissionValue;
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No pending price change requests.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const currentPrice = Number(request.currentPrice);
        const requestedPrice = Number(request.requestedPrice);
        const priceChange = requestedPrice - currentPrice;
        const percentChange = ((priceChange / currentPrice) * 100).toFixed(1);
        const isIncrease = priceChange > 0;

        const commissionValue = Number(request.lead.commissionValueSnapshot);
        const currentCommission = calculateCommission(
          currentPrice,
          request.lead.commissionTypeSnapshot,
          commissionValue
        );
        const newCommission = calculateCommission(
          requestedPrice,
          request.lead.commissionTypeSnapshot,
          commissionValue
        );
        const commissionChange = newCommission - currentCommission;

        return (
          <Card key={request.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{request.lead.homeownerName}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Building2 className="h-3 w-3" />
                    Requested by {request.requestedByCompany.name}
                  </CardDescription>
                </div>
                <Badge variant={isIncrease ? 'default' : 'secondary'} className="gap-1">
                  {isIncrease ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isIncrease ? '+' : ''}
                  {percentChange}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Price Change Details */}
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Current Price</p>
                    <p className="text-lg font-semibold">{formatCurrency(currentPrice)}</p>
                    <p className="text-xs text-muted-foreground">
                      Commission: {formatCurrency(currentCommission)}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Requested Price</p>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(requestedPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Commission: {formatCurrency(newCommission)}
                      <span className={commissionChange > 0 ? 'text-green-600' : 'text-red-600'}>
                        {' '}
                        ({commissionChange > 0 ? '+' : ''}
                        {formatCurrency(commissionChange)})
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Lead Info */}
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{request.lead.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Provider</span>
                  <span>{request.lead.providerCompany.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referrer</span>
                  <span>{request.lead.referrerCompany.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span>{formatDate(request.createdAt)}</span>
                </div>
              </div>

              {/* Reason */}
              <div>
                <p className="text-sm font-medium mb-1">Reason for Change</p>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {request.reason}
                </p>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor={`notes-${request.id}`}>Admin Notes (optional)</Label>
                <Textarea
                  id={`notes-${request.id}`}
                  placeholder="Add notes about your decision..."
                  value={adminNotes[request.id] ?? ''}
                  onChange={(e) => setNotes(request.id, e.target.value)}
                  rows={2}
                  disabled={processingId === request.id}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => handleReject(request.id)}
                disabled={processingId === request.id}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                onClick={() => handleApprove(request.id)}
                disabled={processingId === request.id}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
