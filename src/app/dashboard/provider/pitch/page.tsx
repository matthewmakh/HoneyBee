import { requireProviderAccess } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PitchForm } from './pitch-form';
import { BackButton } from '@/components/back-button';

export default async function PitchPage() {
  const user = await requireProviderAccess();
  const profile = await prisma.providerProfile.findUnique({
    where: { companyId: user.companyId },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <BackButton href="/dashboard/provider" label="Back to dashboard" />
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Sales Pitch</h1>
        <p className="text-sm text-muted-foreground">
          Upload photos and sales points that Bee Team referrers show to customers.
        </p>
      </div>
      {!profile ? (
        <div className="rounded-md border bg-amber-50 text-amber-800 p-4 text-sm">
          Complete your provider profile first before uploading a pitch.{' '}
          <a href="/dashboard/provider/settings" className="underline font-medium">
            Go to settings
          </a>
          .
        </div>
      ) : (
        <PitchForm
          initial={{
            pitchPhotos: profile.pitchPhotos ?? [],
            pitchText: profile.pitchText ?? '',
            dos: profile.dos ?? [],
            donts: profile.donts ?? [],
            publicSlug: profile.publicSlug ?? null,
          }}
        />
      )}
    </div>
  );
}
