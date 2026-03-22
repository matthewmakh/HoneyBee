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
import type { LeadWithCompaniesNotesAndPriceRequests } from '@/lib/types';
import { markJobCompletedAction } from './actions';
import { LeadNotes } from './lead-notes';
import { PriceChangeRequestButton } from './price-change-request';
import { CheckCircle, Phone, MapPin, User, DollarSign, TrendingUp } from 'lucide-react';

interface AcceptedLeadsListProps {
  leads: LeadWithCompaniesNotesAndPriceRequests[];
}

export function AcceptedLeadsList({ leads }: AcceptedLeadsListProps) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadWithCompaniesNotesAndPriceRequests | null>(null);
  const [jobValue, setJobValue] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const calculateCommission = (jobValue: number, commissionType: string, commissionValue: number) => {
    if (commissionType === 'PERCENT') {
      return jobValue * (commissionValue / 100);
    }
    return commissionValue;
  };

  const handleMarkCompleted = async () => {
    if (!selectedLead) return;

    const value = parseFloat(jobValue);
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid job value');
      return;
    }

    setProcessingId(selectedLead.id);
    setError('');

    const result = await markJobCompletedAction(selectedLead.id, value);

    if (result.success) {
      setDialogOpen(false);
      setSelectedLead(null);
      setJobValue('');
      router.refresh();
    } else {
      setError(result.error ?? 'Failed to mark as completed');
    }

    setProcessingId(null);
  };

  const openDialog = (lead: LeadWithCompaniesNotesAndPriceRequests) => {
    setSelectedLead(lead);
    // Pre-fill with estimated job value if available
    setJobValue(lead.estimatedJobValue ? String(Number(lead.estimatedJobValue)) : '');
    setError('');
    setDialogOpen(true);
  };

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No accepted leads at the moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {leads.map((lead) => {
          const estimatedValue = lead.estimatedJobValue ? Number(lead.estimatedJobValue) : 0;
          const commissionValue = Number(lead.commissionValueSnapshot);
          const estimatedCommission = calculateCommission(estimatedValue, lead.commissionTypeSnapshot, commissionValue);
          const latestPriceRequest = lead.priceChangeRequests?.[0] ?? null;

          return (
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

                {/* Job Value & Commission Info */}
                <div className="rounded-lg bg-muted/50 p-3 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-2">
                    <DollarSign className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Estimated Job Value</p>
                      <p className="text-lg font-semibold">{formatCurrency(estimatedValue)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Estimated Commission</p>
                      <p className="text-lg font-semibold text-primary">{formatCurrency(estimatedCommission)}</p>
                      <p className="text-xs text-muted-foreground">
                        {lead.commissionTypeSnapshot === 'PERCENT'
                          ? `${commissionValue}% of job value`
                          : 'Flat rate'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">Project Description</p>
                  <p className="text-sm text-muted-foreground">{lead.projectDescription}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    Accepted on {formatDate(lead.updatedAt)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <LeadNotes leadId={lead.id} initialNotes={lead.notes} />
                  <PriceChangeRequestButton
                    leadId={lead.id}
                    currentPrice={estimatedValue}
                    commissionType={lead.commissionTypeSnapshot}
                    commissionValue={commissionValue}
                    existingRequest={latestPriceRequest}
                  />
                </div>
                <Button onClick={() => openDialog(lead)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Job Completed
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Job as Completed</DialogTitle>
            <DialogDescription>
              Enter the final job value to calculate the commission.
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="font-medium">{selectedLead.homeownerName}</p>
                <p className="text-sm text-muted-foreground">{selectedLead.category}</p>
                {selectedLead.estimatedJobValue && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Estimated: {formatCurrency(Number(selectedLead.estimatedJobValue))}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobValue">Final Job Value</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="jobValue"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={jobValue}
                    onChange={(e) => setJobValue(e.target.value)}
                    className="pl-9"
                    disabled={processingId === selectedLead.id}
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                {jobValue && parseFloat(jobValue) > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Commission to referrer:{' '}
                    {selectedLead.commissionTypeSnapshot === 'PERCENT'
                      ? formatCurrency(parseFloat(jobValue) * (Number(selectedLead.commissionValueSnapshot) / 100))
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
              onClick={handleMarkCompleted}
              disabled={processingId !== null}
            >
              {processingId ? 'Processing...' : 'Confirm Completion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
