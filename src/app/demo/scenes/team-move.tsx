'use client';

import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK } from '../mock-data';
import { ArrowRight, ChevronsUpDown, Lock } from 'lucide-react';

interface Props {
  step: number;
}

export function TeamMove({ step }: Props) {
  const newManager = { name: 'Priya Patel', memberId: 'HB-000099' };
  return (
    <div className="px-6 sm:px-10 py-8 max-w-3xl mx-auto">
      <MockHeader role="referrer" />

      <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 p-5">
        <h2 className="text-xl font-bold text-white mb-1">Change My L-1 Manager</h2>
        <p className="text-xs text-stone-500 mb-5">
          Swap the manager above you — your member ID and historical payouts stay exactly where they are.
        </p>

        {/* Identity card — locked */}
        <div className="rounded-md bg-stone-800/60 border border-stone-700/60 p-3 flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-stone-500">Your member ID</p>
            <p className="font-mono font-bold text-white tabular-nums">{MOCK.referrer.memberId}</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-stone-700 px-2 py-0.5 text-[10px] uppercase tracking-widest text-stone-400 font-semibold">
            <Lock className="h-3 w-3" /> Immutable
          </span>
        </div>

        {/* Old → new manager */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mb-4">
          <div className={`rounded-md border p-3 transition-all duration-500 ${
            step >= 1 ? 'opacity-50 border-stone-700 bg-stone-800/40' : 'border-stone-700/60 bg-stone-800/60'
          }`}>
            <p className="text-[10px] uppercase tracking-wider text-stone-500">Current L-1</p>
            <p className={`font-semibold text-white ${step >= 1 ? 'line-through opacity-70' : ''}`}>
              {MOCK.l1Manager.name}
            </p>
            <p className="text-[11px] font-mono text-stone-500 tabular-nums">{MOCK.l1Manager.memberId}</p>
          </div>

          <ArrowRight
            className={`h-5 w-5 transition-colors ${step >= 1 ? 'text-amber-300' : 'text-stone-700'}`}
          />

          <div
            className={`rounded-md border-2 p-3 transition-all duration-500 ${
              step >= 1
                ? 'border-amber-400/50 bg-amber-400/10 animate-[scaleUp_400ms_cubic-bezier(0.16,1,0.3,1)_forwards] shadow shadow-amber-500/20'
                : 'border-dashed border-stone-700'
            }`}
          >
            <p className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">New L-1</p>
            {step >= 1 ? (
              <>
                <p className="font-semibold text-white">{newManager.name}</p>
                <p className="text-[11px] font-mono text-stone-400 tabular-nums">{newManager.memberId}</p>
              </>
            ) : (
              <div className="flex items-center gap-2 text-stone-500 text-sm">
                <ChevronsUpDown className="h-3.5 w-3.5" />
                Pick a new manager…
              </div>
            )}
          </div>
        </div>

        {step === 0 && (
          <button className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-stone-950 hover:bg-amber-400 transition-colors ring-2 ring-amber-300/40 animate-pulse shadow shadow-amber-500/30">
            Save change
          </button>
        )}

        {step >= 2 && (
          <div className="animate-[fadeInUp_500ms_cubic-bezier(0.16,1,0.3,1)_forwards] rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-stone-300">
              <span className="text-stone-500">Old membership</span>
              <span>Alex Chen · <span className="text-stone-500">ended just now</span></span>
            </div>
            <div className="flex items-center justify-between text-stone-300">
              <span className="text-stone-500">New membership</span>
              <span>Priya Patel · <span className="text-amber-300">active now</span></span>
            </div>
            <div className="flex items-center gap-2 pt-1.5 border-t border-stone-700/50 text-amber-300">
              <span className="text-base">✓</span>
              <span>3 open deals keep the old upline frozen — Alex still gets paid on those.</span>
            </div>
          </div>
        )}

        {step >= 2 && (
          <div className="flex justify-center mt-3">
            <AnnotationBubble visible>
              Team moves are append-only history — no rewriting payouts
            </AnnotationBubble>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
