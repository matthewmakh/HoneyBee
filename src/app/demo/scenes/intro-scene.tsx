'use client';

import { Card, CardContent } from '@/components/ui/card';

interface IntroSceneProps {
  step: number;
}

export function IntroScene({ step }: IntroSceneProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card
        className={`max-w-lg w-full text-center transition-all duration-500 ${
          step >= 0 ? 'animate-demo-scale-up' : 'opacity-0'
        }`}
      >
        <CardContent className="pt-10 pb-10 px-8">
          <div className="text-6xl mb-6">🐝</div>
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Honey Bee Referral Club
          </h1>
          <p
            className={`text-xl font-semibold text-gold mb-4 transition-opacity duration-500 ${
              step >= 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            See How a Referral Becomes Revenue
          </p>
          <p
            className={`text-muted-foreground transition-opacity duration-500 ${
              step >= 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            Watch the complete journey — from submitting a lead to earning your commission
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
