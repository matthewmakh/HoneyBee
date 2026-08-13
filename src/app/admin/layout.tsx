import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { SignOutButton } from '@/components/sign-out-button';
import { LogoMark } from '@/components/brand';
import { getInitials } from '@/lib/utils';
import {
  LayoutDashboard,
  Clock,
  Building2,
  UserCheck,
  Wallet,
  Users,
  Percent,
  Coins,
} from 'lucide-react';
import { getPendingProviderApplications } from '@/lib/services/companies';
import { getPendingWithdrawalRequests } from '@/lib/services/finance';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const { user } = session;

  const [pendingApps, pendingWithdrawals] = await Promise.all([
    getPendingProviderApplications(),
    getPendingWithdrawalRequests(),
  ]);

  // Companies (suspend/delete), Team (who is an admin) and Plan (payout
  // economics) are overarching calls reserved for the super admin.
  const SUPERADMIN_ONLY = ['/admin/companies', '/admin/team', '/admin/commission-plan'];
  const isSuperAdmin = user.role === 'SUPERADMIN';

  const allNavItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/pending', label: 'Pending Deals', icon: Clock },
    {
      href: '/admin/applications',
      label: 'Applications',
      icon: UserCheck,
      badge: pendingApps.length > 0 ? pendingApps.length : null,
    },
    { href: '/admin/companies', label: 'Companies', icon: Building2 },
    { href: '/admin/team', label: 'Team', icon: Users },
    { href: '/admin/commission-plan', label: 'Plan', icon: Percent },
    { href: '/admin/payouts', label: 'Payouts', icon: Coins },
    {
      href: '/admin/withdrawals',
      label: 'Withdrawals',
      icon: Wallet,
      badge: pendingWithdrawals.length > 0 ? pendingWithdrawals.length : null,
    },
  ];

  const navItems = isSuperAdmin
    ? allNavItems
    : allNavItems.filter((item) => !SUPERADMIN_ONLY.includes(item.href));

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/admin" className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8" />
              <span className="font-semibold tracking-tight">
                Honeybee
                <span className="ml-1.5 rounded bg-[hsl(var(--gold))]/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[hsl(var(--gold-foreground))]">
                  Admin
                </span>
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" size="sm" className="gap-2 relative">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    Super Admin
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="flex items-center justify-around h-16 px-1">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-muted-foreground hover:text-foreground transition-colors relative"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
              {item.badge && (
                <span className="absolute top-1 right-0 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
