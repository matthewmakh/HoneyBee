'use client';

import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK, formatMoney } from '../mock-data';
import { useCountUp } from '../use-count-up';

interface Props {
  step: number;
}

export function ReferrerWallet({ step }: Props) {
  // Riley's lines on Sarah's deal — Direct Referrer + Customer Credit.
  const rileyLines = MOCK.lines.filter(
    (l) =>
      l.beneficiary === 'Riley Martinez' ||
      l.beneficiary === 'Riley (Benefits)'
  );
  const fromThisDeal = rileyLines.reduce((sum, l) => sum + l.amount, 0); // $1,848

  // Historic baseline (everything BEFORE Sarah's deal); deal adds to the green bucket on step >= 1.
  const greenBase = 504;
  const greenTotal = greenBase + fromThisDeal; // $2,352

  const green = useCountUp(step >= 1 ? greenTotal : greenBase, { active: true, duration: 1100 });
  const grey = useCountUp(720, { active: step >= 1, duration: 900 });
  const black = useCountUp(9420, { active: step >= 1, duration: 1200 });

  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <MockHeader role="referrer" />

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Wallet</h2>
        <span className="text-[11px] text-stone-500 font-mono">/dashboard/referrer/wallet</span>
      </div>

      {/* Three buckets — keeping the green/grey/black semantic but in honey-warm variants */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Available (bright honey gold) */}
        <div className="relative rounded-xl bg-gradient-to-br from-amber-400/15 to-amber-500/5 border border-amber-400/40 p-4 shadow-lg shadow-amber-500/10">
          <p className="text-[10px] uppercase tracking-widest text-amber-300 font-bold mb-1">
            Available <span className="text-amber-300/60">(green)</span>
          </p>
          <p className="font-mono font-bold text-2xl text-amber-200 tabular-nums">
            {formatMoney(green)}
          </p>
          <p className="text-[10px] text-amber-300/70 mt-1">Ready to withdraw</p>
          {step >= 1 && (
            <div className="absolute -top-2 -right-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-stone-950 shadow shadow-amber-500/40 animate-[scaleUp_400ms_cubic-bezier(0.16,1,0.3,1)_forwards]">
              +{formatMoney(fromThisDeal)} from Sarah&apos;s deal
            </div>
          )}
        </div>

        {/* Pending (muted honey) */}
        <div className="rounded-xl bg-stone-800/60 border border-stone-700/60 p-4">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-1">
            Pending <span className="text-stone-500">(grey)</span>
          </p>
          <p className="font-mono font-bold text-2xl text-stone-200 tabular-nums">
            {formatMoney(grey)}
          </p>
          <p className="text-[10px] text-stone-500 mt-1">Not yet confirmed</p>
        </div>

        {/* Paid lifetime (deep black) */}
        <div className="rounded-xl bg-black border border-stone-800 p-4 ring-1 ring-amber-500/10">
          <p className="text-[10px] uppercase tracking-widest text-amber-400/80 font-bold mb-1">
            Paid Lifetime <span className="text-stone-500">(black)</span>
          </p>
          <p className="font-mono font-bold text-2xl text-white tabular-nums">
            {formatMoney(black)}
          </p>
          <p className="text-[10px] text-stone-500 mt-1">Already withdrawn</p>
        </div>
      </div>

      {/* 12-line breakdown for the deal */}
      {step >= 2 && (
        <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 p-5 animate-[fadeInUp_500ms_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <div className="mb-3">
            <p className="text-sm font-bold text-white">
              {MOCK.homeowner.name} · {MOCK.project.category} · <span className="text-amber-300 tabular-nums">{formatMoney(42000)}</span>
            </p>
            <p className="text-xs text-stone-500">Your lines on this deal:</p>
          </div>
          <div className="space-y-1.5">
            {rileyLines.map((l) => (
              <div
                key={l.key}
                className="flex items-center justify-between rounded-md bg-amber-400/10 border border-amber-400/25 px-3 py-2"
              >
                <span className="text-xs font-semibold text-amber-200">{l.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-amber-300/80">
                    Available
                  </span>
                  <span className="font-mono font-bold text-sm text-amber-200 tabular-nums">
                    {formatMoney(l.amount, { cents: true })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex justify-center mt-4">
          <AnnotationBubble visible>
            Green = available · Grey = pending · Black = paid · YTD + Lifetime totals above
          </AnnotationBubble>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
