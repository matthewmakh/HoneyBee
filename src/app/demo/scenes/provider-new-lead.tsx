'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, MapPin, Calendar } from 'lucide-react';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MockHeader } from '../components/mock-header';
import { MOCK } from '../mock-data';

interface ProviderNewLeadProps {
  step: number;
}

export function ProviderNewLead({ step }: ProviderNewLeadProps) {
  return (
    <div className="w-full">
      <MockHeader role="provider" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">New Leads</h2>
          {step >= 1 && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
              <Badge className="bg-red-100 text-red-800 border-red-200 animate-demo-scale-up">
                1 New
              </Badge>
              {step === 1 && (
                <AnnotationBubble visible inline>
                  New lead notification!
                </AnnotationBubble>
              )}
            </div>
          )}
        </div>

        {step >= 1 && (
          <div className="relative">
            <Card className="animate-demo-slide-in-right border-l-4 border-l-gold">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold">{MOCK.homeowner.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Referred by <span className="font-medium">{MOCK.referrerCompany.name}</span>
                    </p>
                  </div>
                  <Badge variant="secondary">{MOCK.category}</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    {MOCK.homeowner.phone}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Brooklyn, NY
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Just now
                  </div>
                </div>

                <p className="text-sm mb-4">{MOCK.description}</p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Commission: {MOCK.commission.value}%
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Reject
                    </Button>
                    <Button size="sm">Accept Lead</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {step >= 2 && (
              <div className="flex items-center gap-3 mt-2 justify-end">
                <AnnotationBubble visible inline>
                  Providers receive referrals instantly
                </AnnotationBubble>
              </div>
            )}
          </div>
        )}

        {step === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Waiting for new leads...
          </div>
        )}
      </div>
    </div>
  );
}
