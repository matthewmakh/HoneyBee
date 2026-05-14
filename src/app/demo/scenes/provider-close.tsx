'use client';

import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK, formatMoney } from '../mock-data';
import { ThumbsUp, Briefcase, ArrowRight } from 'lucide-react';

interface Props {
  step: number;
}

export function ProviderClose({ step }: Props) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-3xl mx-auto">
      <MockHeader role="provider" />

      <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-4 w-4 text-yellow-300" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">New Lead from {MOCK.referrer.name}</p>
              <p className="text-[11px] text-stone-500 truncate">{MOCK.homeowner.name} · {MOCK.homeowner.address}</p>
            </div>
          </div>
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border flex-shrink-0 ${
            step >= 1
              ? 'bg-amber-400/15 text-amber-300 border-amber-400/40'
              : 'bg-stone-800 text-stone-400 border-stone-700'
          }`}>
            {step === 0 ? 'SUBMITTED' : 'ACCEPTED'}
          </span>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-stone-300 leading-relaxed">{MOCK.project.description}</p>

          {step === 0 && (
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 rounded-md bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-stone-950 hover:bg-yellow-300 transition-colors ring-2 ring-yellow-300/40 shadow shadow-yellow-400/30 animate-pulse">
                <ThumbsUp className="h-3.5 w-3.5" />
                Accept Lead
              </button>
              <button className="rounded-md border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:bg-stone-800 transition-colors">
                Decline
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="animate-[fadeInUp_500ms_cubic-bezier(0.16,1,0.3,1)_forwards]">
              <p className="text-[11px] uppercase tracking-wider text-amber-300 mb-2">
                Creating 12 PENDING_COMPLETION payout rows…
              </p>
              <div className="h-1 rounded-full bg-stone-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400"
                  style={{ width: '100%', transition: 'width 800ms ease-out' }}
                />
              </div>
            </div>
          )}

          {step >= 2 && (
            <div className="space-y-3 border-t border-stone-800/70 pt-4 animate-[fadeInUp_500ms_cubic-bezier(0.16,1,0.3,1)_forwards]">
              <p className="text-sm font-semibold text-white">
                Job complete — report final value:
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-12 rounded-md bg-stone-800/70 border border-stone-700/70 px-3 flex items-center font-mono text-xl font-bold text-white tabular-nums">
                  {formatMoney(MOCK.commission.jobValue)}
                </div>
                <button className="rounded-md bg-amber-500 px-4 py-2.5 text-sm font-semibold text-stone-950 hover:bg-amber-400 transition-colors flex items-center gap-1.5 shadow-lg shadow-amber-500/30">
                  Submit for Confirmation
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-xs text-stone-400">
                @ <span className="text-amber-300 font-semibold">{MOCK.commission.offeredPct}%</span> commission ={' '}
                <span className="font-bold text-white tabular-nums">{formatMoney(MOCK.commission.total)}</span>{' '}
                to distribute
              </p>
              <div className="flex justify-end">
                <AnnotationBubble visible inline>
                  Goes to Club Admin for confirmation
                </AnnotationBubble>
              </div>
            </div>
          )}
        </div>
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
