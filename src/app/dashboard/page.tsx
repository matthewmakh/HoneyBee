import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { canUseReferrerPortal, canUseProviderPortal, providerApplicationPending } = session.user.company;

  // Redirect to appropriate portal
  if (canUseReferrerPortal) {
    redirect('/dashboard/referrer');
  } else if (canUseProviderPortal) {
    redirect('/dashboard/provider');
  } else if (providerApplicationPending) {
    redirect('/pending-approval');
  } else {
    redirect('/');
  }
}
