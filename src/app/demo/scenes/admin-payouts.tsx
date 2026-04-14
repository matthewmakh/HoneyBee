'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { formatMoney } from '../mock-data';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  step: number;
}

interface Row {
  id: string;
  beneficiary: string;
  memberId: string;
  line: string;
  amount: number;
}

const rows: Row[] = [
  { id: '1', beneficiary: 'Riley Martinez',  memberId: 'HB-000156', line: 'Direct Referrer',      amount: 1344.0 },
  { id: '2', beneficiary: 'Riley (Benefits)',memberId: 'HB-000156', line: 'Customer Credit',      amount: 504.0  },
  { id: '3', beneficiary: 'Alex Chen',       memberId: 'HB-000042', line: 'L-1 Override',         amount: 336.0  },
  { id: '4', beneficiary: 'Bee Club HQ',     memberId: 'HB-000001', line: 'Club Admin Fee',       amount: 168.0  },
  { id: '5', beneficiary: 'Jordan Lee',      memberId: 'HB-000018', line: 'L-2 Override',         amount: 168.0  },
  { id: '6', beneficiary: 'Dana Kim',        memberId: 'HB-000007', line: 'L-3 Override',         amount: 100.8  },
  { id: '7', beneficiary: 'Morgan Torres',   memberId: 'HB-000033', line: 'Lifetime Sponsor 1%',  amount: 33.6   },
];

export function AdminPayouts({ step }: Props) {
  const selected = step >= 1;
  const paid = step >= 2;

  const selectedTotal = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="w-full">
      <MockHeader role="admin" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Payouts · Available</CardTitle>
              <p className="text-xs text-muted-foreground">
                Global 12-line ledger filtered by status
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-50 border-emerald-300 text-emerald-800">
                Available
              </Badge>
              <Badge variant="outline">Pending</Badge>
              <Badge variant="outline" className="bg-slate-900 text-slate-50 border-slate-900">
                Paid
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {rows.map((r) => {
              const rowSelected = selected && !paid;
              const rowPaid = paid;
              return (
                <div
                  key={r.id}
                  className={`flex items-center justify-between rounded-md border p-2.5 text-sm transition-all ${
                    rowPaid
                      ? 'bg-slate-900 text-slate-50 border-slate-900'
                      : rowSelected
                      ? 'bg-yellow-50 border-yellow-400'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        rowSelected || rowPaid
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground/50'
                      }`}
                    >
                      {(rowSelected || rowPaid) && (
                        <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{r.beneficiary}</div>
                      <div
                        className={`text-[10px] font-mono ${
                          rowPaid ? 'text-slate-400' : 'text-muted-foreground'
                        }`}
                      >
                        {r.memberId} · {r.line}
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold">
                    {formatMoney(r.amount, { cents: true })}
                  </div>
                </div>
              );
            })}

            <div className="flex items-center justify-between pt-3 border-t">
              <div className="text-xs text-muted-foreground">
                {rowsCountLabel(selected, paid)} ·{' '}
                <span className="font-mono font-semibold text-foreground">
                  {formatMoney(selectedTotal, { cents: true })}
                </span>
              </div>
              <Button
                size="sm"
                className={
                  step === 1
                    ? 'animate-demo-pulse-ring ring-2 ring-yellow-400'
                    : ''
                }
                disabled={paid}
              >
                {paid ? 'Marked paid ✓' : 'Mark selected as Paid'}
              </Button>
            </div>

            {step === 2 && (
              <div className="mt-3 flex justify-center">
                <AnnotationBubble visible>
                  Bulk-pay flips PayoutLedger → PAID and debits cashBalance
                  atomically
                </AnnotationBubble>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function rowsCountLabel(selected: boolean, paid: boolean) {
  if (paid) return '7 paid';
  if (selected) return '7 selected';
  return '0 selected';
}
