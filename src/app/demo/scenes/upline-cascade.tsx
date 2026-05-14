'use client';

import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK, formatMoney } from '../mock-data';
import { Crown, User, Star, Heart } from 'lucide-react';

interface Props {
  step: number;
}

// Pyramid: Club Admin on top → L-3 → L-2 → L-1 → direct referrer.
// Lifetime sponsor branches off as a glowing gold side card.
const NODES = [
  { level: 4, label: MOCK.clubAdmin.name,  role: 'Club Admin',      amount: 168.0,  icon: Crown, accent: 'orange-deep' },
  { level: 3, label: MOCK.l3Manager.name,  role: 'L-3 Manager',     amount: 100.8,  icon: User,  accent: 'orange' },
  { level: 2, label: MOCK.l2Manager.name,  role: 'L-2 Manager',     amount: 168.0,  icon: User,  accent: 'yellow-deep' },
  { level: 1, label: MOCK.l1Manager.name,  role: 'L-1 Manager',     amount: 336.0,  icon: User,  accent: 'yellow' },
  { level: 0, label: MOCK.referrer.name,   role: 'Direct Referrer', amount: 1344.0, icon: Star,  accent: 'amber' },
];

const accents: Record<string, string> = {
  'amber':        'bg-amber-400/15 border-amber-400/50 ring-amber-400/30',
  'yellow':       'bg-yellow-400/12 border-yellow-400/45 ring-yellow-400/25',
  'yellow-deep':  'bg-yellow-500/10 border-yellow-500/40 ring-yellow-500/20',
  'orange':       'bg-orange-400/12 border-orange-400/45 ring-orange-400/20',
  'orange-deep':  'bg-orange-500/15 border-orange-500/50 ring-orange-500/25',
};

const iconColors: Record<string, string> = {
  'amber':        'text-amber-300',
  'yellow':       'text-yellow-300',
  'yellow-deep':  'text-yellow-200',
  'orange':       'text-orange-300',
  'orange-deep':  'text-orange-300',
};

export function UplineCascade({ step }: Props) {
  // Reveal bottom-up over 4 steps, then show sponsor on step 4.
  const revealLevels = [0, 1, 3, 5, 5][Math.min(step, 4)] ?? 0;
  const showSponsor = step >= 4;

  return (
    <div className="px-6 sm:px-10 py-8 max-w-3xl mx-auto">
      <MockHeader role="admin" />

      <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 p-5">
        <h2 className="text-xl font-bold text-white mb-1">Upline + Lifetime Sponsor</h2>
        <p className="text-xs text-stone-500 mb-5">
          Snapshot was frozen at submission — these are the exact companies that got paid.
        </p>

        <div className="flex flex-col items-center gap-2.5">
          {NODES.map((n, i) => {
            const reverseIndex = NODES.length - 1 - i;
            const visible = reverseIndex < revealLevels;
            const Icon = n.icon;
            const cls = accents[n.accent] ?? '';
            const iconCls = iconColors[n.accent] ?? 'text-stone-300';
            return (
              <div
                key={n.role}
                className={`w-full max-w-md rounded-lg border-2 ring-1 p-3 flex items-center justify-between transition-all duration-500 ${cls} ${
                  visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-stone-900/80 border border-stone-700/50 flex items-center justify-center">
                    <Icon className={`h-4 w-4 ${iconCls}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-white">{n.label}</p>
                    <p className="text-[11px] text-stone-400">{n.role}</p>
                  </div>
                </div>
                <p className="font-mono font-bold text-sm text-white tabular-nums">
                  +{formatMoney(n.amount, { cents: true })}
                </p>
              </div>
            );
          })}

          {showSponsor && (
            <div className="w-full max-w-md mt-3 rounded-lg border-2 border-amber-300/60 bg-gradient-to-br from-amber-300/20 to-amber-500/10 ring-1 ring-amber-400/30 p-3 flex items-center justify-between animate-[scaleUp_400ms_cubic-bezier(0.16,1,0.3,1)_forwards] shadow-lg shadow-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-400/30 border border-amber-300/50 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-amber-200" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-white">{MOCK.originalSponsor.name}</p>
                  <p className="text-[11px] text-amber-300 font-semibold">
                    Original Sponsor · Lifetime 1% <span className="ml-0.5">∞</span>
                  </p>
                </div>
              </div>
              <p className="font-mono font-bold text-sm text-amber-200 tabular-nums">
                +{formatMoney(33.6, { cents: true })}
              </p>
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
                Morgan sponsored Riley in 2024 — earns 1% on every one of Riley&apos;s deals, forever
              </AnnotationBubble>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
