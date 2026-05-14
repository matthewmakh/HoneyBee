'use client';

interface Props {
  step: number;
}

export function IntroScene({ step }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6">
      <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-8 shadow-lg shadow-amber-500/30 transition-all duration-700 ${step >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <span className="text-4xl">🐝</span>
      </div>

      <h1 className={`text-4xl sm:text-5xl font-bold text-white mb-3 transition-all duration-700 delay-100 ${step >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        The Bee Club
      </h1>

      <p className={`text-xl font-semibold text-amber-300 mb-4 transition-all duration-700 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        One referral. Twelve payouts.
      </p>

      <p className={`text-base text-stone-300 max-w-xl leading-relaxed transition-all duration-700 delay-100 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
        A-Team providers upload pitches. Bee Team referrers close deals.
        Commission splits across the whole upline, the Club Admin, and even
        the sponsor who first brought you in — <span className="text-amber-300 font-semibold">forever</span>.
      </p>

      <div className={`mt-10 flex flex-wrap justify-center gap-2 text-xs transition-all duration-700 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        {[
          { label: 'Direct 40%', cls: 'border-amber-400/40 text-amber-300 bg-amber-400/10' },
          { label: 'L-1 10%',    cls: 'border-yellow-400/40 text-yellow-200 bg-yellow-400/10' },
          { label: 'L-2 5%',     cls: 'border-yellow-400/30 text-yellow-200 bg-yellow-400/5' },
          { label: 'L-3 3%',     cls: 'border-yellow-400/30 text-yellow-200 bg-yellow-400/5' },
          { label: 'Admin 5%',   cls: 'border-orange-400/40 text-orange-300 bg-orange-400/10' },
          { label: 'Lifetime 1%', cls: 'border-amber-300/60 text-amber-200 bg-amber-300/15 shadow shadow-amber-500/20' },
        ].map((t) => (
          <span
            key={t.label}
            className={`px-3 py-1.5 rounded-full border font-mono tabular-nums ${t.cls}`}
          >
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}
