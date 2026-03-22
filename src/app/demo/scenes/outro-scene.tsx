'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, ThumbsUp, CheckSquare, Shield, Wallet } from 'lucide-react';
import Link from 'next/link';

interface OutroSceneProps {
  step: number;
  onRestart: () => void;
}

const steps = [
  { icon: Send, label: 'Submit', color: 'text-blue-600 bg-blue-100' },
  { icon: ThumbsUp, label: 'Accept', color: 'text-emerald-600 bg-emerald-100' },
  { icon: CheckSquare, label: 'Complete', color: 'text-amber-600 bg-amber-100' },
  { icon: Shield, label: 'Confirm', color: 'text-purple-600 bg-purple-100' },
  { icon: Wallet, label: 'Paid', color: 'text-gold bg-yellow-100' },
];

export function OutroScene({ step, onRestart }: OutroSceneProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-xl w-full text-center animate-demo-scale-up">
        <CardContent className="pt-10 pb-10 px-8">
          <div className="text-4xl mb-4">🐝</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            From Referral to Revenue
          </h2>
          <p className="text-muted-foreground mb-8">in 5 Simple Steps</p>

          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-1.5"
                  style={{
                    opacity: step >= 1 ? 1 : 0,
                    transform: step >= 1 ? 'translateY(0)' : 'translateY(10px)',
                    transition: `all 0.4s ease-out ${i * 0.1}s`,
                  }}
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${s.color} flex items-center justify-center`}
                  >
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
                  {i < steps.length - 1 && (
                    <div className="absolute" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-3">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
            <Button onClick={onRestart}>Watch Again</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
