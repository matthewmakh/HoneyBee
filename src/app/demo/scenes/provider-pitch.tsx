'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { useTypewriter } from '../use-typewriter';
import { Check, X, Upload } from 'lucide-react';

interface Props {
  step: number;
}

const pitchText =
  'Whole-home solar + battery installs in as little as 2 days. We handle the permits, the utility paperwork, and the panel upgrade if you need one. Tier-1 panels, 25-year warranty, and financing that beats your current power bill.';

export function ProviderPitch({ step }: Props) {
  const { displayText, cursor } = useTypewriter(pitchText, {
    speed: 22,
    startDelay: 600,
    active: step >= 2,
  });

  const wordCount = displayText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="w-full">
      <MockHeader role="provider" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Upload Your Sales Pitch</h2>
          <span className="text-xs text-muted-foreground">
            /dashboard/provider/pitch
          </span>
        </div>

        {/* Photo grid */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Pitch Photos (1–4)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => {
                const filled = step >= 1 && i < Math.min(step + 1, 4);
                const active = step === 1 && i === 0;
                return (
                  <div
                    key={i}
                    className={`relative aspect-square rounded-md border-2 border-dashed flex items-center justify-center transition-all duration-300 ${
                      filled
                        ? 'border-emerald-400 bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 animate-demo-scale-up'
                        : 'border-muted-foreground/30 bg-muted/30'
                    } ${active ? 'ring-2 ring-yellow-400 animate-demo-pulse-ring' : ''}`}
                  >
                    {filled ? (
                      <>
                        <span className="text-3xl">☀️</span>
                        <Check className="absolute top-1 right-1 h-4 w-4 text-emerald-600 bg-white rounded-full p-0.5" />
                      </>
                    ) : (
                      <Upload className="h-4 w-4 text-muted-foreground/50" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Pitch text */}
        <Card className={step >= 2 ? '' : 'opacity-50'}>
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-sm">Pitch · 200 words max</CardTitle>
            <span
              className={`text-xs font-mono ${
                wordCount <= 200 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {wordCount} / 200
            </span>
          </CardHeader>
          <CardContent>
            <div className="min-h-[80px] text-sm text-foreground leading-relaxed">
              {displayText}
              {cursor && (
                <span className="inline-block w-0.5 h-4 bg-foreground ml-0.5 animate-pulse align-middle" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dos + Donts */}
        <div
          className={`grid grid-cols-2 gap-3 transition-all duration-500 ${
            step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-emerald-700 flex items-center gap-1">
                <Check className="h-3 w-3" /> Do
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs">
              <div>• Ask about roof age + orientation</div>
              <div>• Mention 25-year warranty</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs text-red-700 flex items-center gap-1">
                <X className="h-3 w-3" /> Don&apos;t
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs">
              <div>• Quote a price — let us</div>
              <div>• Promise permit timelines</div>
            </CardContent>
          </Card>
        </div>

        {step === 3 && (
          <div className="flex justify-center">
            <AnnotationBubble visible>
              Auto-publishes to /p/sunshine-solar-co — shareable anywhere.
            </AnnotationBubble>
          </div>
        )}
      </div>
    </div>
  );
}
