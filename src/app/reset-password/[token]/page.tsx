import Link from 'next/link';
import { getResetTokenInfo } from '@/lib/services/password-reset';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { AuthShell } from '@/components/brand';
import { ResetForm } from './reset-form';
import { XCircle } from 'lucide-react';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({ params }: PageProps) {
  const { token } = await params;
  const info = await getResetTokenInfo(token);

  return (
    <AuthShell>
      {info ? (
        <ResetForm token={token} userName={info.userName} email={info.email} />
      ) : (
        <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Link invalid or expired
            </CardTitle>
            <CardDescription>
              This password reset link has already been used or has expired.
              Reset links are valid for 24 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/forgot-password">
              <Button className="w-full">Request a new reset link</Button>
            </Link>
            <p className="text-sm text-muted-foreground text-center">
              <Link href="/login" className="text-primary hover:underline">
                Back to sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      )}
    </AuthShell>
  );
}
