'use client';

import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { useTypewriter } from '../use-typewriter';
import { Check, X, Upload } from 'lucide-react';

interface Props {
  step: number;
}

const pitchText =
  'Whole-home solar + battery in as little as 2 days. Tier-1 panels, 25-year warranty, financing that beats your power bill.';

export function ProviderPitch({ step }: Props) {
  const { displayText, cursor } = useTypewriter(pitchText, {
    speed: 14,
    startDelay: 300,
    active: step >= 2,
  });

  const wordCount = displayText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="px-6 sm:px-10 py-8 max-w-4xl mx-auto">
      <MockHeader role="provider" />

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-white">Upload Your Sales Pitch</h2>
        <span className="text-[11px] text-stone-500 font-mono">/dashboard/provider/pitch</span>
      </div>

      {/* Photo grid */}
      <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 p-4 mb-3">
        <p className="text-xs uppercase tracking-wider text-stone-500 mb-3 flex items-center gap-2">
          <Upload className="h-3.5 w-3.5" />
          Pitch Photos · 1–4
        </p>
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => {
            const filled = step >= 1 && i < Math.min(step + 1, 4);
            const active = step === 1 && i === 0;
            return (
              <div
                key={i}
                className={`relative aspect-square rounded-md border-2 border-dashed flex items-center justify-center transition-all duration-300 ${
                  filled
                    ? 'border-amber-400/60 bg-gradient-to-br from-amber-300/30 via-orange-300/20 to-rose-300/20'
                    : 'border-stone-700/60 bg-stone-800/40'
                } ${active ? 'ring-2 ring-amber-300 animate-pulse' : ''}`}
              >
                {filled ? (
                  <>
                    <span className="text-3xl">☀️</span>
                    <Check className="absolute top-1 right-1 h-4 w-4 text-stone-950 bg-amber-300 rounded-full p-0.5" />
                  </>
                ) : (
                  <Upload className="h-4 w-4 text-stone-600" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pitch text */}
      <div className={`rounded-xl bg-stone-900/80 border border-stone-700/50 p-4 mb-3 transition-opacity duration-300 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-wider text-stone-500">Pitch · 200 words max</p>
          <span
            className={`text-[11px] font-mono ${
              wordCount <= 200 ? 'text-amber-300' : 'text-rose-400'
            }`}
          >
            {wordCount} / 200
          </span>
        </div>
        <div className="min-h-[80px] text-sm text-stone-200 leading-relaxed">
          {displayText}
          {cursor && (
            <span className="inline-block w-0.5 h-4 bg-amber-300 ml-0.5 animate-pulse align-middle" />
          )}
        </div>
      </div>

      {/* Dos + Donts */}
      <div className={`grid grid-cols-2 gap-3 transition-all duration-500 ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="rounded-xl bg-stone-900/80 border border-amber-500/25 p-3">
          <p className="text-xs font-bold text-amber-300 flex items-center gap-1 mb-2 uppercase tracking-wider">
            <Check className="h-3 w-3" /> Do
          </p>
          <div className="space-y-1 text-xs text-stone-300">
            <div>• Ask about roof age + orientation</div>
            <div>• Mention 25-year warranty</div>
          </div>
        </div>
        <div className="rounded-xl bg-stone-900/80 border border-rose-500/25 p-3">
          <p className="text-xs font-bold text-rose-300 flex items-center gap-1 mb-2 uppercase tracking-wider">
            <X className="h-3 w-3" /> Don&apos;t
          </p>
          <div className="space-y-1 text-xs text-stone-300">
            <div>• Quote a price — let us</div>
            <div>• Promise permit timelines</div>
          </div>
        </div>
      </div>

      {step === 3 && (
        <div className="flex justify-center mt-4">
          <AnnotationBubble visible>
            Auto-publishes to /p/sunshine-solar-co — shareable anywhere.
          </AnnotationBubble>
        </div>
      )}
    </div>
  );
}
