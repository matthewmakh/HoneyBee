'use client';

import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK, formatMoney } from '../mock-data';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  step: number;
}

export function AdminConfirm({ step }: Props) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-3xl mx-auto">
      <MockHeader role="admin" />

      <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-800/70">
          <div className="h-9 w-9 rounded-full bg-orange-500/20 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-orange-300" />
          </div>
          <h2 className="text-lg font-bold text-white">Pending Confirmation</h2>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-500">Provider</p>
              <p className="font-semibold text-white truncate">{MOCK.provider.name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-500">Referrer</p>
              <p className="font-semibold text-white truncate">{MOCK.referrer.name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-500">Homeowner</p>
              <p className="font-semibold text-white truncate">{MOCK.homeowner.name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-500">Job Value</p>
              <p className="font-mono font-semibold text-white tabular-nums">{formatMoney(MOCK.commission.jobValue)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md bg-amber-500/10 border border-amber-500/25 p-3">
            <span className="text-sm text-amber-200">Commission to distribute</span>
            <span className="font-mono font-bold text-lg text-amber-300 tabular-nums">
              {formatMoney(MOCK.commission.total)}
            </span>
          </div>

          {step === 0 && (
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-stone-950 hover:bg-orange-400 transition-colors ring-2 ring-orange-300/40 shadow shadow-orange-500/30 animate-pulse">
                <ShieldCheck className="h-3.5 w-3.5" />
                Confirm &amp; Release
              </button>
              <button className="rounded-md border border-stone-700 px-3 py-1.5 text-xs text-stone-300 hover:bg-stone-800 transition-colors">
                Hold
              </button>
            </div>
          )}

          {step >= 1 && (
            <div className="animate-[fadeInUp_500ms_cubic-bezier(0.16,1,0.3,1)_forwards]">
              <div className="flex items-center gap-2 rounded-md bg-amber-400/10 border border-amber-400/25 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-amber-300" />
                <span className="text-sm font-semibold text-amber-200">CONFIRMED · Payouts released</span>
              </div>
              <p className="mt-2 text-xs text-stone-400 font-mono">
                12 PayoutLedger rows flipped from <span className="text-stone-300">PENDING</span> → <span className="text-amber-300">AVAILABLE</span>
              </p>
              <div className="mt-3 flex justify-center">
                <AnnotationBubble visible>
                  Now watch the 12-line split fire →
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
