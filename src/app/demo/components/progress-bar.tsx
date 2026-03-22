'use client';

interface ProgressBarProps {
  currentScene: number;
  totalScenes: number;
}

export function ProgressBar({ currentScene, totalScenes }: ProgressBarProps) {
  const progress = ((currentScene + 1) / totalScenes) * 100;

  return (
    <div className="absolute top-0 left-0 right-0 h-1 bg-muted z-30">
      <div
        className="h-full bg-gold transition-all duration-500 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
