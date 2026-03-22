'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useTypewriter } from '../use-typewriter';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MockHeader } from '../components/mock-header';
import { MOCK, formatMoney } from '../mock-data';

interface ProviderAcceptProps {
  step: number;
}

export function ProviderAccept({ step }: ProviderAcceptProps) {
  const jobValue = useTypewriter('25,000', { speed: 80, active: step >= 1 });

  return (
    <div className="w-full">
      <MockHeader role="provider" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        {step < 3 ? (
          <div className="relative">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-lg">Accept Lead</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{MOCK.homeowner.name}</span>
                  <Badge variant="secondary">{MOCK.category}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Estimated Job Value</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      value={jobValue.displayText}
                      readOnly
                      className={`pl-7 ${step === 1 ? 'ring-2 ring-yellow-400 animate-demo-pulse-ring' : ''}`}
                    />
                    {jobValue.cursor && step === 1 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground animate-pulse" />
                    )}
                  </div>
                </div>

                {step >= 2 && (
                  <div className="bg-muted/50 rounded-lg p-3 animate-demo-fade-in">
                    <div className="text-sm text-muted-foreground">Estimated referral fee</div>
                    <div className="text-lg font-semibold text-emerald-600">
                      {formatMoney(MOCK.estimatedJobValue * MOCK.commission.value / 100)} ({MOCK.commission.value}%)
                    </div>
                  </div>
                )}

                <Button
                  className={`w-full ${step === 2 ? 'animate-demo-scale-click' : ''}`}
                >
                  Accept Lead
                </Button>
              </CardContent>
            </Card>

            <AnnotationBubble position="bottom" visible={step >= 1}>
              Provider reviews details and accepts with an estimate
            </AnnotationBubble>
          </div>
        ) : (
          <div className="relative">
            <Card className="max-w-md mx-auto animate-demo-scale-up text-center">
              <CardContent className="pt-8 pb-8">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold">Lead Accepted!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Estimated value: {formatMoney(MOCK.estimatedJobValue)}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
