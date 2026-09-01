'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Checkbox,
  Textarea,
} from '@/components/ui';
import { AuthShell } from '@/components/brand';
import { registerUser, getSponsorPreview } from './actions';
import { CLUB_RULES } from '@/lib/club-rules';
import { CheckCircle2, ArrowRight, ArrowLeft, UserCheck } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultProvider = searchParams.get('provider') === 'true';
  const sponsorMemberId = searchParams.get('sponsor') ?? '';

  const [step, setStep] = useState<1 | 2>(1);
  const [sponsor, setSponsor] = useState<{ name: string; memberId: string } | null>(null);

  // Show who the invite link belongs to, so the visitor knows whose team
  // they are joining before they commit.
  useEffect(() => {
    if (!sponsorMemberId) return;
    let cancelled = false;
    getSponsorPreview(sponsorMemberId).then((s) => {
      if (!cancelled) setSponsor(s);
    });
    return () => {
      cancelled = true;
    };
  }, [sponsorMemberId]);

  // Step 1 — agreement
  const [agreed, setAgreed] = useState<boolean[]>(() => CLUB_RULES.map(() => false));
  const [referralSource, setReferralSource] = useState('');
  const [enrollmentNote, setEnrollmentNote] = useState('');

  // Step 2 — account
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    canUseReferrerPortal: !defaultProvider,
    canUseProviderPortal: defaultProvider,
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const agreedCount = agreed.filter(Boolean).length;
  const allAgreed = agreedCount === CLUB_RULES.length;

  const toggleRule = (i: number) =>
    setAgreed((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!allAgreed) {
      setError('Please agree to all club rules first.');
      setStep(1);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!formData.canUseReferrerPortal && !formData.canUseProviderPortal) {
      setError('Please select at least one portal');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerUser({
        ...formData,
        agreedToRules: allAgreed,
        referralSource,
        enrollmentNote,
        sponsorMemberId: sponsorMemberId || undefined,
      });
      if (!result.success) {
        setError(result.error ?? 'Registration failed');
        setIsLoading(false);
        return;
      }
      router.push('/login?registered=true');
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl border-0 shadow-none sm:border sm:shadow-card">
      <CardHeader className="space-y-1">
        {sponsor && (
          <div className="mb-2 flex items-center justify-center gap-2 rounded-lg border border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold))]/10 px-3 py-2 text-sm">
            <UserCheck className="h-4 w-4 shrink-0 text-[hsl(var(--gold))]" />
            <span>
              You&apos;re joining{' '}
              <span className="font-semibold">{sponsor.name}</span>&apos;s team
              <span className="ml-1 font-mono text-xs text-muted-foreground">
                ({sponsor.memberId})
              </span>
            </span>
          </div>
        )}
        <CardTitle className="text-2xl text-center">
          {step === 1 ? 'Agree to the Club Standards' : 'Create your account'}
        </CardTitle>
        <CardDescription className="text-center">
          {step === 1
            ? `Step 1 of 2 — please read and agree to each rule (${agreedCount}/${CLUB_RULES.length})`
            : 'Step 2 of 2 — your account details'}
        </CardDescription>
      </CardHeader>

      {error && (
        <div className="mx-6 mb-2 bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {/* STEP 1 — Agreement */}
      {step === 1 && (
        <>
          <CardContent className="space-y-3">
            <div className="space-y-2 max-h-[42vh] overflow-y-auto pr-1">
              {CLUB_RULES.map((rule, i) => (
                <label
                  key={i}
                  htmlFor={`rule-${i}`}
                  className={`flex gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    agreed[i] ? 'border-green-300 bg-green-50/60' : 'hover:bg-muted/40'
                  }`}
                >
                  <Checkbox
                    id={`rule-${i}`}
                    checked={agreed[i] ?? false}
                    onCheckedChange={() => toggleRule(i)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      {i + 1}. {rule.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{rule.body}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <Label htmlFor="referralSource">How did you hear about the club?</Label>
              <Input
                id="referralSource"
                placeholder="A friend, social media, an event…"
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollmentNote">
                Any thoughts you&apos;d like to share? (optional)
              </Label>
              <Textarea
                id="enrollmentNote"
                placeholder="What are you most excited about? Questions on your mind?"
                value={enrollmentNote}
                onChange={(e) => setEnrollmentNote(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="button"
              className="w-full"
              disabled={!allAgreed}
              onClick={() => {
                setError('');
                setStep(2);
              }}
            >
              {allAgreed ? (
                <>
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                `Agree to all ${CLUB_RULES.length} rules to continue`
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </>
      )}

      {/* STEP 2 — Account */}
      {step === 2 && (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 p-2 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              You&apos;ve agreed to all {CLUB_RULES.length} club standards.
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company / Business Name</Label>
              <Input
                id="companyName"
                placeholder="Your Company Inc."
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-3 pt-2">
              <Label className="text-base">I want to:</Label>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="referrer"
                  checked={formData.canUseReferrerPortal}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, canUseReferrerPortal: checked as boolean })
                  }
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <div>
                  <label htmlFor="referrer" className="text-sm font-medium cursor-pointer">
                    Refer customers and earn commissions
                  </label>
                  <p className="text-xs text-muted-foreground">Instant access — start referring right away</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="provider"
                  checked={formData.canUseProviderPortal}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, canUseProviderPortal: checked as boolean })
                  }
                  disabled={isLoading}
                  className="mt-0.5"
                />
                <div>
                  <label htmlFor="provider" className="text-sm font-medium cursor-pointer">
                    Receive referrals as a service provider
                  </label>
                  <p className="text-xs text-muted-foreground">Requires admin approval — we&apos;ll review your application</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              disabled={isLoading}
              onClick={() => setStep(1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to rules
            </Button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <AuthShell>
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent>
          </Card>
        }
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
