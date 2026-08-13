import Image from 'next/image';
import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { Clock, Mail, LogOut } from 'lucide-react';

export default async function PendingApprovalPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // If they got approved since last login, send them to dashboard
  if (session.user.company.canUseReferrerPortal || session.user.company.canUseProviderPortal) {
    redirect('/dashboard');
  }

  const { user } = session;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md overflow-hidden">
        {/* A look at the work waiting on the other side of approval */}
        <div className="relative h-36 w-full">
          <Image
            src="/images/provider-cover-default.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 100vw, 448px"
            className="object-cover"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
        </div>
        <CardHeader className="space-y-1 text-center">
          <div className="-mt-12 flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-amber-100 ring-4 ring-card flex items-center justify-center">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Application Under Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <p className="text-muted-foreground">
            Hi <strong>{user.name}</strong>, your provider application for{' '}
            <strong>{user.company.name}</strong> is being reviewed by our admin team.
          </p>

          <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-left">
            <p className="text-sm font-medium">What happens next:</p>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">1.</span>
                Our team reviews your application (usually within 1 business day)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">2.</span>
                Once approved, you&apos;ll be able to log back in and access your provider portal
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">3.</span>
                Set up your profile and start receiving referrals
              </li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Mail className="h-3 w-3" />
            Member ID: <strong>{user.company.memberId}</strong>
          </p>

          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <Button type="submit" variant="outline" className="w-full gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
