import { prisma } from '@/lib/db';
import { randomBytes } from 'crypto';

/**
 * Generate a secure random token for review links
 */
function generateReviewToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Create a review request when a lead is marked as completed
 * Called automatically during lead completion flow
 */
export async function createReviewRequest(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      providerCompany: {
        include: { providerProfile: true },
      },
    },
  });

  if (!lead) {
    throw new Error('Lead not found');
  }

  if (!lead.providerCompany.providerProfile) {
    throw new Error('Provider profile not found');
  }

  // Check if review already exists for this lead
  const existingReview = await prisma.review.findUnique({
    where: { leadId },
  });

  if (existingReview) {
    return existingReview;
  }

  // Create review request with 1 week expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return prisma.review.create({
    data: {
      leadId,
      providerProfileId: lead.providerCompany.providerProfile.id,
      token: generateReviewToken(),
      customerName: lead.homeownerName,
      expiresAt,
    },
  });
}

/**
 * Get review by token (for public review page)
 */
export async function getReviewByToken(token: string) {
  return prisma.review.findUnique({
    where: { token },
    include: {
      providerProfile: {
        include: {
          company: {
            select: {
              name: true,
              logoUrl: true,
            },
          },
        },
      },
      lead: {
        select: {
          category: true,
          homeownerName: true,
        },
      },
    },
  });
}

/**
 * Submit a review (rating + comment)
 */
export async function submitReview(
  token: string,
  rating: number,
  comment?: string
) {
  const review = await prisma.review.findUnique({
    where: { token },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  // Check if already submitted
  if (review.submittedAt) {
    throw new Error('Review has already been submitted');
  }

  // Check if expired
  if (new Date() > review.expiresAt) {
    throw new Error('Review link has expired');
  }

  // Validate rating
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  return prisma.review.update({
    where: { token },
    data: {
      rating,
      comment: comment?.trim() || null,
      submittedAt: new Date(),
    },
  });
}

/**
 * Get all submitted reviews for a provider profile
 */
export async function getProviderReviews(providerProfileId: string) {
  return prisma.review.findMany({
    where: {
      providerProfileId,
      submittedAt: { not: null },
    },
    orderBy: { submittedAt: 'desc' },
    select: {
      id: true,
      customerName: true,
      rating: true,
      comment: true,
      submittedAt: true,
      lead: {
        select: {
          category: true,
        },
      },
    },
  });
}

/**
 * Get provider's average rating and review count
 */
export async function getProviderRatingStats(providerProfileId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      providerProfileId,
      submittedAt: { not: null },
      rating: { not: null },
    },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    return { averageRating: null, reviewCount: 0 };
  }

  const totalRating = reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0);
  const averageRating = totalRating / reviews.length;

  return {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    reviewCount: reviews.length,
  };
}

/**
 * Get rating stats for multiple providers at once (for directory listing)
 */
export async function getProvidersRatingStats(providerProfileIds: string[]) {
  const reviews = await prisma.review.groupBy({
    by: ['providerProfileId'],
    where: {
      providerProfileId: { in: providerProfileIds },
      submittedAt: { not: null },
      rating: { not: null },
    },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const statsMap = new Map<string, { averageRating: number; reviewCount: number }>();
  
  for (const r of reviews) {
    statsMap.set(r.providerProfileId, {
      averageRating: Math.round((r._avg.rating ?? 0) * 10) / 10,
      reviewCount: r._count.rating,
    });
  }

  return statsMap;
}
