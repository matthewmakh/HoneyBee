import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui';
import { Logo, LogoMark, Honeycomb } from '@/components/brand';
import { ShieldCheck, Handshake, Wallet, Play, ArrowRight, Check } from 'lucide-react';

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

const TRUST = [
  { icon: ShieldCheck, label: 'Vetted providers', body: 'Every provider is approved by an admin before going live.' },
  { icon: Handshake, label: 'Locked-in terms', body: 'Commission is captured at referral time and cannot change behind your back.' },
  { icon: Wallet, label: 'Transparent payouts', body: 'Track every referral from submitted to paid in one wallet.' },
];

export default async function Home() {
  const session = await auth();

  // Redirect authenticated users to dashboard
  if (session?.user) {
    if (session.user.role === 'SUPERADMIN') {
      redirect('/admin');
    }
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo className="text-lg" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
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
                Grow your business through{' '}
                <span className="text-[hsl(var(--gold))]">trusted referrals</span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                Honeybee connects the people who know the customer with the pros who can do
                the work — and pays out a commission on every job that closes.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link href="/register" className="sm:w-auto">
                  <Button size="lg" className="w-full gap-2 px-8 sm:w-auto">
                    Join as Referrer
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/register?provider=true" className="sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full px-8 sm:w-auto">
                    List Your Services
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[hsl(var(--gold))]" />
                  Free to join
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-[hsl(var(--gold))]" />
                  No monthly fee
                </span>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Watch the 90-second demo
                </Link>
              </div>
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
                    <p className="truncate text-sm font-semibold">Referral completed</p>
                    <p className="truncate text-xs text-muted-foreground">
                      Commission credited to your wallet
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust band */}
        <section className="border-b bg-card">
          <div className="container mx-auto grid gap-8 px-4 py-12 sm:grid-cols-3">
            {TRUST.map((item) => (
              <div key={item.label} className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--gold))]/12">
                  <item.icon className="h-5 w-5 text-[hsl(var(--gold))]" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.label}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </div>
            ))}
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
                    width={160}
                    height={160}
                    className="h-28 w-28"
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

      {/* Footer */}
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
