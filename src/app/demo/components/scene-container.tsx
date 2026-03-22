'use client';

import { useEffect, useState, useRef } from 'react';

interface SceneContainerProps {
  sceneIndex: number;
  children: React.ReactNode;
}

export function SceneContainer({ sceneIndex, children }: SceneContainerProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const prevSceneRef = useRef(sceneIndex);

  useEffect(() => {
    if (sceneIndex !== prevSceneRef.current) {
      setIsTransitioning(true);
      const timeout = setTimeout(() => {
        setDisplayedChildren(children);
        setIsTransitioning(false);
        prevSceneRef.current = sceneIndex;
      }, 300);
      return () => clearTimeout(timeout);
    }
    setDisplayedChildren(children);
    return undefined;
  }, [sceneIndex, children]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div
        className={`w-full max-w-4xl mx-auto px-4 transition-all duration-300 ease-out ${
          isTransitioning
            ? 'opacity-0 translate-x-[-30px]'
            : 'opacity-100 translate-x-0'
        }`}
      >
        {displayedChildren}
      </div>
    </div>
  );
}
