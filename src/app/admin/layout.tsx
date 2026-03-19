import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { getInitials } from '@/lib/utils';
import { LayoutDashboard, Clock, Building2, UserCheck, Wallet } from 'lucide-react';
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

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/pending', label: 'Pending Deals', icon: Clock },
    {
      href: '/admin/applications',
      label: 'Applications',
      icon: UserCheck,
      badge: pendingApps.length > 0 ? pendingApps.length : null,
    },
    { href: '/admin/companies', label: 'Companies', icon: Building2 },
    {
      href: '/admin/withdrawals',
      label: 'Withdrawals',
      icon: Wallet,
      badge: pendingWithdrawals.length > 0 ? pendingWithdrawals.length : null,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">HB</span>
              </div>
              <span className="font-semibold">Admin</span>
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
              <div className="md:hidden">
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="gap-2 justify-between">
                      <span className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </div>
              <DropdownMenuItem asChild>
                <form
                  action={async () => {
                    'use server';
                    await signOut({ redirectTo: '/login' });
                  }}
                  className="w-full"
                >
                  <button type="submit" className="w-full text-left">
                    Sign out
                  </button>
                </form>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
