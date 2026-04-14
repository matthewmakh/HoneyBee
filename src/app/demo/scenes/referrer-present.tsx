'use client';

import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { Button } from '@/components/ui/button';
import { Check, X, Maximize2 } from 'lucide-react';

interface Props {
  step: number;
}

export function ReferrerPresent({ step }: Props) {
  const presentationMode = step >= 1;
  return (
    <div className="w-full">
      <MockHeader role="referrer" />
      <div
        className={`rounded-b-lg border border-t-0 p-6 transition-all duration-500 ${
          presentationMode
            ? 'bg-slate-950 text-slate-50 border-slate-800'
            : 'bg-card'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className={`text-xl font-bold ${
              presentationMode ? 'text-slate-50' : ''
            }`}
          >
            {presentationMode ? 'Sunshine Solar Co' : 'Provider Profile'}
          </h2>
          {step === 0 && (
            <Button size="sm" className="gap-1">
              <Maximize2 className="h-3.5 w-3.5" />
              Present to Customer
            </Button>
          )}
        </div>

        {/* Photos */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`aspect-square rounded-md flex items-center justify-center transition-all ${
                presentationMode
                  ? 'bg-gradient-to-br from-amber-300 via-orange-300 to-rose-300'
                  : 'bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200'
              }`}
            >
              <span className="text-4xl">☀️</span>
            </div>
          ))}
        </div>

        {step >= 2 && (
          <div
            className={`rounded-md p-4 text-sm leading-relaxed mb-4 animate-demo-fade-in ${
              presentationMode
                ? 'bg-slate-900 border border-slate-700'
                : 'bg-muted'
            }`}
          >
            Whole-home solar + battery installs in as little as 2 days. Tier-1
            panels, 25-year warranty, financing that beats your current power
            bill.
          </div>
        )}

        {step >= 2 && (
          <div className="grid grid-cols-2 gap-3 mb-4 animate-demo-fade-in">
            <div
              className={`rounded-md p-3 ${
                presentationMode
                  ? 'bg-emerald-950/50 border border-emerald-800'
                  : 'bg-emerald-50 border border-emerald-200'
              }`}
            >
              <div
                className={`text-xs font-semibold flex items-center gap-1 mb-1 ${
                  presentationMode ? 'text-emerald-300' : 'text-emerald-700'
                }`}
              >
                <Check className="h-3 w-3" /> Do
              </div>
              <div
                className={`text-xs ${
                  presentationMode ? 'text-emerald-200' : 'text-emerald-900'
                }`}
              >
                Ask about warranty
              </div>
            </div>
            <div
              className={`rounded-md p-3 ${
                presentationMode
                  ? 'bg-red-950/50 border border-red-900'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div
                className={`text-xs font-semibold flex items-center gap-1 mb-1 ${
                  presentationMode ? 'text-red-300' : 'text-red-700'
                }`}
              >
                <X className="h-3 w-3" /> Don&apos;t
              </div>
              <div
                className={`text-xs ${
                  presentationMode ? 'text-red-200' : 'text-red-900'
                }`}
              >
                Pay in full upfront
              </div>
            </div>
          </div>
        )}

        {step >= 3 && (
          <div className="pt-3 animate-demo-fade-in">
            <Button
              size="lg"
              className="w-full gap-2 bg-[hsl(var(--gold))] hover:brightness-95 text-slate-950"
            >
              Gather Referral Info →
            </Button>
            <div className="mt-3 flex justify-center">
              <AnnotationBubble visible>
                No dollar figures shown · customer-safe
              </AnnotationBubble>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
