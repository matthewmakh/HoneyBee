'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MockHeader } from '../components/mock-header';
import { MOCK } from '../mock-data';

interface ReferrerSuccessProps {
  step: number;
}

export function ReferrerSuccess({ step }: ReferrerSuccessProps) {
  return (
    <div className="w-full">
      <MockHeader role="referrer" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        {step === 0 && (
          <div className="flex justify-center py-12">
            <Button className="animate-demo-scale-click">Submit Referral</Button>
          </div>
        )}

        {step >= 1 && (
          <div className="flex flex-wrap sm:flex-nowrap items-start gap-2 sm:gap-3 justify-center">
            <Card className="max-w-md animate-demo-scale-up">
              <CardContent className="pt-8 pb-8 text-center">
                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Lead Submitted Successfully!
                </h2>
                <p className="text-muted-foreground">
                  Your referral has been sent to{' '}
                  <span className="font-semibold text-foreground">
                    {MOCK.providerCompany.name}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Commission rate: {MOCK.commission.value}% locked in at submission
                </p>
              </CardContent>
            </Card>
            <div className="pt-8">
              <AnnotationBubble visible inline>
                The lead is now in the provider&apos;s queue
              </AnnotationBubble>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
