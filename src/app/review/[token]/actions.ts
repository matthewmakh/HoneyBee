'use server';

import { getReviewByToken, submitReview } from '@/lib/services/reviews';

export async function getReviewAction(token: string) {
  try {
    const review = await getReviewByToken(token);
    
    if (!review) {
      return { error: 'Review not found' };
    }

    // Check if expired
    if (new Date() > review.expiresAt) {
      return { 
        error: 'This review link has expired',
        expired: true,
      };
    }

    return { review };
  } catch {
    return { error: 'Failed to load review' };
  }
}

export async function submitReviewAction(
  token: string,
  rating: number,
  comment?: string
) {
  try {
    const review = await submitReview(token, rating, comment);
    return { success: true, review };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit review';
    return { error: message };
  }
}
