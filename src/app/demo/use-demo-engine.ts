'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export type ActorRole = 'referrer' | 'provider' | 'admin' | null;

export interface DemoScene {
  id: string;
  duration: number;
  steps: number;
  actor: ActorRole;
}

export type DemoSpeed = 0.5 | 1 | 2;

export interface DemoEngineState {
  sceneIndex: number;
  stepIndex: number;
  isPaused: boolean;
  isComplete: boolean;
  speed: DemoSpeed;
}

export const DEMO_SCENES: DemoScene[] = [
  { id: 'intro', duration: 6000, steps: 2, actor: null },
  { id: 'referrer-search', duration: 8000, steps: 3, actor: 'referrer' },
  { id: 'referrer-form', duration: 12000, steps: 6, actor: 'referrer' },
  { id: 'referrer-success', duration: 5000, steps: 2, actor: 'referrer' },
  { id: 'provider-new-lead', duration: 8000, steps: 3, actor: 'provider' },
  { id: 'provider-accept', duration: 8000, steps: 4, actor: 'provider' },
  { id: 'provider-complete', duration: 8000, steps: 4, actor: 'provider' },
  { id: 'admin-confirm', duration: 8000, steps: 3, actor: 'admin' },
  { id: 'admin-distributed', duration: 7000, steps: 4, actor: 'admin' },
  { id: 'referrer-wallet', duration: 8000, steps: 3, actor: 'referrer' },
  { id: 'outro', duration: 6000, steps: 2, actor: null },
];

export function useDemoEngine() {
  const [state, setState] = useState<DemoEngineState>({
    sceneIndex: 0,
    stepIndex: 0,
    isPaused: false,
    isComplete: false,
    speed: 1,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentScene = DEMO_SCENES[state.sceneIndex];
  const totalScenes = DEMO_SCENES.length;

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
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
      return {
        ...prev,
        sceneIndex: prev.sceneIndex + 1,
        stepIndex: 0,
      };
    });
  }, []);

  const advanceStep = useCallback(() => {
    setState((prev) => {
      const scene = DEMO_SCENES[prev.sceneIndex];
      if (!scene || prev.stepIndex >= scene.steps - 1) {
        return prev;
      }
      return { ...prev, stepIndex: prev.stepIndex + 1 };
    });
  }, []);

  // Auto-advance steps within a scene
  useEffect(() => {
    if (state.isPaused || state.isComplete) return;

    const scene = DEMO_SCENES[state.sceneIndex];
    if (!scene) return;

    const stepDuration = (scene.duration / scene.steps) / state.speed;

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
  }, [state.sceneIndex, state.stepIndex, state.isPaused, state.isComplete, state.speed, advanceStep, advanceScene]);

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
      sceneIndex: DEMO_SCENES.length - 1,
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
      const nextSpeed: DemoSpeed = prev.speed === 0.5 ? 1 : prev.speed === 1 ? 2 : 0.5;
      return { ...prev, speed: nextSpeed };
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (state.isPaused) resume();
        else pause();
      } else if (e.code === 'Escape') {
        skip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isPaused, pause, resume, skip]);

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
