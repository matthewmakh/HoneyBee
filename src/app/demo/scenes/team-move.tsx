'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK } from '../mock-data';
import { ArrowRight, ChevronsUpDown, Lock } from 'lucide-react';

interface Props {
  step: number;
}

export function TeamMove({ step }: Props) {
  const newManager = { name: 'Priya Patel', memberId: 'HB-000099' };
  return (
    <div className="w-full">
      <MockHeader role="referrer" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Change My L-1 Manager</CardTitle>
            <p className="text-xs text-muted-foreground">
              Swap the manager above you — your member ID and historical
              payouts stay exactly where they are.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Identity card - locked */}
            <div className="rounded-md border bg-muted/50 p-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Your member ID</div>
                <div className="font-mono font-bold">{MOCK.referrer.memberId}</div>
              </div>
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" /> Immutable
              </Badge>
            </div>

            {/* Old → new manager */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div
                className={`rounded-md border p-3 transition-all ${
                  step >= 1 ? 'opacity-50 line-through' : ''
                }`}
              >
                <div className="text-xs text-muted-foreground">Current L-1</div>
                <div className="font-medium">{MOCK.l1Manager.name}</div>
                <div className="text-xs font-mono text-muted-foreground">
                  {MOCK.l1Manager.memberId}
                </div>
              </div>

              <ArrowRight
                className={`h-5 w-5 ${
                  step >= 1 ? 'text-primary' : 'text-muted-foreground/40'
                }`}
              />

              <div
                className={`rounded-md border-2 p-3 transition-all ${
                  step >= 1
                    ? 'border-emerald-400 bg-emerald-50 animate-demo-scale-up'
                    : 'border-dashed'
                }`}
              >
                <div className="text-xs text-emerald-700 font-semibold">
                  New L-1
                </div>
                {step >= 1 ? (
                  <>
                    <div className="font-medium">{newManager.name}</div>
                    <div className="text-xs font-mono text-muted-foreground">
                      {newManager.memberId}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <ChevronsUpDown className="h-3.5 w-3.5" />
                    Pick a new manager…
                  </div>
                )}
              </div>
            </div>

            {step === 0 && (
              <Button
                size="sm"
                className="animate-demo-pulse-ring ring-2 ring-yellow-400"
              >
                Save change
              </Button>
            )}

            {step >= 2 && (
              <div className="animate-demo-fade-in rounded-md border-2 border-amber-300 bg-amber-50 p-3 text-xs font-mono space-y-1">
                <div>
                  <span className="text-muted-foreground">UPDATE</span> TeamMembership{' '}
                  <span className="text-muted-foreground">
                    SET endedAt = now()
                  </span>{' '}
                  WHERE id = previous
                </div>
                <div>
                  <span className="text-muted-foreground">INSERT INTO</span>{' '}
                  TeamMembership(l1ManagerCompanyId=HB-000099, startedAt=now())
                </div>
                <div className="text-emerald-700 pt-1">
                  ✓ 3 open Leads keep their <code>uplineSnapshotJson</code> — old
                  managers still get paid.
                </div>
              </div>
            )}

            {step >= 2 && (
              <div className="flex justify-center">
                <AnnotationBubble visible>
                  Team moves are append-only history — no rewriting payouts
                </AnnotationBubble>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
