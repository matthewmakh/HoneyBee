'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK } from '../mock-data';
import { useTypewriter } from '../use-typewriter';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  step: number;
}

export function ReferrerSubmit({ step }: Props) {
  const name = useTypewriter(MOCK.homeowner.name, {
    speed: 60,
    startDelay: 400,
    active: step >= 0,
  });
  const desc = useTypewriter(MOCK.project.description, {
    speed: 28,
    startDelay: 200,
    active: step >= 1,
  });

  if (step >= 2) {
    return (
      <div className="w-full">
        <MockHeader role="referrer" />
        <div className="bg-card rounded-b-lg border border-t-0 p-8">
          <div className="max-w-md mx-auto text-center animate-demo-scale-up">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Referral submitted!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Lead routed to Sunshine Solar Co. Your upline snapshot was frozen
              — this deal will always credit the right people.
            </p>
            <div className="rounded-md border bg-muted/50 p-3 text-xs text-left space-y-1 font-mono">
              <div>
                <span className="text-muted-foreground">snapshot.l1:</span>{' '}
                {MOCK.l1Manager.memberId} ({MOCK.l1Manager.name})
              </div>
              <div>
                <span className="text-muted-foreground">snapshot.l2:</span>{' '}
                {MOCK.l2Manager.memberId} ({MOCK.l2Manager.name})
              </div>
              <div>
                <span className="text-muted-foreground">snapshot.l3:</span>{' '}
                {MOCK.l3Manager.memberId}
              </div>
              <div>
                <span className="text-muted-foreground">snapshot.sponsor:</span>{' '}
                {MOCK.originalSponsor.memberId} (Lifetime 1%)
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <AnnotationBubble visible>
                Team moves later won&apos;t change this payout
              </AnnotationBubble>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <MockHeader role="referrer" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Submit Referral — Sunshine Solar Co</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">
                Homeowner name
              </label>
              <div className="relative">
                <Input value={name.displayText} readOnly className="pr-6" />
                {name.cursor && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-foreground animate-pulse" />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Phone</label>
                <Input value={MOCK.homeowner.phone} readOnly />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  Est. Job Value
                </label>
                <Input value="$42,000" readOnly />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Project</label>
              <Textarea
                value={desc.displayText}
                readOnly
                className="resize-none"
                rows={2}
              />
            </div>
            <Button
              size="lg"
              className={`w-full ${
                step >= 1 ? 'animate-demo-pulse-ring ring-2 ring-yellow-400' : ''
              }`}
            >
              Submit Referral
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
