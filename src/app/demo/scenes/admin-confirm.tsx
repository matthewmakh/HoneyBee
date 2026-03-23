'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MockHeader } from '../components/mock-header';
import { MOCK, formatMoney } from '../mock-data';

interface AdminConfirmProps {
  step: number;
}

export function AdminConfirm({ step }: AdminConfirmProps) {
  return (
    <div className="w-full">
      <MockHeader role="admin" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Pending Deal Confirmations</h2>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">1 Pending</Badge>
        </div>

        {step < 2 ? (
          <div className="relative">
            <Card className="animate-demo-fade-in">
              <CardContent className="p-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Referrer</div>
                    <div className="font-medium">{MOCK.referrerCompany.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Provider</div>
                    <div className="font-medium">{MOCK.providerCompany.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Job Value</div>
                    <div className="font-medium">{formatMoney(MOCK.finalJobValue)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Commission</div>
                    <div className="font-medium text-emerald-600">
                      {formatMoney(MOCK.calculatedCommission)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{MOCK.homeowner.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">{MOCK.category}</span>
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <Button variant="outline" size="sm">
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className={step === 1 ? 'animate-demo-scale-click' : ''}
                    >
                      Confirm Deal
                    </Button>
                    {step >= 1 && (
                      <AnnotationBubble visible inline>
                        Admin confirms the deal
                      </AnnotationBubble>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="max-w-md mx-auto animate-demo-scale-up text-center">
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold">Deal Confirmed!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Processing payment distribution...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
