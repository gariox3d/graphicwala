import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const ProductReviews = ({ productId, productName }: ProductReviewsProps) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [userReview, setUserReview] = useState<Review | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Only select necessary columns - exclude user_id from public queries for privacy
      const { data, error } = await supabase
        .from('reviews')
        .select('id, product_id, user_name, rating, comment, created_at, updated_at, user_id')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reviewsData = data || [];
      setReviews(reviewsData);

      // Calculate average rating
      if (reviewsData.length > 0) {
        const avg = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
        setAverageRating(Math.round(avg * 10) / 10);
      } else {
        setAverageRating(0);
      }

      // Find user's review
      if (user) {
        const existing = reviewsData.find((r) => r.user_id === user.id);
        setUserReview(existing || null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId, user]);

  // Generate review structured data for SEO
  const reviewSchema = reviews.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": averageRating.toString(),
      "reviewCount": reviews.length.toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.user_name
      },
      "datePublished": review.created_at.split('T')[0],
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating.toString(),
        "bestRating": "5",
        "worstRating": "1"
      },
      "reviewBody": review.comment
    }))
  } : null;

  return (
    <div className="space-y-6">
      {/* SEO Structured Data */}
      {reviewSchema && (
        <script type="application/ld+json">
          {JSON.stringify(reviewSchema)}
        </script>
      )}

      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold">{averageRating || '—'}</div>
              <StarRating rating={Math.round(averageRating)} size="sm" />
              <p className="text-sm text-muted-foreground mt-1">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            
            {reviews.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-16" />
                <div className="flex-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = reviews.filter((r) => r.rating === star).length;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2 text-sm">
                        <span className="w-3">{star}</span>
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      <ReviewForm
        productId={productId}
        existingReview={userReview}
        onReviewSubmitted={fetchReviews}
      />

      {/* Reviews List */}
      <div>
        <h3 className="font-semibold text-lg mb-4">All Reviews</h3>
        <ReviewList
          reviews={reviews.filter((r) => r.id !== userReview?.id)}
          loading={loading}
          onReviewDeleted={fetchReviews}
        />
      </div>
    </div>
  );
};

export default ProductReviews;
