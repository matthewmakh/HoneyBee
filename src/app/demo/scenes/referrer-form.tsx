'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTypewriter } from '../use-typewriter';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MockHeader } from '../components/mock-header';
import { MOCK } from '../mock-data';

interface ReferrerFormProps {
  step: number;
}

export function ReferrerForm({ step }: ReferrerFormProps) {
  const name = useTypewriter(MOCK.homeowner.name, { speed: 60, active: step >= 0 });
  const phone = useTypewriter(MOCK.homeowner.phone, { speed: 50, active: step >= 1 });
  const address = useTypewriter(MOCK.homeowner.address, { speed: 40, active: step >= 2 });
  const desc = useTypewriter(MOCK.description, { speed: 30, active: step >= 4 });

  const activeField = step;

  return (
    <div className="w-full">
      <MockHeader role="referrer" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        <Card className="mb-4 bg-muted/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                T
              </div>
              <div>
                <h3 className="font-semibold">{MOCK.providerCompany.name}</h3>
                <p className="text-xs text-muted-foreground">{MOCK.providerCompany.memberId}</p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
              {MOCK.commission.value}% Commission
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit a Referral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Label>Homeowner Name</Label>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={name.displayText}
                    readOnly
                    className={`${activeField === 0 ? 'ring-2 ring-yellow-400 animate-demo-pulse-ring' : ''}`}
                  />
                  {name.cursor && activeField === 0 && (
                    <span className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground animate-pulse" style={{ left: `calc(0.75rem + ${name.displayText.length}ch)` }} />
                  )}
                </div>
                {activeField === 0 && (
                  <AnnotationBubble visible inline>
                    Enter the client&apos;s name
                  </AnnotationBubble>
                )}
              </div>
            </div>

            <div className="relative">
              <Label>Phone Number</Label>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={phone.displayText}
                    readOnly
                    className={`${activeField === 1 ? 'ring-2 ring-yellow-400 animate-demo-pulse-ring' : ''}`}
                  />
                  {phone.cursor && activeField === 1 && (
                    <span className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground animate-pulse" style={{ left: `calc(0.75rem + ${phone.displayText.length}ch)` }} />
                  )}
                </div>
                {activeField === 1 && (
                  <AnnotationBubble visible inline>
                    Add their phone number
                  </AnnotationBubble>
                )}
              </div>
            </div>

            <div className="relative">
              <Label>Address</Label>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <Input
                    value={address.displayText}
                    readOnly
                    className={`${activeField === 2 ? 'ring-2 ring-yellow-400 animate-demo-pulse-ring' : ''}`}
                  />
                  {address.cursor && activeField === 2 && (
                    <span className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground animate-pulse" style={{ left: `calc(0.75rem + ${address.displayText.length}ch)` }} />
                  )}
                </div>
                {activeField === 2 && (
                  <AnnotationBubble visible inline>
                    Enter the service address
                  </AnnotationBubble>
                )}
              </div>
            </div>

            <div className="relative">
              <Label>Service Category</Label>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
                <div
                  className={`flex-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ${
                    activeField === 3 ? 'ring-2 ring-yellow-400 animate-demo-pulse-ring' : ''
                  }`}
                >
                  {step >= 3 ? (
                    <span className="animate-demo-fade-in">{MOCK.category}</span>
                  ) : (
                    <span className="text-muted-foreground">Select a category...</span>
                  )}
                </div>
                {activeField === 3 && (
                  <AnnotationBubble visible inline>
                    Select the service category
                  </AnnotationBubble>
                )}
              </div>
            </div>

            <div className="relative">
              <Label>Project Description</Label>
              <div className="flex flex-wrap sm:flex-nowrap items-start gap-2 sm:gap-3">
                <div className="flex-1 relative">
                  <Textarea
                    value={desc.displayText}
                    readOnly
                    rows={3}
                    className={`${activeField === 4 ? 'ring-2 ring-yellow-400 animate-demo-pulse-ring' : ''}`}
                  />
                  {desc.cursor && activeField === 4 && (
                    <span className="absolute top-3 w-0.5 h-5 bg-foreground animate-pulse" style={{ left: `calc(0.75rem + ${(desc.displayText.length % 60)}ch)` }} />
                  )}
                </div>
                {activeField === 4 && (
                  <AnnotationBubble visible inline>
                    Describe the project details
                  </AnnotationBubble>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline">Cancel</Button>
              <Button
                className={step >= 5 ? 'ring-2 ring-yellow-400 animate-demo-pulse-ring' : ''}
              >
                Submit Referral
              </Button>
              {step >= 5 && (
                <AnnotationBubble visible inline>
                  Ready to submit!
                </AnnotationBubble>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
