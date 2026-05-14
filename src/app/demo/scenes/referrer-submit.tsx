'use client';

import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK } from '../mock-data';
import { useTypewriter } from '../use-typewriter';
import { CheckCircle2, Lock } from 'lucide-react';

interface Props {
  step: number;
}

export function ReferrerSubmit({ step }: Props) {
  const name = useTypewriter(MOCK.homeowner.name, {
    speed: 60,
    startDelay: 400,
    active: step >= 0,
  });
  const desc = useTypewriter(MOCK.project.description, {
    speed: 18,
    startDelay: 200,
    active: step >= 1,
  });

  if (step >= 2) {
    return (
      <div className="px-6 sm:px-10 py-8 max-w-3xl mx-auto">
        <MockHeader role="referrer" />

        <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-400/15 border border-amber-400/40 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
            <CheckCircle2 className="h-8 w-8 text-amber-300" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Referral submitted</h3>
          <p className="text-sm text-stone-400 mb-5">
            Lead routed to Sunshine Solar Co. Your upline snapshot was frozen —
            this deal will always credit the right people.
          </p>

          <div className="rounded-md border border-amber-500/25 bg-amber-500/5 p-4 text-left">
            <p className="text-[10px] uppercase tracking-widest text-amber-300 mb-3 flex items-center gap-1.5">
              <Lock className="h-3 w-3" /> Upline frozen for this deal
            </p>
            <div className="space-y-2 text-xs">
              {[
                { role: 'L-1 Manager',        name: MOCK.l1Manager.name,        id: MOCK.l1Manager.memberId },
                { role: 'L-2 Manager',        name: MOCK.l2Manager.name,        id: MOCK.l2Manager.memberId },
                { role: 'L-3 Manager',        name: MOCK.l3Manager.name,        id: MOCK.l3Manager.memberId },
                { role: 'Lifetime Sponsor',   name: MOCK.originalSponsor.name,  id: MOCK.originalSponsor.memberId },
              ].map((s) => (
                <div key={s.role} className="flex items-center justify-between gap-2">
                  <span className="text-stone-400">{s.role}</span>
                  <span className="text-stone-200">
                    {s.name} <span className="font-mono text-stone-500 ml-1">{s.id}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <AnnotationBubble visible>
              Team moves later won&apos;t change this payout
            </AnnotationBubble>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-10 py-8 max-w-3xl mx-auto">
      <MockHeader role="referrer" />

      <div className="rounded-xl bg-stone-900/80 border border-stone-700/50 p-5">
        <p className="text-xs uppercase tracking-wider text-stone-500 mb-1">Submit Referral</p>
        <h2 className="text-xl font-bold text-white mb-4">Sunshine Solar Co</h2>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500">Homeowner Name</label>
            <div className="relative mt-1">
              <div className="h-10 w-full rounded-md bg-stone-800/70 border border-stone-700/70 px-3 flex items-center text-sm text-white">
                {name.displayText}
                {name.cursor && (
                  <span className="inline-block w-[2px] h-4 bg-amber-300 align-middle ml-[1px] animate-pulse" />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-stone-500">Phone</label>
              <div className="h-10 w-full rounded-md bg-stone-800/70 border border-stone-700/70 px-3 flex items-center text-sm text-white mt-1">
                {MOCK.homeowner.phone}
              </div>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-stone-500">Est. Job Value</label>
              <div className="h-10 w-full rounded-md bg-stone-800/70 border border-stone-700/70 px-3 flex items-center text-sm font-semibold text-white mt-1 tabular-nums">
                $42,000
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-wider text-stone-500">Project</label>
            <div className="min-h-[60px] w-full rounded-md bg-stone-800/70 border border-stone-700/70 px-3 py-2 text-sm text-stone-200 mt-1">
              {desc.displayText}
              {desc.cursor && (
                <span className="inline-block w-[2px] h-4 bg-amber-300 align-middle ml-[1px] animate-pulse" />
              )}
            </div>
          </div>

          <button className={`w-full rounded-md bg-amber-500 py-2.5 text-sm font-semibold text-stone-950 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/30 ${step >= 1 ? 'ring-2 ring-amber-300/50 animate-pulse' : ''}`}>
            Submit Referral
          </button>
        </div>
      </div>
    </div>
  );
}
