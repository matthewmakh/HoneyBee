import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireReferrerAccess } from '@/lib/auth';
import { Button, Card, CardContent } from '@/components/ui';
import { ArrowRight, CheckCircle2, XCircle, Camera, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ providerId: string }>;
}

export default async function PresentPage({ params }: PageProps) {
  await requireReferrerAccess();
  const { providerId } = await params;
  const profile = await prisma.providerProfile.findUnique({
    where: { companyId: providerId },
    include: { company: true },
  });
  if (!profile || !profile.isPublished) notFound();

  const photos = profile.pitchPhotos.length > 0 ? profile.pitchPhotos : profile.portfolioPhotos;

  return (
    <div className="min-h-[80vh] -mx-4 -my-6 md:-my-8 bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/dashboard/referrer/providers"
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Back to directory
          </Link>
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Presentation Mode
          </span>
        </div>

        <div className="text-center space-y-2 mb-8">
          {profile.company.logoUrl && (
            <Image
              src={profile.company.logoUrl}
              alt={profile.company.name}
              width={80}
              height={80}
              className="mx-auto rounded-full object-cover"
            />
          )}
          <h1 className="text-3xl md:text-4xl font-bold">{profile.company.name}</h1>
          <p className="text-muted-foreground">
            {profile.serviceCategories.join(' · ')}
          </p>
        </div>

        {photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 mb-8">
            {photos.slice(0, 4).map((url, i) => (
              <div
                key={url}
                className="relative aspect-[4/3] rounded-lg overflow-hidden border"
              >
                <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-12 text-center text-muted-foreground">
              <Camera className="h-10 w-10 mx-auto mb-2" />
              <p>No pitch photos yet.</p>
            </CardContent>
          </Card>
        )}

        {profile.pitchText && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {profile.pitchText}
              </p>
            </CardContent>
          </Card>
        )}
        {!profile.pitchText && profile.shortDescription && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <p className="text-base leading-relaxed">{profile.shortDescription}</p>
            </CardContent>
          </Card>
        )}

        {(profile.dos.length > 0 || profile.donts.length > 0) && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {profile.dos.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2 inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" /> Do&apos;s
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {profile.dos.map((d, i) => (
                      <li key={i}>• {d}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {profile.donts.length > 0 && (
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2 inline-flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" /> Don&apos;ts
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {profile.donts.map((d, i) => (
                      <li key={i}>• {d}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="sticky bottom-4 text-center">
          <Link href={`/dashboard/referrer/submit/${profile.companyId}`}>
            <Button size="lg" className="gap-2">
              Gather Referral Info <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
