'use client';

import Link from 'next/link';
import { formatMoney, MOCK } from '../mock-data';
import { ArrowRight } from 'lucide-react';

interface Props {
  step: number;
  onRestart: () => void;
}

const FLOW = [
  { emoji: '📸', label: 'A-Team pitch' },
  { emoji: '📲', label: 'Bee Team presents' },
  { emoji: '📝', label: 'Referral submitted' },
  { emoji: '🛠', label: 'Provider closes' },
  { emoji: '🛡', label: 'Admin confirms' },
  { emoji: '💸', label: '12 payouts' },
];

export function OutroScene({ step, onRestart }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-5 shadow-lg shadow-amber-500/30">
        <span className="text-3xl">🐝</span>
      </div>

      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
        1 Referral. <span className="text-amber-300">12 Payouts.</span>
      </h2>
      <p className="text-base text-stone-300 mb-8 max-w-xl">
        <span className="font-mono font-bold text-white tabular-nums">{formatMoney(MOCK.commission.total)}</span> from a{' '}
        <span className="font-mono font-bold text-white tabular-nums">{formatMoney(MOCK.commission.jobValue)}</span> job — split across the
        whole team, instantly, with a full audit trail.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8 max-w-3xl">
        {FLOW.map((f, i) => (
          <div
            key={f.label}
            className="flex items-center gap-2"
            style={{
              opacity: step >= 1 ? 1 : 0,
              transform: step >= 1 ? 'translateY(0)' : 'translateY(8px)',
              transition: `all 500ms cubic-bezier(0.16,1,0.3,1) ${i * 90}ms`,
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">
                {f.emoji}
              </div>
              <span className="text-[10px] font-medium text-stone-400 max-w-[5rem] text-center leading-tight">
                {f.label}
              </span>
            </div>
            {i < FLOW.length - 1 && (
              <ArrowRight className="h-3 w-3 text-stone-700 hidden sm:block" />
            )}
          </div>
        ))}
      </div>

      {step >= 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8 max-w-2xl animate-[fadeInUp_500ms_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <Stat label="Direct referrer" value="40%" accent="amber" />
          <Stat label="Upline + Admin" value="24%" accent="yellow" />
          <Stat label="Lifetime sponsor" value="1% forever" accent="hero" />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-md border border-stone-700 px-4 py-2 text-sm text-stone-300 hover:bg-stone-800 transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/30"
        >
          Join the Bee Club
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={onRestart}
          className="rounded-md px-4 py-2 text-sm text-stone-400 hover:text-amber-300 transition-colors"
        >
          Watch Again
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'amber' | 'yellow' | 'hero';
}) {
  const cls =
    accent === 'hero'
      ? 'border-amber-300/60 bg-gradient-to-br from-amber-300/20 to-amber-500/10 shadow shadow-amber-500/20'
      : accent === 'yellow'
      ? 'border-yellow-400/40 bg-yellow-400/10'
      : 'border-amber-400/40 bg-amber-400/10';
  const valueCls =
    accent === 'hero' ? 'text-amber-200' : accent === 'yellow' ? 'text-yellow-200' : 'text-amber-200';
  return (
    <div className={`rounded-md border p-3 text-left ${cls}`}>
      <p className="text-[10px] uppercase tracking-widest text-stone-400">{label}</p>
      <p className={`text-lg font-bold font-mono ${valueCls} tabular-nums`}>{value}</p>
    </div>
  );
}
