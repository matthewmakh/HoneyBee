'use client';

import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { formatMoney } from '../mock-data';
import { CheckCircle2, Check } from 'lucide-react';

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
  { id: '1', beneficiary: 'Riley Martinez',   memberId: 'HB-000156', line: 'Direct Referrer',     amount: 1344.0 },
  { id: '2', beneficiary: 'Riley (Benefits)', memberId: 'HB-000156', line: 'Customer Credit',     amount: 504.0  },
  { id: '3', beneficiary: 'Alex Chen',        memberId: 'HB-000042', line: 'L-1 Override',        amount: 336.0  },
  { id: '4', beneficiary: 'Bee Club HQ',      memberId: 'HB-000001', line: 'Club Admin Fee',      amount: 168.0  },
  { id: '5', beneficiary: 'Jordan Lee',       memberId: 'HB-000018', line: 'L-2 Override',        amount: 168.0  },
  { id: '6', beneficiary: 'Dana Kim',         memberId: 'HB-000007', line: 'L-3 Override',        amount: 100.8  },
  { id: '7', beneficiary: 'Morgan Torres',    memberId: 'HB-000033', line: 'Lifetime Sponsor 1%', amount: 33.6   },
];

export function AdminPayouts({ step }: Props) {
  const selected = step >= 1;
  const paid = step >= 2;
  const selectedTotal = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="px-6 sm:px-10 py-8 max-w-4xl mx-auto">
      <MockHeader role="admin" />

      <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 overflow-hidden">
        <div className="flex items-start justify-between px-5 py-4 border-b border-stone-800/70">
          <div>
            <h2 className="text-xl font-bold text-white">Payouts · Available</h2>
            <p className="text-xs text-stone-500">Global 12-line ledger, filtered by status</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-md bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-300">
              Available
            </span>
            <span className="rounded-md bg-stone-800 border border-stone-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Pending
            </span>
            <span className="rounded-md bg-black border border-stone-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              Paid
            </span>
          </div>
        </div>

        <div className="p-3 space-y-1.5">
          {rows.map((r) => {
            const rowSelected = selected && !paid;
            const rowPaid = paid;
            return (
              <div
                key={r.id}
                className={`flex items-center justify-between rounded-md border p-2.5 text-sm transition-all duration-500 ${
                  rowPaid
                    ? 'bg-black border-stone-800 text-stone-300'
                    : rowSelected
                    ? 'bg-amber-400/10 border-amber-400/40'
                    : 'bg-stone-800/40 border-stone-700/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                      rowSelected || rowPaid
                        ? 'bg-amber-400 border-amber-400'
                        : 'border-stone-600'
                    }`}
                  >
                    {(rowSelected || rowPaid) && (
                      <Check className="h-3 w-3 text-stone-950" strokeWidth={3} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{r.beneficiary}</p>
                    <p className={`text-[10px] font-mono tabular-nums truncate ${rowPaid ? 'text-stone-500' : 'text-stone-500'}`}>
                      {r.memberId} · {r.line}
                    </p>
                  </div>
                </div>
                <p className="font-mono font-bold text-white tabular-nums flex-shrink-0 ml-2">
                  {formatMoney(r.amount, { cents: true })}
                </p>
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-3 mt-2 border-t border-stone-800/70 px-1">
            <p className="text-xs text-stone-400">
              {paid ? '7 paid' : selected ? '7 selected' : '0 selected'} ·{' '}
              <span className="font-mono font-bold text-white tabular-nums">
                {formatMoney(selectedTotal, { cents: true })}
              </span>
            </p>
            <button
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                paid
                  ? 'bg-stone-800 text-stone-400 border border-stone-700'
                  : step === 1
                  ? 'bg-amber-500 text-stone-950 hover:bg-amber-400 ring-2 ring-amber-300/40 animate-pulse shadow shadow-amber-500/30'
                  : 'bg-amber-500 text-stone-950 hover:bg-amber-400'
              }`}
              disabled={paid}
            >
              {paid ? (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Marked paid
                </span>
              ) : (
                'Mark selected as Paid'
              )}
            </button>
          </div>
        </div>
      </div>

      {step === 2 && (
        <div className="mt-4 flex justify-center">
          <AnnotationBubble visible>
            Bulk-pay flips PayoutLedger → PAID and debits cashBalance atomically
          </AnnotationBubble>
        </div>
      )}
    </div>
  );
}
