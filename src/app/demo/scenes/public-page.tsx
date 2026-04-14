'use client';

import { Card, CardContent } from '@/components/ui/card';
import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { Check, X, Share2 } from 'lucide-react';

interface Props {
  step: number;
}

export function PublicPage({ step }: Props) {
  return (
    <div className="w-full">
      <MockHeader role="public" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold">Sunshine Solar Co</h2>
            <div className="flex gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                Solar + Battery
              </span>
              <span className="text-xs text-muted-foreground">Zip 11201</span>
            </div>
          </div>
          <button className="hidden md:flex items-center gap-1 text-xs text-muted-foreground border rounded-md px-2 py-1">
            <Share2 className="h-3 w-3" />
            Share
          </button>
        </div>

        {/* Photos */}
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-md bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200 flex items-center justify-center animate-demo-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="text-3xl">☀️</span>
            </div>
          ))}
        </div>

        {/* Pitch */}
        {step >= 1 && (
          <Card className="animate-demo-fade-in">
            <CardContent className="p-4 text-sm leading-relaxed">
              Whole-home solar + battery installs in as little as 2 days. We
              handle the permits, the utility paperwork, and the panel upgrade
              if you need one. Tier-1 panels, 25-year warranty, and financing
              that beats your current power bill.
            </CardContent>
          </Card>
        )}

        {/* Dos/Donts side by side */}
        {step >= 1 && (
          <div className="grid grid-cols-2 gap-3 animate-demo-fade-in">
            <div className="rounded-md border p-3">
              <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mb-1">
                <Check className="h-3 w-3" /> Do&apos;s
              </div>
              <div className="text-xs text-muted-foreground">
                Ask about warranty · Get written quote
              </div>
            </div>
            <div className="rounded-md border p-3">
              <div className="text-xs font-semibold text-red-700 flex items-center gap-1 mb-1">
                <X className="h-3 w-3" /> Don&apos;ts
              </div>
              <div className="text-xs text-muted-foreground">
                Pay in full upfront · Skip site survey
              </div>
            </div>
          </div>
        )}

        {step >= 2 && (
          <div className="relative rounded-md border-2 border-primary/30 bg-primary/5 p-3 text-sm font-medium text-center animate-demo-fade-in">
            <span className="text-muted-foreground text-xs block mb-0.5">
              What&apos;s NOT here:
            </span>
            Commission rates · Dollar figures · Referrer earnings
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <AnnotationBubble visible>
                Safe to share with any homeowner
              </AnnotationBubble>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
