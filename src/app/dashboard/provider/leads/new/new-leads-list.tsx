'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  EmptyState,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { LeadWithCompanies } from '@/lib/types';
import { acceptLeadAction, rejectLeadAction } from './actions';
import { Check, X, Phone, MapPin, User, DollarSign } from 'lucide-react';

interface NewLeadsListProps {
  leads: LeadWithCompanies[];
}

export function NewLeadsList({ leads }: NewLeadsListProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadWithCompanies | null>(null);
  const [estimatedValue, setEstimatedValue] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const openAcceptDialog = (lead: LeadWithCompanies) => {
    setSelectedLead(lead);
    setEstimatedValue('');
    setError('');
    setDialogOpen(true);
  };

  const handleAccept = async () => {
    if (!selectedLead) return;

    const value = parseFloat(estimatedValue);
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid estimated job value');
      return;
    }

    setProcessingId(selectedLead.id);
    setError('');

    const result = await acceptLeadAction(selectedLead.id, value);
    if (result.success) {
      setDialogOpen(false);
      setSelectedLead(null);
      router.refresh();
    } else {
      setError(result.error ?? 'Failed to accept lead');
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
        <CardContent className="p-0">
          <EmptyState
            art="leads"
            title="No new leads right now"
            description="When a referrer sends you a lead it will land here for you to accept or decline."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
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
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3 w-3" />
                  Submitted on {formatDate(lead.createdAt)}
                </div>
                <div className="text-muted-foreground">
                  Commission:{' '}
                  {lead.commissionTypeSnapshot === 'PERCENT'
                    ? `${Number(lead.commissionValueSnapshot)}% of job value`
                    : formatCurrency(Number(lead.commissionValueSnapshot))}
                </div>
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
                onClick={() => openAcceptDialog(lead)}
                disabled={processingId === lead.id}
              >
                <Check className="mr-2 h-4 w-4" />
                Accept
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Lead</DialogTitle>
            <DialogDescription>
              Enter the estimated job value to calculate the referrer&apos;s commission.
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="font-medium">{selectedLead.homeownerName}</p>
                <p className="text-sm text-muted-foreground">{selectedLead.category}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedValue">Estimated Job Value</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="estimatedValue"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(e.target.value)}
                    className="pl-9"
                    disabled={processingId === selectedLead.id}
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                {estimatedValue && parseFloat(estimatedValue) > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Estimated commission:{' '}
                    {selectedLead.commissionTypeSnapshot === 'PERCENT'
                      ? formatCurrency(parseFloat(estimatedValue) * (Number(selectedLead.commissionValueSnapshot) / 100))
                      : formatCurrency(Number(selectedLead.commissionValueSnapshot))}
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={processingId !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAccept}
              disabled={processingId !== null}
            >
              {processingId ? 'Accepting...' : 'Accept Lead'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
