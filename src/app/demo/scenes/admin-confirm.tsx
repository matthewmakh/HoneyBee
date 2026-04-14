'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MockHeader } from '../components/mock-header';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MOCK, formatMoney } from '../mock-data';
import { ShieldCheck } from 'lucide-react';

interface Props {
  step: number;
}

export function AdminConfirm({ step }: Props) {
  return (
    <div className="w-full">
      <MockHeader role="admin" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-purple-600" />
              Pending Confirmation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Provider</div>
                <div className="font-medium">{MOCK.provider.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Referrer</div>
                <div className="font-medium">{MOCK.referrer.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Homeowner</div>
                <div className="font-medium">{MOCK.homeowner.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Job Value</div>
                <div className="font-medium font-mono">
                  {formatMoney(MOCK.commission.jobValue)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md bg-muted p-3">
              <span className="text-sm">Commission to distribute:</span>
              <span className="font-mono font-bold text-lg">
                {formatMoney(MOCK.commission.total)}
              </span>
            </div>

            {step === 0 && (
              <div className="flex gap-2">
                <Button className="animate-demo-pulse-ring ring-2 ring-yellow-400">
                  Confirm & Release
                </Button>
                <Button variant="outline">Hold</Button>
              </div>
            )}

            {step >= 1 && (
              <div className="animate-demo-fade-in">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                  CONFIRMED · Payouts released
                </Badge>
                <div className="mt-2 text-xs text-muted-foreground">
                  12 PayoutLedger rows flipped from PENDING → AVAILABLE.
                </div>
                <div className="mt-3 flex justify-center">
                  <AnnotationBubble visible>
                    Now watch the 12-line split fire →
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
