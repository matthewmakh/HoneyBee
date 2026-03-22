'use client';

import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Textarea,
  Badge,
} from '@/components/ui';
import { DollarSign, Edit3, Loader2 } from 'lucide-react';
import { requestPriceChangeAction } from './actions';
import { formatCurrency } from '@/lib/utils';
import type { PriceChangeRequest } from '@/lib/types';

interface PriceChangeRequestProps {
  leadId: string;
  currentPrice: number;
  commissionType: string;
  commissionValue: number;
  existingRequest?: PriceChangeRequest | null;
}

export function PriceChangeRequestButton({
  leadId,
  currentPrice,
  commissionType,
  commissionValue,
  existingRequest,
}: PriceChangeRequestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [requestedPrice, setRequestedPrice] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isSettingInitialPrice = currentPrice === 0;

  const handleSubmit = async () => {
    const price = parseFloat(requestedPrice);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }

    // Reason is required for price changes, optional for initial setting
    if (!isSettingInitialPrice && !reason.trim()) {
      setError('Please provide a reason for the price change');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await requestPriceChangeAction(leadId, price, reason || 'Initial job value');

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setRequestedPrice('');
        setReason('');
        // Refresh the page to show updated value
        if (isSettingInitialPrice) {
          window.location.reload();
        }
      }, 1500);
    } else {
      setError(result.error ?? 'Failed to submit request');
    }

    setIsSubmitting(false);
  };

  const calculateCommission = (jobValue: number) => {
    if (commissionType === 'PERCENT') {
      return jobValue * (commissionValue / 100);
    }
    return commissionValue;
  };

  // If there's already a pending request, show its status
  if (existingRequest && existingRequest.status === 'PENDING') {
    return (
      <Badge variant="outline" className="gap-1">
        <Edit3 className="h-3 w-3" />
        Price Change Pending
      </Badge>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit3 className="h-4 w-4" />
          {isSettingInitialPrice ? 'Set Job Value' : 'Request Price Change'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isSettingInitialPrice ? 'Set Estimated Job Value' : 'Request Price Change'}
          </DialogTitle>
          <DialogDescription>
            {isSettingInitialPrice 
              ? 'Enter the estimated job value for this lead. This will be set immediately.'
              : 'Submit a request to change the estimated job value. An admin will review and approve or reject your request.'
            }
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <p className="text-green-600 font-medium">
              {isSettingInitialPrice ? 'Job value set successfully!' : 'Request submitted successfully!'}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              {isSettingInitialPrice 
                ? 'The page will refresh to show the updated value.'
                : 'An admin will review your request.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {!isSettingInitialPrice && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Price</span>
                  <span className="font-semibold">{formatCurrency(currentPrice)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">Current Commission</span>
                  <span className="text-sm">{formatCurrency(calculateCommission(currentPrice))}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="requestedPrice">
                {isSettingInitialPrice ? 'Estimated Job Value' : 'New Estimated Job Value'}
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="requestedPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={requestedPrice}
                  onChange={(e) => setRequestedPrice(e.target.value)}
                  className="pl-9"
                  disabled={isSubmitting}
                />
              </div>
              {requestedPrice && parseFloat(requestedPrice) > 0 && (
                <p className="text-sm text-muted-foreground">
                  New commission: {formatCurrency(calculateCommission(parseFloat(requestedPrice)))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">
                {isSettingInitialPrice ? 'Notes (optional)' : 'Reason for Change'}
              </Label>
              <Textarea
                id="reason"
                placeholder={isSettingInitialPrice 
                  ? "Add any notes about the job value..."
                  : "Explain why the price needs to be changed..."
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                disabled={isSubmitting}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}

        {!success && (
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isSettingInitialPrice ? 'Setting...' : 'Submitting...'}
                </>
              ) : (
                isSettingInitialPrice ? 'Set Value' : 'Submit Request'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
