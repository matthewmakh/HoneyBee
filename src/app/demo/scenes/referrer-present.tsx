'use client';

import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { Check, X, Maximize2, ArrowRight } from 'lucide-react';

interface Props {
  step: number;
}

export function ReferrerPresent({ step }: Props) {
  const presentationMode = step >= 1;

  return (
    <div className="px-6 sm:px-10 py-8 max-w-4xl mx-auto">
      <MockHeader role="referrer" />

      <div
        className={`rounded-xl border p-5 transition-all duration-500 ${
          presentationMode
            ? 'bg-black border-amber-500/30 shadow-2xl shadow-amber-500/10'
            : 'bg-stone-900/80 border-stone-700/50'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">
            {presentationMode ? 'Sunshine Solar Co' : 'Provider Profile'}
          </h2>
          {step === 0 && (
            <button className="flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-stone-950 hover:bg-amber-400 transition-colors shadow shadow-amber-500/30">
              <Maximize2 className="h-3.5 w-3.5" />
              Present to Customer
            </button>
          )}
          {presentationMode && (
            <span className="rounded-full bg-amber-400/15 border border-amber-400/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-300">
              Presentation Mode
            </span>
          )}
        </div>

        {/* Photos */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`aspect-square rounded-md flex items-center justify-center transition-all duration-500 ${
                presentationMode
                  ? 'bg-gradient-to-br from-amber-300/50 via-orange-300/40 to-rose-300/40 border border-amber-400/30'
                  : 'bg-gradient-to-br from-amber-300/25 via-orange-300/15 to-rose-300/15 border border-stone-700/40'
              }`}
            >
              <span className="text-4xl">☀️</span>
            </div>
          ))}
        </div>

        {step >= 2 && (
          <div className={`rounded-md p-4 text-sm leading-relaxed mb-4 animate-[fadeInUp_500ms_cubic-bezier(0.16,1,0.3,1)_forwards] ${
            presentationMode
              ? 'bg-stone-900 border border-stone-700/50 text-stone-100'
              : 'bg-stone-800/50 border border-stone-700/40 text-stone-200'
          }`}>
            Whole-home solar + battery installs in as little as 2 days. Tier-1 panels, 25-year warranty, financing that beats your current power bill.
          </div>
        )}

        {step >= 2 && (
          <div className="grid grid-cols-2 gap-3 mb-4 animate-[fadeInUp_500ms_cubic-bezier(0.16,1,0.3,1)_100ms_both]">
            <div className={`rounded-md p-3 border ${presentationMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-500/5 border-amber-500/20'}`}>
              <p className="text-xs font-bold text-amber-300 flex items-center gap-1 mb-1 uppercase tracking-wider">
                <Check className="h-3 w-3" /> Do
              </p>
              <p className="text-xs text-stone-300">Ask about warranty</p>
            </div>
            <div className={`rounded-md p-3 border ${presentationMode ? 'bg-rose-500/10 border-rose-500/30' : 'bg-rose-500/5 border-rose-500/20'}`}>
              <p className="text-xs font-bold text-rose-300 flex items-center gap-1 mb-1 uppercase tracking-wider">
                <X className="h-3 w-3" /> Don&apos;t
              </p>
              <p className="text-xs text-stone-300">Pay in full upfront</p>
            </div>
          </div>
        )}

        {step >= 3 && (
          <div className="pt-3 animate-[fadeInUp_500ms_cubic-bezier(0.16,1,0.3,1)_forwards]">
            <button className="w-full rounded-md bg-amber-500 py-3 text-sm font-semibold text-stone-950 hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30">
              Gather Referral Info
              <ArrowRight className="h-4 w-4" />
            </button>
            <div className="mt-3 flex justify-center">
              <AnnotationBubble visible>
                No dollar figures shown · customer-safe
              </AnnotationBubble>
            </div>
          </div>
        )}
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
