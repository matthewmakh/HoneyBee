'use client';

import { useDemo } from './use-demo';
import {
  SceneHero,
  SceneReferrerSearch,
  SceneReferrerForm,
  SceneReferrerSuccess,
  SceneProviderNewLead,
  SceneProviderAccept,
  SceneProviderComplete,
  SceneAdminConfirm,
  SceneAdminDistributed,
  SceneReferrerWallet,
  SceneClosing,
} from './scenes';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

const SCENES = [
  { component: SceneHero, label: 'Intro', caption: '' },
  { component: SceneReferrerSearch, label: 'Search', caption: 'Referrers browse the provider directory and pick the right one — every commission rate is listed upfront.' },
  { component: SceneReferrerForm, label: 'Submit', caption: 'A short form captures everything the provider needs — homeowner contact, address, and project details.' },
  { component: SceneReferrerSuccess, label: 'Submitted', caption: 'The commission rate is locked the moment the referral is submitted — no negotiation, no surprises.' },
  { component: SceneProviderNewLead, label: 'New Lead', caption: 'Providers see every new referral the moment it arrives — full details and a single click to accept.' },
  { component: SceneProviderAccept, label: 'Accept', caption: 'On accept, the provider sets an estimate and sees the projected referral fee instantly.' },
  { component: SceneProviderComplete, label: 'Complete', caption: 'When the job closes, the final value drives the actual commission — calculated automatically.' },
  { component: SceneAdminConfirm, label: 'Confirm', caption: 'Admins verify every completed deal before payout — referrer, provider, and final value all in one view.' },
  { component: SceneAdminDistributed, label: 'Distribute', caption: 'The 50/40/10 split runs in seconds — cash to referrer, benefits credits, and platform revenue, all at once.' },
  { component: SceneReferrerWallet, label: 'Wallet', caption: 'Referrers watch balances update in real-time — cash ready to withdraw, benefits ready to spend.' },
  { component: SceneClosing, label: 'Summary', caption: '' },
];

export default function DemoPage() {
  const { scene, playing, sceneProgress, goTo, next, prev, togglePlay } = useDemo(SCENES.length);
  const caption = SCENES[scene].caption;

  return (
    <div className="relative h-screen flex flex-col">
      {/* Scene content */}
      <div className="flex-1 overflow-hidden" style={{ paddingBottom: caption ? 140 : 80 }}>
        {SCENES.map(({ component: Scene }, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-500 ${i === scene ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
            style={{ bottom: caption ? 140 : 80 }}
          >
            <div className="h-full overflow-y-auto">
              <Scene active={i === scene} />
            </div>
          </div>
        ))}
      </div>

      {/* Caption bar */}
      {caption && (
        <div
          className="fixed left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-sm border-t border-stone-800/50 px-6 py-3"
          style={{ bottom: 56 }}
        >
          <p className="text-sm text-stone-200 text-center max-w-2xl mx-auto leading-relaxed">
            {caption}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-stone-950/95 backdrop-blur-sm border-t border-stone-800/50">
        <div className="h-0.5 bg-stone-800">
          <div
            className="h-full bg-amber-400 transition-all duration-100"
            style={{ width: `${((scene + sceneProgress) / (SCENES.length - 1)) * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 max-w-5xl mx-auto">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={prev}
              disabled={scene === 0}
              className="rounded-full p-1.5 text-stone-400 hover:text-white disabled:opacity-30 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={togglePlay}
              className="rounded-full p-1.5 text-stone-400 hover:text-white transition-colors"
              aria-label={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              onClick={next}
              disabled={scene === SCENES.length - 1}
              className="rounded-full p-1.5 text-stone-400 hover:text-white disabled:opacity-30 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="text-xs text-stone-500 ml-2 hidden sm:block">{SCENES[scene].label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {SCENES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === scene
                    ? 'h-2 w-6 bg-amber-400'
                    : i < scene
                    ? 'h-2 w-2 bg-amber-700/70'
                    : 'h-2 w-2 bg-stone-700'
                }`}
                aria-label={`Go to scene ${i + 1}`}
              />
            ))}
          </div>
          <span className="text-xs text-stone-600 tabular-nums">{scene + 1} / {SCENES.length}</span>
        </div>
      </div>
    </div>
  );
}
