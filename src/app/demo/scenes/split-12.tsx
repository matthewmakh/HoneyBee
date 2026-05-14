'use client';

import { useEffect, useRef, useState } from 'react';
import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK, formatMoney, pct } from '../mock-data';

// Tween from the previous value to a new target whenever target changes.
// Plain useCountUp jumps to the new target — we want a smooth count-up between waves.
function useTweenTo(target: number, duration = 600): number {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      setValue(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fromRef.current = value;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}

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
  // Running total ticks up smoothly as waves of lines reveal.
  const runningSum = MOCK.lines
    .slice(0, revealCount)
    .reduce((sum, l) => sum + l.amount, 0);
  const total = useTweenTo(runningSum, 650);

  return (
    <div className="px-6 sm:px-10 py-8 max-w-5xl mx-auto">
      <MockHeader role="admin" />

      <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">The 12-Line Split</h2>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Sarah Johnson · Solar + Battery · {formatMoney(MOCK.commission.jobValue)} job
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-stone-500">Distributed</p>
            <p className={`font-mono font-bold text-lg tabular-nums transition-colors ${step >= 5 ? 'text-amber-300' : 'text-white'}`}>
              {formatMoney(total, { cents: true })}<span className="text-stone-500 text-xs"> / {formatMoney(MOCK.commission.total)}</span>
            </p>
          </div>
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
          <div className="mt-4 flex items-center justify-center gap-2 rounded-md border-2 border-amber-400/60 bg-amber-400/10 px-4 py-2.5 animate-[scaleUp_400ms_cubic-bezier(0.16,1,0.3,1)_forwards] shadow shadow-amber-500/15">
            <span className="text-sm font-bold text-amber-200">12 lines, 100% distributed — every dollar accounted for</span>
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
