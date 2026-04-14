'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK, formatMoney, pct } from '../mock-data';
import { useCountUp } from '../use-count-up';

interface Props {
  step: number;
}

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-50 border-emerald-300 text-emerald-900',
  sky: 'bg-sky-50 border-sky-300 text-sky-900',
  indigo: 'bg-indigo-50 border-indigo-300 text-indigo-900',
  violet: 'bg-violet-50 border-violet-300 text-violet-900',
  purple: 'bg-purple-50 border-purple-300 text-purple-900',
  amber: 'bg-amber-50 border-amber-400 text-amber-900',
  teal: 'bg-teal-50 border-teal-300 text-teal-900',
  cyan: 'bg-cyan-50 border-cyan-300 text-cyan-900',
  slate: 'bg-slate-50 border-slate-300 text-slate-900',
};

// Reveal lines in waves across 5 steps, then highlight the total in step 5.
const STEP_REVEAL_COUNT = [0, 3, 6, 9, 12, 12];

export function Split12({ step }: Props) {
  const revealCount = STEP_REVEAL_COUNT[Math.min(step, STEP_REVEAL_COUNT.length - 1)] ?? 0;
  const total = useCountUp(MOCK.commission.total, {
    active: step >= 5,
    duration: 900,
  });

  return (
    <div className="w-full">
      <MockHeader role="admin" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>The 12-Line Split</CardTitle>
              <div className="text-xs text-muted-foreground">
                {formatMoney(MOCK.commission.total)} ÷ 12 payout lines
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {MOCK.lines.map((line, i) => {
                const visible = i < revealCount;
                const color = colorMap[line.color] ?? colorMap.slate;
                return (
                  <div
                    key={line.key}
                    className={`flex items-center justify-between rounded-md border p-2.5 transition-all duration-300 ${color} ${
                      visible
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ transitionDelay: `${(i % 3) * 60}ms` }}
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-xs truncate">
                        {line.label}
                      </div>
                      <div className="text-[10px] opacity-70 truncate">
                        {line.beneficiary}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-mono font-bold text-sm">
                        {formatMoney(line.amount, { cents: true })}
                      </div>
                      <div className="text-[10px] opacity-60 font-mono">
                        {pct(line.bps)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {step >= 5 && (
              <div className="mt-4 flex items-center justify-between rounded-md border-2 border-[hsl(var(--gold))] bg-amber-50 p-3 animate-demo-scale-up">
                <div className="text-sm font-semibold">Total distributed</div>
                <div className="font-mono font-bold text-lg">
                  {formatMoney(total, { cents: true })}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mt-3 flex justify-center">
                <AnnotationBubble visible>
                  Direct referrer + your upline managers
                </AnnotationBubble>
              </div>
            )}
            {step === 2 && (
              <div className="mt-3 flex justify-center">
                <AnnotationBubble visible>
                  Club Admin fee + 1% lifetime to original sponsor
                </AnnotationBubble>
              </div>
            )}
            {step === 3 && (
              <div className="mt-3 flex justify-center">
                <AnnotationBubble visible>
                  Pools + benefits + growth — all admin-configurable
                </AnnotationBubble>
              </div>
            )}
            {step === 4 && (
              <div className="mt-3 flex justify-center">
                <AnnotationBubble visible>
                  Platform covers ops + dispute reserve
                </AnnotationBubble>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
