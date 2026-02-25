import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const { canUseReferrerPortal, canUseProviderPortal } = session.user.company;

  // Redirect to appropriate portal
  if (canUseReferrerPortal) {
    redirect('/dashboard/referrer');
  } else if (canUseProviderPortal) {
    redirect('/dashboard/provider');
  } else {
    // Fallback - shouldn't happen with proper validation
    redirect('/');
  }
}
