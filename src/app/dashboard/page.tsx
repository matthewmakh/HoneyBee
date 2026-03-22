import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  // Superadmins go to admin dashboard by default
  if (session.user.role === 'SUPERADMIN') {
    redirect('/admin');
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
