'use client';

import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK, formatMoney, pct } from '../mock-data';
import { useCountUp } from '../use-count-up';

interface Props {
  step: number;
}

// Honey-family palette, grouped by role.
// Direct & Bee Member lines → bright amber (primary honey)
// Manager overrides → graduated yellow → orange (warmer up the chain)
// Club Admin → deep orange
// Lifetime sponsor → glowing gold gradient (the hero of the story)
// Pools → muted amber/stone
// Platform → stone
const colorMap: Record<string, string> = {
  emerald: 'bg-amber-400/10 border-amber-400/40 text-amber-200',         // Direct Referrer
  sky:     'bg-yellow-400/10 border-yellow-400/40 text-yellow-200',      // L-1 override
  indigo:  'bg-yellow-400/10 border-yellow-400/30 text-yellow-200',      // L-2 override
  violet:  'bg-orange-400/10 border-orange-400/30 text-orange-200',      // L-3 override
  purple:  'bg-orange-500/10 border-orange-500/40 text-orange-300',      // Club Admin
  amber:   'bg-gradient-to-br from-amber-300/25 to-amber-500/15 border-amber-300/60 text-amber-200', // Lifetime sponsor — hero
  teal:    'bg-stone-800/60 border-stone-700/60 text-stone-300',         // Pool bonuses
  cyan:    'bg-amber-400/10 border-amber-400/30 text-amber-200',         // Customer credit / benefits (Riley)
  slate:   'bg-stone-800/40 border-stone-700/50 text-stone-400',         // Platform
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
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <MockHeader role="admin" />

      <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">The 12-Line Split</h2>
          <p className="text-xs text-stone-500 font-mono">
            {formatMoney(MOCK.commission.total)} ÷ 12 lines
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {MOCK.lines.map((line, i) => {
            const visible = i < revealCount;
            const color = colorMap[line.color] ?? colorMap.slate;
            const isHero = line.color === 'amber'; // Lifetime sponsor
            return (
              <div
                key={line.key}
                className={`flex items-center justify-between rounded-md border p-2.5 transition-all duration-500 ${color} ${
                  visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                } ${isHero && visible ? 'shadow shadow-amber-500/20' : ''}`}
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <div className="min-w-0">
                  <p className="font-semibold text-xs truncate flex items-center gap-1.5">
                    {line.label}
                    {isHero && <span className="text-[9px] uppercase tracking-widest text-amber-300/80">∞</span>}
                  </p>
                  <p className="text-[10px] opacity-70 truncate">{line.beneficiary}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono font-bold text-sm tabular-nums">
                    {formatMoney(line.amount, { cents: true })}
                  </p>
                  <p className="text-[10px] opacity-60 font-mono tabular-nums">{pct(line.bps)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {step >= 5 && (
          <div className="mt-4 flex items-center justify-between rounded-md border-2 border-amber-400/60 bg-amber-400/10 p-3 animate-[scaleUp_400ms_cubic-bezier(0.16,1,0.3,1)_forwards] shadow-lg shadow-amber-500/15">
            <p className="text-sm font-bold text-amber-200">Total distributed</p>
            <p className="font-mono font-bold text-lg text-amber-300 tabular-nums">
              {formatMoney(total, { cents: true })}
            </p>
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
      </div>

      <style jsx>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
