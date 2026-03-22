'use client';

import { useState, useEffect, useRef } from 'react';

interface UseTypewriterOptions {
  speed?: number;
  startDelay?: number;
  onComplete?: () => void;
  active?: boolean;
}

export function useTypewriter(
  text: string,
  options: UseTypewriterOptions = {}
) {
  const { speed = 50, startDelay = 0, onComplete, active = true } = options;
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const indexRef = useRef(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setDisplayText('');
      setIsComplete(false);
      indexRef.current = 0;
      hasStartedRef.current = false;
      return;
    }

    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (indexRef.current < text.length) {
          indexRef.current++;
          setDisplayText(text.slice(0, indexRef.current));
        } else {
          clearInterval(interval);
          setIsComplete(true);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(startTimeout);
  }, [text, speed, startDelay, onComplete, active]);

  // Cursor blink
  useEffect(() => {
    if (isComplete) {
      setShowCursor(false);
      return;
    }
    const blink = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(blink);
  }, [isComplete]);

  return { displayText, isComplete, cursor: showCursor && !isComplete };
}
