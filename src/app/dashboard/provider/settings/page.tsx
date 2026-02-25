import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProviderProfile } from '@/lib/services/providers';
import { ProviderProfileForm } from './provider-profile-form';
import { SERVICE_CATEGORIES } from '@/lib/types';

export default async function ProviderSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.company.canUseProviderPortal && session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  const profile = await getProviderProfile(session.user.companyId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Provider Profile</h1>
        <p className="text-muted-foreground">
          Configure your provider profile and commission settings
        </p>
      </div>

      <ProviderProfileForm
        profile={profile}
        categories={SERVICE_CATEGORIES as unknown as string[]}
      />
    </div>
  );
}
