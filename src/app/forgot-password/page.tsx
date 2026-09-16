'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@/components/ui';
import { AuthShell } from '@/components/brand';
import { requestPasswordResetAction } from './actions';
import { CheckCircle2, KeyRound } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await requestPasswordResetAction(email);
    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <AuthShell>
      <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[hsl(var(--gold))]" />
            Forgot your password?
          </CardTitle>
          <CardDescription>
            Enter your account email and we&apos;ll open a reset request with the
            club admin, who will send you a reset link.
          </CardDescription>
        </CardHeader>

        {submitted ? (
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <p>
                Request received. If <span className="font-medium">{email}</span> has
                an account, the club admin has been notified and will send you a
                password reset link shortly.
              </p>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              <Link href="/login" className="text-primary hover:underline">
                Back to sign in
              </Link>
            </p>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending…' : 'Request password reset'}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Remembered it?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </AuthShell>
  );
}
