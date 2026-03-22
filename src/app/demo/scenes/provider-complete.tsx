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

interface ProviderCompleteProps {
  step: number;
}

export function ProviderComplete({ step }: ProviderCompleteProps) {
  const finalValue = useTypewriter('28,500', { speed: 80, active: step >= 1 });

  return (
    <div className="w-full">
      <MockHeader role="provider" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Accepted Leads</h2>
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{MOCK.homeowner.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">{MOCK.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      Est. {formatMoney(MOCK.estimatedJobValue)}
                    </span>
                  </div>
                </div>
                <Button className="animate-demo-pulse-ring ring-2 ring-yellow-400">
                  Mark Job Completed
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step >= 1 && step < 3 && (
          <div className="relative">
            <Card className="max-w-md mx-auto animate-demo-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Mark Job Completed</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {MOCK.homeowner.name} &bull; {MOCK.category}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Final Job Value</Label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <Input
                        value={finalValue.displayText}
                        readOnly
                        className={`pl-7 ${step === 1 ? 'ring-2 ring-yellow-400 animate-demo-pulse-ring' : ''}`}
                      />
                      {finalValue.cursor && step === 1 && (
                        <span className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground animate-pulse" style={{ left: `calc(1.75rem + ${finalValue.displayText.length}ch)` }} />
                      )}
                    </div>
                    {step === 1 && (
                      <AnnotationBubble visible inline>
                        Enter final job value
                      </AnnotationBubble>
                    )}
                  </div>
                </div>

                {step >= 2 && (
                  <div className="bg-muted/50 rounded-lg p-3 animate-demo-fade-in">
                    <div className="text-sm text-muted-foreground">Calculated commission</div>
                    <div className="text-lg font-semibold text-emerald-600">
                      {formatMoney(MOCK.calculatedCommission)} ({MOCK.commission.value}%)
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button
                    className={`flex-1 ${step === 2 ? 'animate-demo-scale-click' : ''}`}
                  >
                    Confirm Completion
                  </Button>
                  {step === 2 && (
                    <AnnotationBubble visible inline>
                      Confirm the completed job
                    </AnnotationBubble>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step >= 3 && (
          <div className="relative">
            <Card className="max-w-md mx-auto animate-demo-scale-up text-center">
              <CardContent className="pt-8 pb-8">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold">Job Completed!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Awaiting admin confirmation
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
