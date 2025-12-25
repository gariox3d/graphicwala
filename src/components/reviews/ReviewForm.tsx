import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StarRating from './StarRating';
import LoginPromptDialog from './LoginPromptDialog';
import { toast } from 'sonner';
import { Send, Edit2 } from 'lucide-react';

interface ReviewFormProps {
  productId: string;
  existingReview?: {
    id: string;
    rating: number;
    comment: string;
  } | null;
  onReviewSubmitted: () => void;
}

const ReviewForm = ({ productId, existingReview, onReviewSubmitted }: ReviewFormProps) => {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(!existingReview);

  const getUserName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Anonymous User';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setShowLoginDialog(true);
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setLoading(true);

    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating,
            comment: comment.trim(),
          })
          .eq('id', existingReview.id);

        if (error) throw error;
        toast.success('Review updated successfully!');
      } else {
        // Create new review
        const { error } = await supabase.from('reviews').insert({
          product_id: productId,
          user_id: user.id,
          user_name: getUserName(),
          rating,
          comment: comment.trim(),
        });

        if (error) {
          if (error.code === '23505') {
            toast.error('You have already reviewed this product');
          } else {
            throw error;
          }
          return;
        }
        toast.success('Review submitted successfully!');
      }

      setIsEditing(false);
      onReviewSubmitted();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReviewClick = () => {
    if (!user) {
      setShowLoginDialog(true);
    }
  };

  if (existingReview && !isEditing) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Your Review</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <StarRating rating={existingReview.rating} size="sm" />
          <p className="mt-2 text-sm text-muted-foreground">{existingReview.comment}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {existingReview ? 'Edit Your Review' : 'Write a Review'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!user ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">
                Please login to submit a review
              </p>
              <Button onClick={handleWriteReviewClick}>
                Write a Review
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your Rating
                </label>
                <StarRating
                  rating={rating}
                  size="lg"
                  interactive
                  onRatingChange={setRating}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Your Review
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {comment.length}/1000
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                </Button>
                {existingReview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setRating(existingReview.rating);
                      setComment(existingReview.comment);
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <LoginPromptDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
      />
    </>
  );
};

export default ReviewForm;
