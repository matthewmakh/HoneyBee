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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { SignOutButton } from '@/components/sign-out-button';
import { getInitials } from '@/lib/utils';
import {
  Wallet,
  Clock,
  Users,
  Briefcase,
  Send,
  Settings,
  Home,
  Network,
  Upload,
} from 'lucide-react';

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
    <div className="min-h-screen bg-background pb-16 md:pb-0">
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
        <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">HB</span>
              </div>
              <span className="font-semibold hidden sm:inline-block">Honeybee</span>
            </Link>

            {/* Portal Tabs - Desktop */}
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

            {/* Wallet + Team links for referrers - Desktop */}
            {canUseReferrerPortal && (
              <div className="hidden md:flex items-center gap-1">
                <Link href="/dashboard/referrer/wallet">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                    <Wallet className="h-4 w-4" />
                    Wallet
                  </Button>
                </Link>
                <Link href="/dashboard/referrer/team">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                    <Network className="h-4 w-4" />
                    Team
                  </Button>
                </Link>
              </div>
            )}

            {/* Pitch + Wallet links for providers - Desktop */}
            {canUseProviderPortal && (
              <div className="hidden md:flex items-center gap-1">
                <Link href="/dashboard/provider/pitch">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                    <Upload className="h-4 w-4" />
                    Pitch
                  </Button>
                </Link>
                <Link href="/dashboard/provider/wallet">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                    <Wallet className="h-4 w-4" />
                    Wallet
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
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
                    <p className="text-xs leading-none text-muted-foreground md:hidden">
                      {user.company.name} ({user.company.memberId})
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <SignOutButton
                  signOutAction={async () => {
                    'use server';
                    await signOut({ redirectTo: '/login' });
                  }}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Portal Switcher - Shows when user has access to both portals */}
      {showBothPortals && (
        <div className="md:hidden sticky top-14 z-40 bg-background border-b">
          <div className="container mx-auto px-4 py-2">
            <div className="flex gap-2">
              <Link href="/dashboard/referrer" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                  <Send className="h-3.5 w-3.5" />
                  Referrer Portal
                </Button>
              </Link>
              <Link href="/dashboard/provider" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                  <Briefcase className="h-3.5 w-3.5" />
                  Provider Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="flex items-center justify-around h-16 px-2">
          <Link 
            href="/dashboard" 
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Link>
          
          {canUseReferrerPortal && (
            <>
              <Link
                href="/dashboard/referrer/providers"
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Users className="h-5 w-5" />
                <span className="text-[10px]">Providers</span>
              </Link>
              <Link
                href="/dashboard/referrer/team"
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Network className="h-5 w-5" />
                <span className="text-[10px]">Team</span>
              </Link>
              <Link
                href="/dashboard/referrer/wallet"
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Wallet className="h-5 w-5" />
                <span className="text-[10px]">Wallet</span>
              </Link>
            </>
          )}

          {canUseProviderPortal && (
            <>
              <Link
                href="/dashboard/provider/pitch"
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Upload className="h-5 w-5" />
                <span className="text-[10px]">Pitch</span>
              </Link>
              <Link
                href="/dashboard/provider/wallet"
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Wallet className="h-5 w-5" />
                <span className="text-[10px]">Wallet</span>
              </Link>
              <Link
                href="/dashboard/provider/settings"
                className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span className="text-[10px]">Settings</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
