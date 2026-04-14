import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui';
import {
  Upload,
  Presentation,
  FileText,
  TrendingUp,
  Users,
  Shield,
  LucideIcon,
} from 'lucide-react';

interface Cta {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  authedHref?: string;
  roles?: Array<'REFERRER' | 'PROVIDER' | 'ADMIN' | 'ALL'>;
}

const CTAS: Cta[] = [
  {
    key: 'pitch',
    title: 'A-Team: Upload Pitch',
    description:
      'Upload 1–4 photos, a 200-word sales pitch, and do/don\'t tips so our Bee Team can sell for you.',
    icon: Upload,
    href: '/register?provider=true',
    authedHref: '/dashboard/provider/pitch',
    roles: ['PROVIDER', 'ADMIN'],
  },
  {
    key: 'present',
    title: 'Bee Team: Present to Customer',
    description:
      'Flip into presentation mode with photos and pitch — the commissions stay hidden from the homeowner.',
    icon: Presentation,
    href: '/register',
    authedHref: '/dashboard/referrer/providers',
    roles: ['REFERRER', 'ADMIN'],
  },
  {
    key: 'refer',
    title: 'Submit a Referral',
    description:
      'Gather homeowner info, attach project photos, and hand the lead off to the right provider.',
    icon: FileText,
    href: '/register',
    authedHref: '/dashboard/referrer/providers',
    roles: ['REFERRER', 'ADMIN'],
  },
  {
    key: 'provider-progress',
    title: 'A-Team Progress',
    description:
      'Track incoming leads, close-rate, ROI, and what you owe the club on each completed job.',
    icon: TrendingUp,
    href: '/register?provider=true',
    authedHref: '/dashboard/provider',
    roles: ['PROVIDER', 'ADMIN'],
  },
  {
    key: 'referrer-progress',
    title: 'Bee Team Progress',
    description:
      'See your 12-line commission breakdown, your upline/downline, and lifetime earnings.',
    icon: Users,
    href: '/register',
    authedHref: '/dashboard/referrer',
    roles: ['REFERRER', 'ADMIN'],
  },
  {
    key: 'admin',
    title: 'Club Admin',
    description:
      'Approve applications, configure the 12-line payout plan, and process weekly payouts.',
    icon: Shield,
    href: '/login',
    authedHref: '/admin',
    roles: ['ADMIN'],
  },
];

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  const userRole: 'REFERRER' | 'PROVIDER' | 'ADMIN' | 'GUEST' = !user
    ? 'GUEST'
    : user.role === 'SUPERADMIN'
    ? 'ADMIN'
    : user.company?.canUseProviderPortal
    ? 'PROVIDER'
    : 'REFERRER';

  const visibleCtas = CTAS.filter((c) => {
    if (userRole === 'GUEST' || userRole === 'ADMIN') return true;
    return c.roles?.includes(userRole) ?? true;
  });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">HB</span>
            </div>
            <span className="font-semibold text-lg">Honeybee Referral Club</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link
                href={
                  userRole === 'ADMIN'
                    ? '/admin'
                    : userRole === 'PROVIDER'
                    ? '/dashboard/provider'
                    : '/dashboard'
                }
              >
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              The Bee Club
              <span className="block text-[hsl(var(--gold))]">
                Multi-Level Referral Network
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              A-Team providers upload pitches. Bee Team referrers close deals.
              Commissions split across 12 lines — direct referrer, upline
              managers, club admin, and a lifetime 1% to your original sponsor.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {visibleCtas.map((c) => {
              const href = user ? c.authedHref ?? c.href : c.href;
              const Icon = c.icon;
              return (
                <Link
                  key={c.key}
                  href={href}
                  className="group rounded-lg border bg-card p-6 shadow-card hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {c.description}
                  </p>
                  <p className="mt-3 text-sm font-medium text-primary group-hover:underline">
                    {user ? 'Open' : 'Learn more'} →
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Honeybee Referral Club. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
