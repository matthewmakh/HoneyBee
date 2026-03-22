'use client';

interface AnnotationBubbleProps {
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  visible?: boolean;
}

export function AnnotationBubble({
  children,
  position = 'bottom',
  visible = true,
}: AnnotationBubbleProps) {
  if (!visible) return null;

  return (
    <div className={`flex justify-center ${position === 'bottom' ? 'mt-4' : 'mb-4'} animate-demo-spotlight`}>
      <div className="relative bg-yellow-400 text-yellow-950 px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium max-w-sm text-center">
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-[6px] ${
            position === 'bottom'
              ? 'bottom-full border-l-transparent border-r-transparent border-t-transparent border-b-yellow-400'
              : 'top-full border-l-transparent border-r-transparent border-b-transparent border-t-yellow-400'
          }`}
        />
        {children}
      </div>
    </div>
  );
}
