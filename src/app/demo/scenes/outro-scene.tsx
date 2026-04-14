'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { formatMoney, MOCK } from '../mock-data';

interface Props {
  step: number;
  onRestart: () => void;
}

const FLOW = [
  { emoji: '📸', label: 'A-Team pitch' },
  { emoji: '📲', label: 'Bee Team presents' },
  { emoji: '📝', label: 'Referral submitted' },
  { emoji: '🛠', label: 'Provider closes' },
  { emoji: '🛡', label: 'Admin confirms' },
  { emoji: '💸', label: '12 payouts' },
];

export function OutroScene({ step, onRestart }: Props) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-2xl w-full text-center animate-demo-scale-up">
        <CardContent className="pt-10 pb-10 px-8">
          <div className="text-4xl mb-3">🐝</div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            1 Referral → 12 Payouts
          </h2>
          <p className="text-muted-foreground mb-8">
            {formatMoney(MOCK.commission.total)} on a{' '}
            {formatMoney(MOCK.commission.jobValue)} job, split every which way
            — instantly and auditably.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
            {FLOW.map((f, i) => (
              <div
                key={f.label}
                className="flex items-center gap-2"
                style={{
                  opacity: step >= 1 ? 1 : 0,
                  transform: step >= 1 ? 'translateY(0)' : 'translateY(10px)',
                  transition: `all 0.4s ease-out ${i * 90}ms`,
                }}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-muted flex items-center justify-center text-xl">
                    {f.emoji}
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground max-w-[4.5rem] text-center">
                    {f.label}
                  </span>
                </div>
                {i < FLOW.length - 1 && (
                  <span className="text-muted-foreground/40 hidden sm:inline">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>

          {step >= 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8 animate-demo-fade-in">
              <Stat label="Direct referrer" value="40%" />
              <Stat label="Upline + Admin" value="24%" />
              <Stat label="Lifetime sponsor" value="1% forever" gold />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
            <Link href="/register">
              <Button>Join the Bee Club</Button>
            </Link>
            <Button variant="ghost" onClick={onRestart}>
              Watch Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  gold = false,
}: {
  label: string;
  value: string;
  gold?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-3 text-left ${
        gold ? 'border-[hsl(var(--gold))] bg-amber-50' : 'bg-muted/40'
      }`}
    >
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={`text-lg font-bold font-mono ${
          gold ? 'text-amber-700' : ''
        }`}
      >
        {value}
      </div>
    </div>
  );
}
