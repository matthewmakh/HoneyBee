import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { getInitials } from '@/lib/utils';
import { Wallet, Clock } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { user } = session;
  const { canUseReferrerPortal, canUseProviderPortal, providerApplicationPending } = user.company;
  const showBothPortals = canUseReferrerPortal && canUseProviderPortal;

  return (
    <div className="min-h-screen bg-background">
      {/* Pending provider application banner */}
      {canUseReferrerPortal && providerApplicationPending && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <p className="text-sm text-amber-800">
            <Clock className="inline h-3.5 w-3.5 mr-1 align-middle" />
            Your provider application is <strong>pending admin review</strong>. You&apos;ll receive access once approved.
          </p>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">HB</span>
              </div>
              <span className="font-semibold hidden sm:inline-block">Honeybee</span>
            </Link>

            {/* Portal Tabs */}
            {showBothPortals && (
              <Tabs defaultValue="referrer" className="hidden md:block">
                <TabsList>
                  <TabsTrigger value="referrer" asChild>
                    <Link href="/dashboard/referrer">Referrer</Link>
                  </TabsTrigger>
                  <TabsTrigger value="provider" asChild>
                    <Link href="/dashboard/provider">Provider</Link>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}

            {/* Wallet link for referrers */}
            {canUseReferrerPortal && (
              <Link href="/dashboard/referrer/wallet" className="hidden md:block">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <Wallet className="h-4 w-4" />
                  Wallet
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline-block">
              {user.company.name}
              <span className="ml-1 text-xs">({user.company.memberId})</span>
            </span>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.company.logoUrl ?? undefined} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {showBothPortals && (
                  <>
                    <DropdownMenuItem asChild className="md:hidden">
                      <Link href="/dashboard/referrer">Referrer Portal</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="md:hidden">
                      <Link href="/dashboard/provider">Provider Portal</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="md:hidden" />
                  </>
                )}
                {canUseReferrerPortal && (
                  <DropdownMenuItem asChild className="md:hidden">
                    <Link href="/dashboard/referrer/wallet" className="gap-2">
                      <Wallet className="h-4 w-4" />
                      Wallet
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="p-0"
                >
                  <form
                    action={async () => {
                      'use server';
                      await signOut({ redirectTo: '/login' });
                    }}
                    className="w-full"
                  >
                    <button type="submit" className="w-full text-left px-2 py-1.5">
                      Sign out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
