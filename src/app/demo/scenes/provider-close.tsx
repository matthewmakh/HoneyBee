'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK, formatMoney } from '../mock-data';
import { ThumbsUp, Briefcase } from 'lucide-react';

interface Props {
  step: number;
}

export function ProviderClose({ step }: Props) {
  return (
    <div className="w-full">
      <MockHeader role="provider" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-emerald-600" />
                New Lead from Riley Martinez
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {MOCK.homeowner.name} · {MOCK.homeowner.address}
              </p>
            </div>
            <Badge
              variant="outline"
              className={
                step >= 1
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : ''
              }
            >
              {step === 0 && 'SUBMITTED'}
              {step >= 1 && 'ACCEPTED'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm">{MOCK.project.description}</div>

            {step === 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="gap-1 animate-demo-pulse-ring ring-2 ring-yellow-400"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Accept Lead
                </Button>
                <Button size="sm" variant="outline">
                  Decline
                </Button>
              </div>
            )}

            {step === 1 && (
              <div className="animate-demo-fade-in">
                <div className="text-xs text-muted-foreground">
                  Creating 12 PENDING_COMPLETION payout rows...
                </div>
                <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: '100%', transition: 'width 800ms ease-out' }}
                  />
                </div>
              </div>
            )}

            {step >= 2 && (
              <div className="animate-demo-fade-in space-y-3 border-t pt-4">
                <div className="text-sm font-medium">
                  Job complete — report final value:
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    value={formatMoney(MOCK.commission.jobValue)}
                    readOnly
                    className="flex-1 font-mono text-lg font-bold"
                  />
                  <Button size="lg">Submit for Confirmation</Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  @ {MOCK.commission.offeredPct}% commission = {' '}
                  <span className="font-bold text-foreground">
                    {formatMoney(MOCK.commission.total)}
                  </span>{' '}
                  to distribute
                </div>
                <div className="flex justify-end">
                  <AnnotationBubble visible inline>
                    Goes to Club Admin for confirmation
                  </AnnotationBubble>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
