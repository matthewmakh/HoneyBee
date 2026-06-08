import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { searchProviders } from '@/lib/services/providers';
import { BackButton } from '@/components/back-button';
import { ReferWizard, type WizardProduct } from './refer-wizard';

export default async function ReferPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (!session.user.company.canUseReferrerPortal && session.user.role !== 'SUPERADMIN') {
    redirect('/dashboard');
  }

  // Pull the full A-Team catalogue (published providers), excluding the member's
  // own company, with all the selling material the wizard needs to display.
  const providers = await searchProviders({}, session.user.companyId);

  const products: WizardProduct[] = providers.map((p) => ({
    companyId: p.companyId,
    name: p.company.name,
    memberId: p.company.memberId,
    logoUrl: p.company.logoUrl,
    zipCode: p.zipCode,
    serviceCategories: p.serviceCategories,
    shortDescription: p.shortDescription,
    pitchText: p.pitchText,
    photos: (p.pitchPhotos.length > 0 ? p.pitchPhotos : p.portfolioPhotos).slice(0, 3),
    dos: p.dos,
    donts: p.donts,
    commissionType: p.commissionType,
    commissionValue: Number(p.commissionValue),
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <BackButton href="/dashboard/referrer" label="Back to dashboard" />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Refer a Customer</h1>
        <p className="text-muted-foreground">
          Pick up to three A-Team products, review the selling points, then send the
          referral — all in one guided flow.
        </p>
      </div>

      <ReferWizard products={products} />
    </div>
  );
}
