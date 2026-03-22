'use client';

interface AnnotationBubbleProps {
  children: React.ReactNode;
  position?: 'top' | 'bottom';
  visible?: boolean;
  inline?: boolean;
}

export function AnnotationBubble({
  children,
  position = 'bottom',
  visible = true,
  inline = false,
}: AnnotationBubbleProps) {
  if (!visible) return null;

  if (inline) {
    return (
      <div className="shrink-0 animate-demo-spotlight">
        <div className="relative bg-yellow-400 text-yellow-950 px-3 py-1.5 rounded-lg shadow-lg text-xs font-medium whitespace-nowrap">
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-[5px] border-t-transparent border-b-transparent border-l-transparent border-r-yellow-400" />
          {children}
        </div>
      </div>
    );
  }

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
