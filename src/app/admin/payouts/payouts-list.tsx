'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { markPayoutPaidAction, markPayoutsPaidBulk } from './actions';
import { Loader2, CheckCircle2 } from 'lucide-react';

type Status = 'AVAILABLE' | 'PENDING_COMPLETION' | 'PAID';

interface Row {
  id: string;
  leadId: string;
  lineType: string;
  lineLabel: string;
  amount: number;
  status: Status;
  createdAt: string;
  beneficiaryName: string;
  beneficiaryMemberId: string;
  providerName: string;
  homeownerName: string;
}

interface Props {
  rows: Row[];
  currentStatus: Status;
}

const STATUSES: { key: Status; label: string; color: string }[] = [
  { key: 'AVAILABLE', label: 'Available', color: 'bg-green-100 text-green-800' },
  { key: 'PENDING_COMPLETION', label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  { key: 'PAID', label: 'Paid', color: 'bg-black text-white' },
];

export function PayoutsList({ rows, currentStatus }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const selectedTotal = useMemo(
    () =>
      rows
        .filter((r) => selected.has(r.id))
        .reduce((s, r) => s + r.amount, 0),
    [rows, selected]
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === rows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(rows.map((r) => r.id)));
    }
  };

  const handleBulkPay = () => {
    if (selected.size === 0) return;
    if (!confirm(`Mark ${selected.size} payouts as PAID?`)) return;
    startTransition(async () => {
      const res = await markPayoutsPaidBulk(Array.from(selected));
      if (res.success) {
        setMsg(`Marked ${res.data?.paidCount} payouts as paid.`);
        setSelected(new Set());
        router.refresh();
      } else {
        setMsg(res.error ?? 'Failed');
      }
    });
  };

  const handlePay = (id: string) => {
    setBusyId(id);
    startTransition(async () => {
      const res = await markPayoutPaidAction(id);
      setBusyId(null);
      if (res.success) {
        router.refresh();
      } else {
        setMsg(res.error ?? 'Failed');
      }
    });
  };

  const setStatus = (s: Status) => {
    router.push(`/admin/payouts?status=${s}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => (
          <Button
            key={s.key}
            size="sm"
            variant={currentStatus === s.key ? 'default' : 'outline'}
            onClick={() => setStatus(s.key)}
          >
            {s.label}
          </Button>
        ))}
        {currentStatus === 'AVAILABLE' && rows.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selected.size} selected · ${selectedTotal.toFixed(2)}
            </span>
            <Button
              size="sm"
              onClick={handleBulkPay}
              disabled={isPending || selected.size === 0}
            >
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Mark selected as Paid
            </Button>
          </div>
        )}
      </div>

      {msg && (
        <div className="rounded-md border px-3 py-2 text-sm bg-muted">
          {msg}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <CheckCircle2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No payouts in this status.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {currentStatus === 'AVAILABLE' && (
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={selected.size === rows.length && rows.length > 0}
                      onChange={toggleAll}
                    />
                  </TableHead>
                )}
                <TableHead>Beneficiary</TableHead>
                <TableHead>Line</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Created</TableHead>
                {currentStatus === 'AVAILABLE' && (
                  <TableHead className="text-right">Action</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  {currentStatus === 'AVAILABLE' && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selected.has(r.id)}
                        onChange={() => toggle(r.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="font-medium">{r.beneficiaryName}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {r.beneficiaryMemberId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.lineLabel}</Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${r.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm">{r.homeownerName}</TableCell>
                  <TableCell className="text-sm">{r.providerName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </TableCell>
                  {currentStatus === 'AVAILABLE' && (
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePay(r.id)}
                        disabled={busyId === r.id || isPending}
                      >
                        {busyId === r.id && (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        )}
                        Pay
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
