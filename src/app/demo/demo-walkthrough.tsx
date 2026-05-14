'use client';

import { useDemoEngine, DEMO_SCENES } from './use-demo-engine';
import { IntroScene } from './scenes/intro-scene';
import { ProviderPitch } from './scenes/provider-pitch';
import { PublicPage } from './scenes/public-page';
import { ReferrerPresent } from './scenes/referrer-present';
import { ReferrerSubmit } from './scenes/referrer-submit';
import { ProviderClose } from './scenes/provider-close';
import { AdminConfirm } from './scenes/admin-confirm';
import { Split12 } from './scenes/split-12';
import { UplineCascade } from './scenes/upline-cascade';
import { ReferrerWallet } from './scenes/referrer-wallet';
import { TeamMove } from './scenes/team-move';
import { AdminPayouts } from './scenes/admin-payouts';
import { OutroScene } from './scenes/outro-scene';
import { Play, Pause, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';

type SimpleScene = (props: { step: number }) => React.ReactNode;

const SIMPLE_SCENES: SimpleScene[] = [
  IntroScene,
  ProviderPitch,
  PublicPage,
  ReferrerPresent,
  ReferrerSubmit,
  ProviderClose,
  AdminConfirm,
  Split12,
  UplineCascade,
  ReferrerWallet,
  TeamMove,
  AdminPayouts,
];

const OUTRO_INDEX = SIMPLE_SCENES.length; // 12

export function DemoWalkthrough() {
  const {
    state,
    sceneProgress,
    togglePlay,
    next,
    prev,
    goTo,
    restart,
    cycleSpeed,
  } = useDemoEngine();

  const scene = DEMO_SCENES[state.sceneIndex];
  const caption = scene?.caption ?? '';
  const totalScenes = DEMO_SCENES.length;

  return (
    <div className="relative h-screen flex flex-col">
      {/* Scene content layer */}
      <div className="flex-1 overflow-hidden" style={{ paddingBottom: caption ? 140 : 80 }}>
        {SIMPLE_SCENES.map((Scene, i) => {
          const active = i === state.sceneIndex;
          const step = active ? state.stepIndex : 0;
          return (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-500 ${active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
              style={{ bottom: caption ? 140 : 80 }}
            >
              <div className="h-full overflow-y-auto">
                <Scene step={step} />
              </div>
            </div>
          );
        })}
        {/* Outro renders separately because it needs onRestart */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            state.sceneIndex === OUTRO_INDEX
              ? 'opacity-100 z-10'
              : 'opacity-0 z-0 pointer-events-none'
          }`}
          style={{ bottom: caption ? 140 : 80 }}
        >
          <div className="h-full overflow-y-auto">
            <OutroScene
              step={state.sceneIndex === OUTRO_INDEX ? state.stepIndex : 0}
              onRestart={restart}
            />
          </div>
        </div>
      </div>

      {/* Caption bar */}
      {caption && (
        <div
          className="fixed left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-sm border-t border-stone-800/60 px-6 py-3"
          style={{ bottom: 56 }}
        >
          <p className="text-sm text-stone-200 text-center max-w-3xl mx-auto leading-relaxed">
            {caption}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0c0907]/95 backdrop-blur-sm border-t border-stone-800/60">
        {/* Thin progress hairline */}
        <div className="h-0.5 bg-stone-800/80">
          <div
            className="h-full bg-amber-400 transition-all duration-100"
            style={{
              width: `${((state.sceneIndex + sceneProgress) / (totalScenes - 1)) * 100}%`,
            }}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 max-w-6xl mx-auto">
          {/* Left: chevron + play + chevron + label */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={prev}
              disabled={state.sceneIndex === 0}
              className="rounded-full p-1.5 text-stone-400 hover:text-amber-300 disabled:opacity-30 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={togglePlay}
              className="rounded-full p-1.5 text-stone-400 hover:text-amber-300 transition-colors"
              aria-label={state.isPaused ? 'Play' : 'Pause'}
            >
              {state.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button
              onClick={next}
              disabled={state.sceneIndex === totalScenes - 1}
              className="rounded-full p-1.5 text-stone-400 hover:text-amber-300 disabled:opacity-30 transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="text-xs text-stone-500 ml-2 hidden sm:block truncate max-w-[180px]">{scene?.title}</span>
          </div>

          {/* Center: dot indicators */}
          <div className="flex items-center gap-1.5">
            {DEMO_SCENES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === state.sceneIndex
                    ? 'h-2 w-6 bg-amber-400'
                    : i < state.sceneIndex
                    ? 'h-2 w-2 bg-amber-700/70'
                    : 'h-2 w-2 bg-stone-700'
                }`}
                aria-label={`Go to scene ${i + 1}`}
              />
            ))}
          </div>

          {/* Right: speed + counter */}
          <div className="flex items-center gap-3">
            <button
              onClick={cycleSpeed}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-stone-400 hover:text-amber-300 transition-colors"
              aria-label="Cycle playback speed"
            >
              <Gauge className="h-3 w-3" />
              <span className="tabular-nums">{state.speed}×</span>
            </button>
            <span className="text-xs text-stone-600 tabular-nums">{state.sceneIndex + 1} / {totalScenes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
