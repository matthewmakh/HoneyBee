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
  Input,
  Label,
  Textarea,
} from '@/components/ui';
import { requestWithdrawalAction } from './actions';
import { formatCurrency } from '@/lib/utils';
import { DollarSign } from 'lucide-react';

interface WithdrawalDialogProps {
  cashBalance: number;
}

export function WithdrawalDialog({ cashBalance }: WithdrawalDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const amountNum = parseFloat(amount);

    if (!amountNum || amountNum <= 0) {
      setError('Enter a valid amount');
      return;
    }

    if (amountNum > cashBalance) {
      setError(`Amount exceeds your cash balance of ${formatCurrency(cashBalance)}`);
      return;
    }

    setIsLoading(true);
    const result = await requestWithdrawalAction(amountNum, notes || undefined);
    setIsLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Failed to submit request');
      return;
    }

    setSuccess(true);
  }

  function handleClose() {
    setOpen(false);
    setAmount('');
    setNotes('');
    setError('');
    setSuccess(false);
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} disabled={cashBalance <= 0}>
        <DollarSign className="h-4 w-4 mr-2" />
        Request Withdrawal
      </Button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Cash Withdrawal</DialogTitle>
            <DialogDescription>
              Available balance: <span className="font-semibold text-foreground">{formatCurrency(cashBalance)}</span>
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <div className="py-4 text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium">Request submitted!</p>
              <p className="text-sm text-muted-foreground">
                Your withdrawal request is pending admin review.
              </p>
              <Button onClick={handleClose} className="mt-2">Done</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="withdrawAmount">Amount ($)</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  step="0.01"
                  min="1"
                  max={cashBalance}
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawNotes">Notes (optional)</Label>
                <Textarea
                  id="withdrawNotes"
                  placeholder="Payment instructions, preferred method, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
