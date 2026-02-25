'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label, Checkbox } from '@/components/ui';
import { registerUser } from './actions';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultProvider = searchParams.get('provider') === 'true';
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      const result = await registerUser(formData);
      
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
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">HB</span>
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Create an account</CardTitle>
        <CardDescription className="text-center">
          Join the Honeybee Referral Club
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="referrer"
                checked={formData.canUseReferrerPortal}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, canUseReferrerPortal: checked as boolean })
                }
                disabled={isLoading}
              />
              <label htmlFor="referrer" className="text-sm">
                Refer customers and earn commissions
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="provider"
                checked={formData.canUseProviderPortal}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, canUseProviderPortal: checked as boolean })
                }
                disabled={isLoading}
              />
              <label htmlFor="provider" className="text-sm">
                Receive referrals as a service provider
              </label>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            Loading...
          </CardContent>
        </Card>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
