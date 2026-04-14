'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK, formatMoney } from '../mock-data';
import { Crown, User, Star, Heart } from 'lucide-react';

interface Props {
  step: number;
}

// Rendered as a pyramid: Club Admin on top → L3 → L2 → L1 → direct referrer.
// Original sponsor branches off the side with the lifetime 1% tag.
const NODES = [
  { level: 4, label: MOCK.clubAdmin.name,  role: 'Club Admin',   amount: 168.0,  icon: Crown, color: 'purple' },
  { level: 3, label: MOCK.l3Manager.name,  role: 'L-3 Manager',  amount: 100.8,  icon: User,  color: 'violet' },
  { level: 2, label: MOCK.l2Manager.name,  role: 'L-2 Manager',  amount: 168.0,  icon: User,  color: 'indigo' },
  { level: 1, label: MOCK.l1Manager.name,  role: 'L-1 Manager',  amount: 336.0,  icon: User,  color: 'sky' },
  { level: 0, label: MOCK.referrer.name,   role: 'Direct Referrer', amount: 1344.0, icon: Star, color: 'emerald' },
];

const ringColor: Record<string, string> = {
  purple:  'ring-purple-400 bg-purple-50',
  violet:  'ring-violet-400 bg-violet-50',
  indigo:  'ring-indigo-400 bg-indigo-50',
  sky:     'ring-sky-400 bg-sky-50',
  emerald: 'ring-emerald-400 bg-emerald-50',
};

export function UplineCascade({ step }: Props) {
  // Reveal bottom-up over 4 steps, then show sponsor on step 4.
  const revealLevels = [0, 1, 3, 5, 5][Math.min(step, 4)] ?? 0; // nodes revealed counted from the direct referrer upward
  const showSponsor = step >= 4;

  return (
    <div className="w-full">
      <MockHeader role="admin" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Upline + Lifetime Sponsor</CardTitle>
            <p className="text-xs text-muted-foreground">
              Snapshot was frozen at submission — these are the exact companies
              that got paid.
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative flex flex-col items-center gap-3">
              {NODES.map((n, i) => {
                // Reveal order: direct referrer first, then up through managers to admin.
                const reverseIndex = NODES.length - 1 - i; // 4→0 for the top (admin) node
                const visible = reverseIndex < revealLevels;
                const Icon = n.icon;
                const cls = ringColor[n.color] ?? '';
                return (
                  <div
                    key={n.role}
                    className={`w-full max-w-md rounded-lg border-2 ring-2 p-3 flex items-center justify-between transition-all duration-500 ${cls} ${
                      visible
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{n.label}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {n.role}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-sm">
                      +{formatMoney(n.amount, { cents: true })}
                    </div>
                  </div>
                );
              })}

              {showSponsor && (
                <div className="w-full max-w-md mt-2 rounded-lg border-2 border-amber-400 bg-amber-50 p-3 flex items-center justify-between animate-demo-scale-up">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-200 flex items-center justify-center">
                      <Heart className="h-4 w-4 text-amber-700" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">
                        {MOCK.originalSponsor.name}
                      </div>
                      <div className="text-[11px] text-amber-800">
                        Original Sponsor · Lifetime 1%
                      </div>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-sm">
                    +{formatMoney(33.6, { cents: true })}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="mt-3">
                  <AnnotationBubble visible>
                    Riley — the direct referrer — always earns first
                  </AnnotationBubble>
                </div>
              )}
              {step === 2 && (
                <div className="mt-3">
                  <AnnotationBubble visible>
                    Overrides cascade up through L-1, L-2, L-3 managers
                  </AnnotationBubble>
                </div>
              )}
              {step === 3 && (
                <div className="mt-3">
                  <AnnotationBubble visible>
                    Club Admin takes the top fee
                  </AnnotationBubble>
                </div>
              )}
              {step === 4 && (
                <div className="mt-3">
                  <AnnotationBubble visible>
                    Morgan sponsored Riley in 2024 — earns 1% on every one of
                    Riley&apos;s deals, forever
                  </AnnotationBubble>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
