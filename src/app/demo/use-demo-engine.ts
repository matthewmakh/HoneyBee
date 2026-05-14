'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type ActorRole = 'referrer' | 'provider' | 'admin' | 'public' | null;

export interface DemoScene {
  id: string;
  duration: number;
  steps: number;
  actor: ActorRole;
  title: string;
  caption?: string;
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
  { id: 'intro',            duration: 6500,  steps: 3, actor: null,       title: 'Intro',          caption: '' },
  { id: 'provider-pitch',   duration: 9000,  steps: 4, actor: 'provider', title: 'A-Team Pitch',   caption: 'A-Team providers upload up to 4 photos and a 200-word pitch — no prices, no commissions. The page auto-publishes the moment it’s saved.' },
  { id: 'public-page',      duration: 7000,  steps: 3, actor: 'public',   title: 'Public Page',    caption: 'Every provider gets a clean public profile — share the link with any homeowner. Commissions and dollar figures stay private.' },
  { id: 'referrer-present', duration: 9000,  steps: 4, actor: 'referrer', title: 'Present',        caption: 'Bee Team referrers flip into presentation mode — same content, full-screen, customer-safe. Zero earnings visible.' },
  { id: 'referrer-submit',  duration: 9000,  steps: 3, actor: 'referrer', title: 'Submit',         caption: 'Submitting the referral freezes the upline — L-1, L-2, L-3, and the lifetime sponsor are locked in for this exact deal.' },
  { id: 'provider-close',   duration: 9500,  steps: 3, actor: 'provider', title: 'Close Deal',     caption: 'The provider accepts the lead — 12 payout lines spawn, pending. When the job closes, they report the final value to lock in commissions.' },
  { id: 'admin-confirm',    duration: 7000,  steps: 2, actor: 'admin',    title: 'Admin Confirm',  caption: 'Club Admin gives the final OK — all 12 payout lines flip from Pending to Available in one click.' },
  { id: 'split-12',         duration: 16000, steps: 6, actor: 'admin',    title: '12-Line Split',  caption: 'Every closed deal splits across the same 12 lines: direct referrer, upline overrides, Club Admin, lifetime sponsor, pools, and platform.' },
  { id: 'upline-cascade',   duration: 11000, steps: 5, actor: 'admin',    title: 'Upline',         caption: 'Overrides cascade up through L-1, L-2, L-3 managers — then Club Admin on top. The original sponsor branches off — 1% on every deal, forever.' },
  { id: 'referrer-wallet',  duration: 10000, steps: 4, actor: 'referrer', title: 'Wallet',         caption: 'Three buckets — Green (available now), Grey (pending confirmation), Black (paid lifetime). Plus a line-by-line breakdown for every deal.' },
  { id: 'team-move',        duration: 9000,  steps: 3, actor: 'referrer', title: 'Team Move',      caption: 'Swap your L-1 manager any time — your member ID and every past payout stay locked in. Old managers still get paid on their deals.' },
  { id: 'admin-payouts',    duration: 9000,  steps: 3, actor: 'admin',    title: 'Payouts',        caption: 'Club Admin filters by status and bulk-marks lines paid — wallets debit in one shot, audit trail intact.' },
  { id: 'outro',            duration: 8000,  steps: 3, actor: null,       title: 'Summary',        caption: '' },
];

export function useDemoEngine() {
  const [state, setState] = useState<DemoEngineState>({
    sceneIndex: 0,
    stepIndex: 0,
    isPaused: false,
    isComplete: false,
    speed: 1,
  });
  const [sceneProgress, setSceneProgress] = useState(0);

  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentScene = DEMO_SCENES[state.sceneIndex];
  const totalScenes = DEMO_SCENES.length;

  const clearTimers = useCallback(() => {
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, []);

  const advanceScene = useCallback(() => {
    setState((prev) => {
      if (prev.sceneIndex >= DEMO_SCENES.length - 1) {
        return { ...prev, isComplete: true };
      }
      return { ...prev, sceneIndex: prev.sceneIndex + 1, stepIndex: 0 };
    });
    setSceneProgress(0);
  }, []);

  const advanceStep = useCallback(() => {
    setState((prev) => {
      const scene = DEMO_SCENES[prev.sceneIndex];
      if (!scene || prev.stepIndex >= scene.steps - 1) return prev;
      return { ...prev, stepIndex: prev.stepIndex + 1 };
    });
  }, []);

  // Auto-advance steps within a scene
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

  // Smooth sceneProgress (for top hairline) — fills 0→1 over the scene's full duration
  useEffect(() => {
    if (state.isPaused || state.isComplete) return;
    const scene = DEMO_SCENES[state.sceneIndex];
    if (!scene) return;

    // Reset on scene change
    setSceneProgress(0);
    const duration = scene.duration / state.speed;
    const interval = 60;
    let elapsed = 0;
    progressTimerRef.current = setInterval(() => {
      elapsed += interval;
      setSceneProgress(Math.min(elapsed / duration, 1));
      if (elapsed >= duration) {
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      }
    }, interval);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [state.sceneIndex, state.isPaused, state.isComplete, state.speed]);

  const pause = useCallback(() => {
    clearTimers();
    setState((prev) => ({ ...prev, isPaused: true }));
  }, [clearTimers]);

  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isPaused: false }));
  }, []);

  const goTo = useCallback((i: number) => {
    clearTimers();
    setState((prev) => ({
      ...prev,
      sceneIndex: Math.max(0, Math.min(i, DEMO_SCENES.length - 1)),
      stepIndex: 0,
      isPaused: prev.isPaused,
      isComplete: false,
    }));
    setSceneProgress(0);
  }, [clearTimers]);

  const next = useCallback(() => {
    clearTimers();
    setState((prev) => {
      if (prev.sceneIndex >= DEMO_SCENES.length - 1) return prev;
      return {
        ...prev,
        sceneIndex: prev.sceneIndex + 1,
        stepIndex: 0,
        isComplete: false,
      };
    });
    setSceneProgress(0);
  }, [clearTimers]);

  const prev = useCallback(() => {
    clearTimers();
    setState((p) => ({
      ...p,
      sceneIndex: Math.max(0, p.sceneIndex - 1),
      stepIndex: 0,
      isComplete: false,
    }));
    setSceneProgress(0);
  }, [clearTimers]);

  const skip = useCallback(() => {
    next();
  }, [next]);

  const restart = useCallback(() => {
    clearTimers();
    setState((prev) => ({
      sceneIndex: 0,
      stepIndex: 0,
      isPaused: false,
      isComplete: false,
      speed: prev.speed,
    }));
    setSceneProgress(0);
  }, [clearTimers]);

  const togglePlay = useCallback(() => {
    setState((p) => ({ ...p, isPaused: !p.isPaused }));
  }, []);

  const cycleSpeed = useCallback(() => {
    setState((prev) => {
      const nextSpeed: DemoSpeed =
        prev.speed === 0.5 ? 1 : prev.speed === 1 ? 2 : 0.5;
      return { ...prev, speed: nextSpeed };
    });
  }, []);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        prev();
      } else if (e.code === 'KeyR') {
        restart();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, next, prev, restart]);

  return {
    state,
    currentScene,
    totalScenes,
    sceneProgress,
    pause,
    resume,
    togglePlay,
    skip,
    next,
    prev,
    goTo,
    restart,
    advanceStep,
    advanceScene,
    cycleSpeed,
  };
}
