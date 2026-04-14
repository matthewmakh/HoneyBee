import { notFound } from 'next/navigation';
import { getBySlug } from '@/lib/services/catalogue';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/ui';
import { Check, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function PublicCataloguePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getBySlug(slug);

  if (!profile || !profile.isPublished) {
    notFound();
  }

  const photos = profile.pitchPhotos ?? [];
  const dos = profile.dos ?? [];
  const donts = profile.donts ?? [];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">HB</span>
            </div>
            <span className="font-semibold">HoneyBee</span>
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-primary hover:underline"
          >
            Join the Club
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {profile.company.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {profile.serviceCategories.map((c) => (
              <Badge key={c} variant="outline">
                {c}
              </Badge>
            ))}
            <span className="text-sm text-muted-foreground">
              · Zip {profile.zipCode}
            </span>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {photos.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="relative aspect-square rounded-md overflow-hidden border bg-muted"
              >
                <Image
                  src={src}
                  alt={`${profile.company.name} pitch photo ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {profile.pitchText && (
          <Card>
            <CardHeader>
              <CardTitle>Why choose us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed whitespace-pre-wrap">
                {profile.pitchText}
              </p>
            </CardContent>
          </Card>
        )}

        {(dos.length > 0 || donts.length > 0) && (
          <div className="grid md:grid-cols-2 gap-4">
            {dos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-700">Do&apos;s</CardTitle>
                  <CardDescription>What you should expect</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {dos.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {donts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-700">Don&apos;ts</CardTitle>
                  <CardDescription>Common pitfalls to avoid</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {donts.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <X className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Card className="bg-primary/5 border-primary/30">
          <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-6">
            <div>
              <p className="font-semibold">Know someone who needs this work done?</p>
              <p className="text-sm text-muted-foreground">
                Join the Bee Club and earn commission on every successful referral.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground font-medium hover:bg-primary/90"
            >
              Get Started
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
