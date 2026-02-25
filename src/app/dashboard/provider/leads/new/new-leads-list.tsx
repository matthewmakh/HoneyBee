'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { LeadWithCompanies } from '@/lib/types';
import { acceptLeadAction, rejectLeadAction } from './actions';
import { Check, X, Phone, MapPin, User } from 'lucide-react';

interface NewLeadsListProps {
  leads: LeadWithCompanies[];
}

export function NewLeadsList({ leads }: NewLeadsListProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (leadId: string) => {
    setProcessingId(leadId);
    const result = await acceptLeadAction(leadId);
    if (result.success) {
      router.refresh();
    }
    setProcessingId(null);
  };

  const handleReject = async (leadId: string) => {
    setProcessingId(leadId);
    const result = await rejectLeadAction(leadId);
    if (result.success) {
      router.refresh();
    }
    setProcessingId(null);
  };

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No new leads at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <Card key={lead.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{lead.homeownerName}</CardTitle>
                <CardDescription>
                  Referred by {lead.referrerCompany.name} ({lead.referrerCompany.memberId})
                </CardDescription>
              </div>
              <Badge variant="secondary">{lead.category}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{lead.homeownerPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{lead.homeownerAddress}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Project Description</p>
              <p className="text-sm text-muted-foreground">{lead.projectDescription}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <User className="h-3 w-3" />
              Submitted on {formatDate(lead.createdAt)}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => handleReject(lead.id)}
              disabled={processingId === lead.id}
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={() => handleAccept(lead.id)}
              disabled={processingId === lead.id}
            >
              <Check className="mr-2 h-4 w-4" />
              Accept
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
