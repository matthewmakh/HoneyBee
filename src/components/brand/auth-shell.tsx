import Link from 'next/link';
import Image from 'next/image';
import { LogoMark } from './logo-mark';

const HIGHLIGHTS = [
  'Vetted providers, approved before they go live',
  'Commission terms locked in at referral time',
  'Every referral tracked from submitted to paid',
];

/**
 * Split-screen frame for /login and /register: brand panel on the left,
 * the form on the right. The panel collapses away below `lg`.
 */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Brand panel — decorative, hidden on small screens */}
      <aside className="relative hidden w-[44%] max-w-2xl shrink-0 overflow-hidden bg-[hsl(var(--primary))] lg:block">
        <Image
          src="/brand/auth-panel.svg"
          alt=""
          aria-hidden
          fill
          priority
          className="object-cover opacity-90"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--primary))]/40 via-[hsl(var(--primary))]/70 to-[hsl(var(--primary))]"
        />

        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link href="/" className="inline-flex items-center gap-3 self-start">
            <LogoMark inverted className="h-10 w-10" />
            <span className="text-lg font-semibold tracking-tight">Honeybee Referral Club</span>
          </Link>

          <div>
            <p className="text-3xl font-bold leading-tight tracking-tight">
              Turn the introductions you already make into income.
            </p>
            <ul className="mt-8 space-y-3.5">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-white/75">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--gold))]" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} Honeybee Referral Club
          </p>
        </div>
      </aside>

      {/* Form side */}
      <main className="flex flex-1 flex-col items-center justify-center bg-background p-4 py-10 sm:p-8">
        <Link href="/" className="mb-8 inline-flex items-center gap-2.5 lg:hidden">
          <LogoMark className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-tight">Honeybee Referral Club</span>
        </Link>
        {children}
      </main>
    </div>
  );
}
