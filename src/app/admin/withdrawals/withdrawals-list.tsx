'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
} from '@/components/ui';
import { completeWithdrawalAction, rejectWithdrawalAction } from './actions';
import { formatCurrency } from '@/lib/utils';
import { CheckCircle, XCircle } from 'lucide-react';
import type { WithdrawalRequestWithCompany } from '@/lib/types';

interface WithdrawalsListProps {
  requests: WithdrawalRequestWithCompany[];
}

export function WithdrawalsList({ requests: initialRequests }: WithdrawalsListProps) {
  const [requests, setRequests] = useState(initialRequests);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleComplete(requestId: string) {
    if (!confirm('Mark this withdrawal as completed? This will deduct the amount from the referrer\'s cash balance.')) return;
    setLoading(requestId);
    const result = await completeWithdrawalAction(requestId);
    if (result.success) {
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } else {
      alert(result.error);
    }
    setLoading(null);
  }

  async function handleReject(requestId: string) {
    if (!confirm('Reject this withdrawal request?')) return;
    setLoading(requestId);
    const result = await rejectWithdrawalAction(requestId);
    if (result.success) {
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } else {
      alert(result.error);
    }
    setLoading(null);
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <CheckCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground font-medium">No pending withdrawals</p>
        <p className="text-sm text-muted-foreground mt-1">All withdrawal requests have been processed.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Member ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Requested</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.company.name}</TableCell>
              <TableCell className="font-mono text-sm">{request.company.memberId}</TableCell>
              <TableCell className="font-bold text-green-700">{formatCurrency(Number(request.amount))}</TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                {request.notes ?? '—'}
              </TableCell>
              <TableCell className="text-sm">{new Date(request.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant="outline">Pending</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    onClick={() => handleComplete(request.id)}
                    disabled={loading === request.id}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleReject(request.id)}
                    disabled={loading === request.id}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
