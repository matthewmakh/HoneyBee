'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK, formatMoney } from '../mock-data';
import { useCountUp } from '../use-count-up';

interface Props {
  step: number;
}

export function ReferrerWallet({ step }: Props) {
  // Totals — pretend Riley has several historic deals.
  const green = useCountUp(1848, { active: step >= 1, duration: 900 });
  const grey = useCountUp(720, { active: step >= 1, duration: 900 });
  const black = useCountUp(9420, { active: step >= 1, duration: 1200 });

  // Per-lead 12-line rows — show just the 6 lines Riley herself receives.
  const rileyLines = MOCK.lines.filter(
    (l) =>
      l.beneficiary === 'Riley Martinez' ||
      l.beneficiary === 'Riley (Benefits)'
  );

  return (
    <div className="w-full">
      <MockHeader role="referrer" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Wallet</h2>
          <span className="text-xs text-muted-foreground">
            /dashboard/referrer/wallet
          </span>
        </div>

        {/* Color-coded summary */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-emerald-300 bg-emerald-50">
            <CardContent className="p-4">
              <div className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">
                Available (green)
              </div>
              <div className="font-mono font-bold text-2xl text-emerald-900 mt-1">
                {formatMoney(green)}
              </div>
              <div className="text-[10px] text-emerald-700 mt-1">
                Ready to withdraw
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-300 bg-gray-50">
            <CardContent className="p-4">
              <div className="text-xs text-gray-700 font-semibold uppercase tracking-wide">
                Pending (grey)
              </div>
              <div className="font-mono font-bold text-2xl text-gray-800 mt-1">
                {formatMoney(grey)}
              </div>
              <div className="text-[10px] text-gray-600 mt-1">
                Not yet confirmed
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-900 text-slate-50">
            <CardContent className="p-4">
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                Paid lifetime (black)
              </div>
              <div className="font-mono font-bold text-2xl mt-1">
                {formatMoney(black)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Already withdrawn
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 12-line breakdown for Sarah Johnson's deal */}
        {step >= 2 && (
          <Card className="animate-demo-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                Sarah Johnson · Solar + Battery · {formatMoney(42000)}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Your lines on this deal:
              </p>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {rileyLines.map((l) => (
                <div
                  key={l.key}
                  className="flex items-center justify-between rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2"
                >
                  <span className="text-xs font-medium text-emerald-900">
                    {l.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase text-emerald-700">
                      Available
                    </span>
                    <span className="font-mono font-bold text-sm text-emerald-900">
                      {formatMoney(l.amount, { cents: true })}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <div className="flex justify-center">
            <AnnotationBubble visible>
              Green = available · Grey = pending · Black = paid · YTD +
              Lifetime totals above
            </AnnotationBubble>
          </div>
        )}
      </div>
    </div>
  );
}
