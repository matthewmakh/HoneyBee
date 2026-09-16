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
import { resetPasswordAction } from './actions';
import { CheckCircle2, KeyRound } from 'lucide-react';

interface Props {
  token: string;
  userName: string;
  email: string;
}

export function ResetForm({ token, userName, email }: Props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const result = await resetPasswordAction(token, password, confirmPassword);
    setIsLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Could not reset password');
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-card">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            Password updated
          </CardTitle>
          <CardDescription>
            Your new password is set. Sign in with it now.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button className="w-full">Go to sign in</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-[hsl(var(--gold))]" />
          Choose a new password
        </CardTitle>
        <CardDescription>
          Resetting the password for <span className="font-medium">{userName}</span>{' '}
          ({email}).
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Saving…' : 'Set new password'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
