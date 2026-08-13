import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui';
import { Logo, LogoMark, Honeycomb } from '@/components/brand';
import {
  Upload,
  Presentation,
  FileText,
  TrendingUp,
  Users,
  Shield,
  Play,
  ArrowRight,
  LucideIcon,
} from 'lucide-react';

const STEPS = [
  {
    illustration: '/illustrations/step-find.svg',
    title: 'Find a provider',
    body: 'Browse a directory of vetted local pros — every one reviewed and approved before they can receive work.',
  },
  {
    illustration: '/illustrations/step-submit.svg',
    title: 'Submit the referral',
    body: 'Pass along the homeowner and the job details in under a minute. The provider takes it from there.',
  },
  {
    illustration: '/illustrations/step-earn.svg',
    title: 'Get paid',
    body: 'When the job completes and the value is confirmed, your commission lands in your wallet.',
  },
];

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
      <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo className="text-lg" />
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
        <section className="relative overflow-hidden border-b">
          <Honeycomb className="text-[hsl(var(--gold))]" opacity={0.07} />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 right-0 h-[32rem] w-[32rem] rounded-full bg-[hsl(var(--gold))]/10 blur-3xl"
          />

          <div className="container relative mx-auto grid items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold))]/10 px-3 py-1 text-xs font-medium text-[hsl(var(--gold-foreground))]">
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--gold))]" />
                Referrals that actually pay
              </span>

              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                The Bee Club
                <span className="block text-[hsl(var(--gold))]">
                  Multi-Level Referral Network
                </span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                A-Team providers upload pitches. Bee Team referrers close deals.
                Commissions split across 12 lines — direct referrer, upline
                managers, club admin, and a lifetime 1% to your original sponsor.
              </p>
            </div>

            {/* Hero image */}
            <div className="relative">
              <div
                aria-hidden
                className="absolute -bottom-4 -right-4 hidden h-full w-full rounded-2xl border-2 border-[hsl(var(--gold))]/40 lg:block"
              />
              <div className="relative overflow-hidden rounded-2xl shadow-soft ring-1 ring-black/5">
                <Image
                  src="/images/hero-handshake.jpg"
                  alt="A service provider shaking hands with a homeowner on their front porch"
                  width={2000}
                  height={1143}
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[hsl(var(--primary))]/70 to-transparent"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl bg-background/95 p-3 shadow-card backdrop-blur">
                  <LogoMark className="h-9 w-9" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">Deal closed</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Commission split across the line
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
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

        {/* How it works */}
        <section className="bg-muted/40 py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
              <p className="mt-3 text-muted-foreground">
                Three steps from a conversation you were already having to money in your wallet.
              </p>
            </div>

            <ol className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li
                  key={step.title}
                  className="relative rounded-2xl border bg-card p-7 shadow-card transition-shadow hover:shadow-soft"
                >
                  <span className="absolute right-6 top-6 text-4xl font-bold tabular-nums text-[hsl(var(--gold))]/20">
                    {i + 1}
                  </span>
                  <Image
                    src={step.illustration}
                    alt=""
                    width={120}
                    height={120}
                    className="h-24 w-24"
                  />
                  <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-12 text-center">
              <Link href="/demo">
                <Button variant="outline" size="lg" className="gap-2">
                  <Play className="h-4 w-4 fill-current" />
                  Watch the walkthrough
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Provider CTA */}
        <section className="relative overflow-hidden bg-[hsl(var(--primary))] py-20 text-white">
          <Honeycomb className="text-[hsl(var(--gold))]" opacity={0.12} />
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <LogoMark inverted className="mx-auto h-14 w-14" />
              <h2 className="mt-6 text-3xl font-bold tracking-tight">
                Are you the one doing the work?
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-white/70">
                List your services and let a network of referrers bring you qualified jobs.
                You set the commission, you accept only the leads you want.
              </p>
              <Link href="/register?provider=true" className="mt-8 inline-block">
                <Button
                  size="lg"
                  className="gap-2 bg-[hsl(var(--gold))] px-8 text-[hsl(var(--gold-foreground))] hover:bg-[hsl(var(--gold))]/90"
                >
                  Apply as a Provider
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        <div className="container mx-auto flex flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo />
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              A referral marketplace built on trust and results.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/demo" className="hover:text-foreground">Demo</Link>
            <Link href="/login" className="hover:text-foreground">Sign In</Link>
            <Link href="/register" className="hover:text-foreground">Get Started</Link>
          </div>
        </div>
        <div className="border-t">
          <div className="container mx-auto px-4 py-5 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Honeybee Referral Club. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
