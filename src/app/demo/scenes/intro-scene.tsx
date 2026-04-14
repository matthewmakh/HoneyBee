'use client';

import { Card, CardContent } from '@/components/ui/card';

interface Props {
  step: number;
}

export function IntroScene({ step }: Props) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card
        className={`max-w-xl w-full text-center transition-all duration-500 ${
          step >= 0 ? 'animate-demo-scale-up' : 'opacity-0'
        }`}
      >
        <CardContent className="pt-10 pb-10 px-8">
          <div className="text-6xl mb-6">🐝</div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            The Bee Club
          </h1>
          <p
            className={`text-xl font-semibold text-[hsl(var(--gold))] mb-4 transition-opacity duration-500 ${
              step >= 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            One referral. Twelve payouts.
          </p>
          <p
            className={`text-muted-foreground transition-opacity duration-500 ${
              step >= 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            A-Team providers upload pitches. Bee Team referrers close deals.
            Commission splits across the whole upline, the Club Admin, and even
            the sponsor who first brought you in — forever.
          </p>
          <div
            className={`mt-6 flex flex-wrap justify-center gap-2 text-xs transition-opacity duration-500 ${
              step >= 2 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {['Direct 40%', 'L-1 10%', 'L-2 5%', 'L-3 3%', 'Admin 5%', 'Lifetime 1%'].map(
              (x) => (
                <span
                  key={x}
                  className="px-2 py-1 rounded-full bg-muted font-mono text-muted-foreground"
                >
                  {x}
                </span>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
