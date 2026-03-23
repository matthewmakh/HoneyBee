'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Gift } from 'lucide-react';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MockHeader } from '../components/mock-header';
import { MOCK, formatMoney } from '../mock-data';
import { useCountUp } from '../use-count-up';

interface ReferrerWalletProps {
  step: number;
}

export function ReferrerWallet({ step }: ReferrerWalletProps) {
  const cashCount = useCountUp(MOCK.cashSplit, { active: step >= 0, duration: 1200 });
  const benefitsCount = useCountUp(MOCK.benefitsSplit, { active: step >= 0, duration: 1200 });

  return (
    <div className="w-full">
      <MockHeader role="referrer" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">My Wallet</h2>
          <Button variant="outline" size="sm">
            Request Withdrawal
          </Button>
        </div>

        <div>
          <div className="flex items-start gap-3 mb-6">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-emerald-50 border-emerald-200 animate-demo-fade-in">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">Cash Balance</span>
                  </div>
                  <div className="text-3xl font-bold text-emerald-700">
                    {formatMoney(cashCount)}
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">Available for withdrawal</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200 animate-demo-fade-in">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Benefits Balance</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-700">
                    {formatMoney(benefitsCount)}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Benefits marketplace credits</p>
                </CardContent>
              </Card>
            </div>
            {step === 0 && (
              <div className="pt-4">
                <AnnotationBubble visible inline>
                  Balances update in real-time
                </AnnotationBubble>
              </div>
            )}
          </div>

          {step >= 1 && (
            <div className="flex flex-wrap sm:flex-nowrap items-start gap-2 sm:gap-3">
              <Card className="flex-1 animate-demo-slide-in-right">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y">
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {MOCK.homeowner.name} &bull; {MOCK.category}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            via {MOCK.providerCompany.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-emerald-600">
                          +{formatMoney(MOCK.cashSplit)}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Cash
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Gift className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">
                            {MOCK.homeowner.name} &bull; {MOCK.category}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            via {MOCK.providerCompany.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-blue-600">
                          +{formatMoney(MOCK.benefitsSplit)}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Benefits
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {step >= 1 && (
                <div className="pt-4">
                  <AnnotationBubble visible inline>
                    Track earnings &amp; withdrawals
                  </AnnotationBubble>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
