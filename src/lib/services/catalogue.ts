import { prisma } from '@/lib/db';
import type { UpdateCatalogueInput, UpdatePitchInput } from '@/lib/validations';

function slugify(name: string, suffix: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return `${base || 'provider'}-${suffix.slice(-6)}`;
}

/**
 * Update pitch content (photos + text + do's/don'ts). Auto-publishes the
 * provider profile and ensures a publicSlug exists.
 */
export async function updatePitch(
  companyId: string,
  input: UpdatePitchInput
) {
  const profile = await prisma.providerProfile.findUnique({
    where: { companyId },
    include: { company: { select: { name: true, id: true } } },
  });
  if (!profile) throw new Error('Provider profile not found');

  const publicSlug =
    profile.publicSlug ?? slugify(profile.company.name, profile.company.id);

  return prisma.providerProfile.update({
    where: { companyId },
    data: {
      pitchPhotos: input.pitchPhotos,
      pitchText: input.pitchText,
      dos: input.dos,
      donts: input.donts,
      publicSlug,
      isPublished: true,
    },
  });
}

export async function updateCatalogueEntry(
  companyId: string,
  input: UpdateCatalogueInput
) {
  const profile = await prisma.providerProfile.findUnique({
    where: { companyId },
    include: { company: { select: { name: true, id: true } } },
  });
  if (!profile) throw new Error('Provider profile not found');

  const publicSlug =
    profile.publicSlug ?? slugify(profile.company.name, profile.company.id);

  return prisma.providerProfile.update({
    where: { companyId },
    data: {
      pitchPhotos: input.pitchPhotos,
      pitchText: input.pitchText,
      dos: input.dos,
      donts: input.donts,
      searchRadiusMiles: input.searchRadiusMiles ?? null,
      publicSlug,
      isPublished: true,
    },
  });
}

export async function getBySlug(slug: string) {
  return prisma.providerProfile.findUnique({
    where: { publicSlug: slug },
    include: { company: true, reviews: true },
  });
}

/**
 * Simple zip-prefix search (Haversine left as TODO — needs zip-centroid data).
 * `radiusMiles` is accepted for API shape compatibility; matches on first 3
 * digits of the zip as a coarse proxy when provided.
 */
export async function searchCatalogue(params: {
  zipCode?: string;
  radiusMiles?: number;
  category?: string;
}) {
  const where: {
    isPublished: boolean;
    zipCode?: { startsWith: string };
    serviceCategories?: { has: string };
  } = { isPublished: true };

  if (params.zipCode && params.radiusMiles) {
    where.zipCode = { startsWith: params.zipCode.slice(0, 3) };
  } else if (params.zipCode) {
    where.zipCode = { startsWith: params.zipCode };
  }
  if (params.category) {
    where.serviceCategories = { has: params.category };
  }

  return prisma.providerProfile.findMany({
    where,
    include: { company: true },
    orderBy: { updatedAt: 'desc' },
  });
}
