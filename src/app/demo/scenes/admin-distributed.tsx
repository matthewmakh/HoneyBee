'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MockHeader } from '../components/mock-header';
import { MOCK, formatMoney } from '../mock-data';
import { useCountUp } from '../use-count-up';

interface AdminDistributedProps {
  step: number;
}

export function AdminDistributed({ step }: AdminDistributedProps) {
  const cashCount = useCountUp(MOCK.cashSplit, { active: step >= 1, duration: 1000 });
  const benefitsCount = useCountUp(MOCK.benefitsSplit, { active: step >= 2, duration: 1000 });
  const platformCount = useCountUp(MOCK.platformSplit, { active: step >= 3, duration: 800 });

  return (
    <div className="w-full">
      <MockHeader role="admin" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        <div className="relative">
          <Card className="max-w-lg mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Payment Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">
                Total Commission: {formatMoney(MOCK.calculatedCommission)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {step >= 1 && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center justify-between p-4 bg-emerald-50 rounded-lg border border-emerald-200 animate-demo-count-up">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💵</span>
                      <div>
                        <div className="font-semibold text-emerald-800">Cash to Referrer</div>
                        <div className="text-xs text-emerald-600">50% of commission</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-emerald-700">
                      {formatMoney(cashCount)}
                    </div>
                  </div>
                  {step === 1 && (
                    <AnnotationBubble visible inline>
                      Cash payout
                    </AnnotationBubble>
                  )}
                </div>
              )}

              {step >= 2 && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 animate-demo-count-up">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎁</span>
                      <div>
                        <div className="font-semibold text-blue-800">Benefits to Referrer</div>
                        <div className="text-xs text-blue-600">40% of commission</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-blue-700">
                      {formatMoney(benefitsCount)}
                    </div>
                  </div>
                  {step === 2 && (
                    <AnnotationBubble visible inline>
                      Benefits credits
                    </AnnotationBubble>
                  )}
                </div>
              )}

              {step >= 3 && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200 animate-demo-count-up">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🏢</span>
                      <div>
                        <div className="font-semibold text-purple-800">Platform Revenue</div>
                        <div className="text-xs text-purple-600">10% of commission</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-purple-700">
                      {formatMoney(platformCount)}
                    </div>
                  </div>
                  <AnnotationBubble visible inline>
                    Auto-split complete!
                  </AnnotationBubble>
                </div>
              )}

              {step === 0 && (
                <div className="text-center py-8 text-muted-foreground animate-pulse">
                  Distributing payments...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
