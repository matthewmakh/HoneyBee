'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type ActorRole = 'referrer' | 'provider' | 'admin' | 'public' | null;

export interface DemoScene {
  id: string;
  duration: number;
  steps: number;
  actor: ActorRole;
  title: string;
}

export type DemoSpeed = 0.5 | 1 | 2;

export interface DemoEngineState {
  sceneIndex: number;
  stepIndex: number;
  isPaused: boolean;
  isComplete: boolean;
  speed: DemoSpeed;
}

// 13 scenes covering the full MLM lifecycle.
export const DEMO_SCENES: DemoScene[] = [
  { id: 'intro',            duration: 6000,  steps: 3, actor: null,       title: 'The Bee Club' },
  { id: 'provider-pitch',   duration: 10000, steps: 4, actor: 'provider', title: 'A-Team: Upload Pitch' },
  { id: 'public-page',      duration: 6000,  steps: 3, actor: 'public',   title: 'Public Catalogue' },
  { id: 'referrer-present', duration: 9000,  steps: 4, actor: 'referrer', title: 'Bee Team: Present' },
  { id: 'referrer-submit',  duration: 8000,  steps: 3, actor: 'referrer', title: 'Submit Referral' },
  { id: 'provider-close',   duration: 8000,  steps: 3, actor: 'provider', title: 'Provider Closes Deal' },
  { id: 'admin-confirm',    duration: 6000,  steps: 2, actor: 'admin',    title: 'Admin Confirms' },
  { id: 'split-12',         duration: 14000, steps: 6, actor: 'admin',    title: 'The 12-Line Split' },
  { id: 'upline-cascade',   duration: 10000, steps: 5, actor: 'admin',    title: 'Upline + Lifetime Sponsor' },
  { id: 'referrer-wallet',  duration: 9000,  steps: 4, actor: 'referrer', title: 'Wallet · Green/Grey/Black' },
  { id: 'team-move',        duration: 8000,  steps: 3, actor: 'referrer', title: 'Change L-1 Manager' },
  { id: 'admin-payouts',    duration: 8000,  steps: 3, actor: 'admin',    title: 'Admin Payouts Queue' },
  { id: 'outro',            duration: 7000,  steps: 3, actor: null,       title: '1 Deal → 12 Payouts' },
];

export function useDemoEngine() {
  const [state, setState] = useState<DemoEngineState>({
    sceneIndex: 0,
    stepIndex: 0,
    isPaused: false,
    isComplete: false,
    speed: 1,
  });

  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentScene = DEMO_SCENES[state.sceneIndex];
  const totalScenes = DEMO_SCENES.length;

  const clearTimers = useCallback(() => {
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  }, []);

  const advanceScene = useCallback(() => {
    setState((prev) => {
      if (prev.sceneIndex >= DEMO_SCENES.length - 1) {
        return { ...prev, isComplete: true };
      }
      return { ...prev, sceneIndex: prev.sceneIndex + 1, stepIndex: 0 };
    });
  }, []);

  const advanceStep = useCallback(() => {
    setState((prev) => {
      const scene = DEMO_SCENES[prev.sceneIndex];
      if (!scene || prev.stepIndex >= scene.steps - 1) return prev;
      return { ...prev, stepIndex: prev.stepIndex + 1 };
    });
  }, []);

  useEffect(() => {
    if (state.isPaused || state.isComplete) return;
    const scene = DEMO_SCENES[state.sceneIndex];
    if (!scene) return;

    const stepDuration = scene.duration / scene.steps / state.speed;
    stepTimerRef.current = setTimeout(() => {
      if (state.stepIndex < scene.steps - 1) {
        advanceStep();
      } else {
        advanceScene();
      }
    }, stepDuration);

    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, [
    state.sceneIndex,
    state.stepIndex,
    state.isPaused,
    state.isComplete,
    state.speed,
    advanceStep,
    advanceScene,
  ]);

  const pause = useCallback(() => {
    clearTimers();
    setState((prev) => ({ ...prev, isPaused: true }));
  }, [clearTimers]);

  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const skip = useCallback(() => {
    clearTimers();
    setState((prev) => ({
      sceneIndex: Math.min(prev.sceneIndex + 1, DEMO_SCENES.length - 1),
      stepIndex: 0,
      isPaused: false,
      isComplete: false,
      speed: prev.speed,
    }));
  }, [clearTimers]);

  const restart = useCallback(() => {
    clearTimers();
    setState((prev) => ({
      sceneIndex: 0,
      stepIndex: 0,
      isPaused: false,
      isComplete: false,
      speed: prev.speed,
    }));
  }, [clearTimers]);

  const cycleSpeed = useCallback(() => {
    setState((prev) => {
      const nextSpeed: DemoSpeed =
        prev.speed === 0.5 ? 1 : prev.speed === 1 ? 2 : 0.5;
      return { ...prev, speed: nextSpeed };
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (state.isPaused) resume();
        else pause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        skip();
      } else if (e.code === 'KeyR') {
        restart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isPaused, pause, resume, skip, restart]);

  return {
    state,
    currentScene,
    totalScenes,
    pause,
    resume,
    skip,
    restart,
    advanceStep,
    advanceScene,
    cycleSpeed,
  };
}
