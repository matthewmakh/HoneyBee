'use client';

import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getReviewAction, submitReviewAction } from './actions';

interface ReviewData {
  id: string;
  customerName: string;
  rating: number | null;
  comment: string | null;
  submittedAt: Date | null;
  expiresAt: Date;
  providerProfile: {
    company: {
      name: string;
      logoUrl: string | null;
    };
  };
  lead: {
    category: string;
  } | null;
}

export default function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [token, setToken] = useState<string>('');
  const [review, setReview] = useState<ReviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setToken(p.token);
    });
  }, [params]);

  useEffect(() => {
    if (!token) return;
    
    async function loadReview() {
      const result = await getReviewAction(token);
      setLoading(false);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.review) {
        setReview(result.review as unknown as ReviewData);
        if (result.review.submittedAt) {
          setSubmitted(true);
          setRating(result.review.rating ?? 0);
          setComment(result.review.comment ?? '');
        }
      }
    }

    loadReview();
  }, [token]);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await submitReviewAction(token, rating, comment || undefined);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="animate-pulse text-amber-600">Loading...</div>
      </div>
    );
  }

  if (error && !review) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {error}
            </h1>
            <p className="text-gray-500">
              This review link is no longer valid.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!review) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
            🐝 Honeybee Reviews
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {submitted ? 'Thank You!' : 'How was your experience?'}
          </h1>
        </div>

        {/* Company Info */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              {review.providerProfile.company.logoUrl ? (
                <img
                  src={review.providerProfile.company.logoUrl}
                  alt={review.providerProfile.company.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-2xl">🏢</span>
                </div>
              )}
              <div>
                <CardTitle className="text-lg">
                  {review.providerProfile.company.name}
                </CardTitle>
                {review.lead && (
                  <p className="text-sm text-gray-500 capitalize">
                    {review.lead.category.toLowerCase().replace('_', ' ')}
                  </p>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Review Form or Thank You */}
        <Card>
          <CardContent className="pt-6">
            {submitted ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">🎉</div>
                <p className="text-gray-700 mb-4">
                  Your review has been submitted successfully!
                </p>
                
                {/* Show submitted review */}
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="ml-2 font-semibold">{rating}/5</span>
                  </div>
                  {comment && (
                    <p className="text-gray-600 text-sm">{comment}</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Star Rating */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                    Rate your experience
                  </label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-sm text-gray-500 mt-2">
                      {rating === 1 && 'Poor'}
                      {rating === 2 && 'Fair'}
                      {rating === 3 && 'Good'}
                      {rating === 4 && 'Very Good'}
                      {rating === 5 && 'Excellent!'}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us more (optional)
                  </label>
                  <Textarea
                    placeholder="Share your experience with this provider..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || rating === 0}
                  className="w-full bg-amber-500 hover:bg-amber-600"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </Button>

                {/* Footer info */}
                <p className="text-xs text-gray-400 text-center mt-4">
                  This link expires on{' '}
                  {new Date(review.expiresAt).toLocaleDateString()}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Customer name */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Reviewing as <span className="font-medium">{review.customerName}</span>
        </p>
      </div>
    </div>
  );
}
