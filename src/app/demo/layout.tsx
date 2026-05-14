export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0c0907] text-white overflow-hidden">
      {/* Warm honey radial glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 1200px 800px at 50% -10%, rgba(245,158,11,0.10), transparent 60%), radial-gradient(ellipse 800px 600px at 50% 110%, rgba(234,179,8,0.06), transparent 60%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
