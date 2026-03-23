'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { useTypewriter } from '../use-typewriter';
import { AnnotationBubble } from '../components/annotation-bubble';
import { MockHeader } from '../components/mock-header';
import { MOCK } from '../mock-data';

interface ReferrerSearchProps {
  step: number;
}

const fakeProviders = [
  { name: 'BrightSpark Electrical', category: 'Electrical', commission: '8%', zip: '11201' },
  { name: 'TyeNY Software Development', category: 'Software Development', commission: '10%', zip: '11201' },
  { name: 'FastFlow Plumbing', category: 'Plumbing', commission: '$150', zip: '10001' },
];

export function ReferrerSearch({ step }: ReferrerSearchProps) {
  const { displayText, cursor } = useTypewriter('TyeNY', {
    speed: 120,
    startDelay: 800,
    active: step >= 1,
  });

  const searchActive = displayText.length > 0;
  const filtered = searchActive
    ? fakeProviders.filter((p) =>
        p.name.toLowerCase().includes(displayText.toLowerCase())
      )
    : fakeProviders;

  return (
    <div className="w-full">
      <MockHeader role="referrer" />
      <div className="bg-card rounded-b-lg border border-t-0 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Provider Directory</h2>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className={`pl-9 ${step >= 1 ? 'animate-demo-pulse-ring ring-2 ring-yellow-400' : ''}`}
              value={displayText}
              placeholder="Search providers..."
              readOnly
            />
            {cursor && (
              <span className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground animate-pulse" style={{ left: `calc(2.25rem + ${displayText.length}ch)` }} />
            )}
          </div>
          {step >= 1 && step < 2 && (
            <AnnotationBubble visible inline>
              Type to search providers
            </AnnotationBubble>
          )}
        </div>

        <div className="relative grid gap-4">
          {filtered.map((provider) => (
            <Card
              key={provider.name}
              className={`transition-all duration-300 ${
                searchActive && provider.name === MOCK.providerCompany.name
                  ? 'ring-2 ring-gold shadow-md animate-demo-fade-in'
                  : searchActive
                  ? 'opacity-0 h-0 overflow-hidden'
                  : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {provider.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold">{provider.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {provider.zip}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{provider.category}</Badge>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      {provider.commission} Commission
                    </Badge>
                    <Button size="sm">Submit Referral</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {step >= 2 && filtered.length === 1 && (
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 mt-2">
              <div className="flex-1" />
              <AnnotationBubble visible inline>
                Found the right provider!
              </AnnotationBubble>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
