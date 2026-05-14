'use client';

import { useState, useEffect, useCallback } from 'react';

const SCENE_DURATIONS = [5000, 7000, 11000, 5000, 8000, 8000, 8000, 7000, 9000, 8000, 7000];

export function useDemo(totalScenes: number) {
  const [scene, setScene] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [sceneProgress, setSceneProgress] = useState(0);

  const goTo = useCallback((i: number) => {
    setScene(i);
    setSceneProgress(0);
  }, []);
  const next = useCallback(() => {
    setScene((s) => (s < totalScenes - 1 ? s + 1 : s));
    setSceneProgress(0);
  }, [totalScenes]);
  const prev = useCallback(() => {
    setScene((s) => (s > 0 ? s - 1 : 0));
    setSceneProgress(0);
  }, []);
  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  useEffect(() => {
    if (!playing || scene >= totalScenes - 1) return;
    const duration = SCENE_DURATIONS[scene] || 6000;
    const interval = 50;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      setSceneProgress(Math.min(elapsed / duration, 1));
      if (elapsed >= duration) {
        clearInterval(timer);
        setScene((s) => s + 1);
        setSceneProgress(0);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [scene, playing, totalScenes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        next();
      } else if (e.code === 'ArrowLeft') {
        prev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, next, prev]);

  return { scene, playing, sceneProgress, goTo, next, prev, togglePlay };
}
