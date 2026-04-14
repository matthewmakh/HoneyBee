'use client';

import { useDemoEngine } from './use-demo-engine';
import { ProgressBar } from './components/progress-bar';
import { RoleBadge } from './components/role-badge';
import { DemoControls } from './components/demo-controls';
import { SceneContainer } from './components/scene-container';
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

export function DemoWalkthrough() {
  const {
    state,
    currentScene,
    totalScenes,
    pause,
    resume,
    skip,
    restart,
    cycleSpeed,
  } = useDemoEngine();

  const renderScene = () => {
    const step = state.stepIndex;
    switch (state.sceneIndex) {
      case 0:  return <IntroScene step={step} />;
      case 1:  return <ProviderPitch step={step} />;
      case 2:  return <PublicPage step={step} />;
      case 3:  return <ReferrerPresent step={step} />;
      case 4:  return <ReferrerSubmit step={step} />;
      case 5:  return <ProviderClose step={step} />;
      case 6:  return <AdminConfirm step={step} />;
      case 7:  return <Split12 step={step} />;
      case 8:  return <UplineCascade step={step} />;
      case 9:  return <ReferrerWallet step={step} />;
      case 10: return <TeamMove step={step} />;
      case 11: return <AdminPayouts step={step} />;
      case 12: return <OutroScene step={step} onRestart={restart} />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      <ProgressBar currentScene={state.sceneIndex} totalScenes={totalScenes} />
      <RoleBadge role={currentScene?.actor ?? null} />

      {/* Scene title banner */}
      {currentScene && state.sceneIndex > 0 && state.sceneIndex < totalScenes - 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 hidden sm:block">
          <div className="bg-card border rounded-full px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
            {currentScene.title}
          </div>
        </div>
      )}

      <DemoControls
        isPaused={state.isPaused}
        currentScene={state.sceneIndex}
        totalScenes={totalScenes}
        speed={state.speed}
        onPause={pause}
        onResume={resume}
        onSkip={skip}
        onCycleSpeed={cycleSpeed}
      />

      <div className="min-h-screen flex items-center justify-center pt-16 pb-20">
        <SceneContainer sceneIndex={state.sceneIndex}>
          {renderScene()}
        </SceneContainer>
      </div>

      {state.isPaused && (
        <div className="fixed inset-0 z-40 bg-black/20 flex items-center justify-center pointer-events-none">
          <div className="bg-card px-6 py-3 rounded-full shadow-lg border text-sm font-medium text-muted-foreground pointer-events-none">
            Paused — press Space to resume · → to skip · R to restart
          </div>
        </div>
      )}
    </div>
  );
}
