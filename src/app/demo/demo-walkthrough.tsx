'use client';

import { useDemoEngine } from './use-demo-engine';
import { ProgressBar } from './components/progress-bar';
import { RoleBadge } from './components/role-badge';
import { DemoControls } from './components/demo-controls';
import { SceneContainer } from './components/scene-container';
import { IntroScene } from './scenes/intro-scene';
import { ReferrerSearch } from './scenes/referrer-search';
import { ReferrerForm } from './scenes/referrer-form';
import { ReferrerSuccess } from './scenes/referrer-success';
import { ProviderNewLead } from './scenes/provider-new-lead';
import { ProviderAccept } from './scenes/provider-accept';
import { ProviderComplete } from './scenes/provider-complete';
import { AdminConfirm } from './scenes/admin-confirm';
import { AdminDistributed } from './scenes/admin-distributed';
import { ReferrerWallet } from './scenes/referrer-wallet';
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
  } = useDemoEngine();

  const renderScene = () => {
    const step = state.stepIndex;

    switch (state.sceneIndex) {
      case 0:
        return <IntroScene step={step} />;
      case 1:
        return <ReferrerSearch step={step} />;
      case 2:
        return <ReferrerForm step={step} />;
      case 3:
        return <ReferrerSuccess step={step} />;
      case 4:
        return <ProviderNewLead step={step} />;
      case 5:
        return <ProviderAccept step={step} />;
      case 6:
        return <ProviderComplete step={step} />;
      case 7:
        return <AdminConfirm step={step} />;
      case 8:
        return <AdminDistributed step={step} />;
      case 9:
        return <ReferrerWallet step={step} />;
      case 10:
        return <OutroScene step={step} onRestart={restart} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      <ProgressBar currentScene={state.sceneIndex} totalScenes={totalScenes} />
      <RoleBadge role={currentScene?.actor ?? null} />
      <DemoControls
        isPaused={state.isPaused}
        currentScene={state.sceneIndex}
        totalScenes={totalScenes}
        onPause={pause}
        onResume={resume}
        onSkip={skip}
      />

      <div className="min-h-screen flex items-center justify-center pt-12 pb-20">
        <SceneContainer sceneIndex={state.sceneIndex}>
          {renderScene()}
        </SceneContainer>
      </div>

      {state.isPaused && (
        <div className="fixed inset-0 z-40 bg-black/20 flex items-center justify-center pointer-events-none">
          <div className="bg-card px-6 py-3 rounded-full shadow-lg border text-sm font-medium text-muted-foreground pointer-events-none">
            Paused — press Space to resume
          </div>
        </div>
      )}
    </div>
  );
}
