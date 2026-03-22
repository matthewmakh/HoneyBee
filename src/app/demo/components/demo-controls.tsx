'use client';

import { Pause, Play, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DemoControlsProps {
  isPaused: boolean;
  currentScene: number;
  totalScenes: number;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
}

export function DemoControls({
  isPaused,
  currentScene,
  totalScenes,
  onPause,
  onResume,
  onSkip,
}: DemoControlsProps) {
  return (
    <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
      <span className="text-xs text-muted-foreground mr-1">
        {currentScene + 1}/{totalScenes}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={isPaused ? onResume : onPause}
        className="h-8 w-8 p-0"
      >
        {isPaused ? (
          <Play className="h-3.5 w-3.5" />
        ) : (
          <Pause className="h-3.5 w-3.5" />
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSkip}
        className="h-8 gap-1 px-2"
      >
        <SkipForward className="h-3.5 w-3.5" />
        <span className="text-xs">Skip</span>
      </Button>
    </div>
  );
}
