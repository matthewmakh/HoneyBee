'use client';

import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { Check, X, Share2, Lock } from 'lucide-react';

interface Props {
  step: number;
}

export function PublicPage({ step }: Props) {
  return (
    <div className="px-6 sm:px-10 py-8 max-w-4xl mx-auto">
      <MockHeader role="public" />

      <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Sunshine Solar Co</h2>
            <div className="flex gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-stone-300">
                Solar + Battery
              </span>
              <span className="text-xs text-stone-500">Zip 11201</span>
            </div>
          </div>
          <button className="hidden md:flex items-center gap-1 text-[11px] text-stone-400 border border-stone-700 rounded-md px-2 py-1 hover:bg-stone-800 transition-colors">
            <Share2 className="h-3 w-3" />
            Share
          </button>
        </div>

        {/* Photos */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-md bg-gradient-to-br from-amber-300/30 via-orange-300/20 to-rose-300/20 border border-amber-500/15 flex items-center justify-center"
              style={{
                opacity: 0,
                animation: `fadeInUp 600ms cubic-bezier(0.16,1,0.3,1) ${i * 80}ms forwards`,
              }}
            >
              <span className="text-3xl">☀️</span>
            </div>
          ))}
        </div>

        {/* Pitch text */}
        {step >= 1 && (
          <div className="rounded-md bg-stone-800/50 border border-stone-700/50 p-3 text-sm text-stone-200 leading-relaxed mb-4 animate-[fadeInUp_600ms_cubic-bezier(0.16,1,0.3,1)_forwards]">
            Whole-home solar + battery installs in as little as 2 days. We handle the permits, the utility paperwork, and the panel upgrade if you need one. Tier-1 panels, 25-year warranty, and financing that beats your current power bill.
          </div>
        )}

        {/* Dos/Donts */}
        {step >= 1 && (
          <div className="grid grid-cols-2 gap-3 mb-4 animate-[fadeInUp_600ms_cubic-bezier(0.16,1,0.3,1)_120ms_both]">
            <div className="rounded-md bg-amber-500/5 border border-amber-500/20 p-3">
              <p className="text-xs font-bold text-amber-300 flex items-center gap-1 mb-1 uppercase tracking-wider">
                <Check className="h-3 w-3" /> Do&apos;s
              </p>
              <p className="text-xs text-stone-300">
                Ask about warranty · Get written quote
              </p>
            </div>
            <div className="rounded-md bg-rose-500/5 border border-rose-500/20 p-3">
              <p className="text-xs font-bold text-rose-300 flex items-center gap-1 mb-1 uppercase tracking-wider">
                <X className="h-3 w-3" /> Don&apos;ts
              </p>
              <p className="text-xs text-stone-300">
                Pay in full upfront · Skip site survey
              </p>
            </div>
          </div>
        )}
      </div>

      {step >= 2 && (
        <div className="mt-4 relative rounded-xl border-2 border-amber-400/40 bg-amber-400/5 p-4 text-sm font-medium text-center animate-[fadeInUp_600ms_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Lock className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-amber-300 text-xs uppercase tracking-widest font-bold">What&apos;s NOT here</span>
          </div>
          <p className="text-stone-200">Commission rates · Dollar figures · Referrer earnings</p>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <AnnotationBubble visible>
              Safe to share with any homeowner
            </AnnotationBubble>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
