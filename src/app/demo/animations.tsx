'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export function FadeIn({
  children,
  delay = 0,
  duration = 700,
  className,
  show = true,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  show?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay, show]);

  return (
    <div
      className={cn('transition-all', className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
}

export function SlideIn({
  children,
  delay = 0,
  direction = 'up',
  className,
  show = true,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
  className?: string;
  show?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!show) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay, show]);

  const translate = {
    up: visible ? 'translateY(0)' : 'translateY(40px)',
    left: visible ? 'translateX(0)' : 'translateX(-40px)',
    right: visible ? 'translateX(0)' : 'translateX(40px)',
  };

  return (
    <div
      className={cn('transition-all duration-700', className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: translate[direction],
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  );
}

export function ProgressFill({
  value,
  delay = 0,
  color = 'bg-amber-500',
  show = true,
  className,
}: {
  value: number;
  delay?: number;
  color?: string;
  show?: boolean;
  className?: string;
}) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!show) {
      setWidth(0);
      return;
    }
    const t = setTimeout(() => setWidth(value), delay);
    return () => clearTimeout(t);
  }, [value, delay, show]);

  return (
    <div className={cn('h-2.5 w-full rounded-full bg-stone-800/70 overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-[1500ms] ease-out', color)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
