import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/profile/UserAvatar';
import { Textarea } from '@/components/ui/textarea';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, MessageSquare, Heart, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Review {
  id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  review_images?: string[];
  admin_reply?: string | null;
  admin_reply_at?: string | null;
  admin_loved?: boolean | null;
}

interface ReviewListProps {
  reviews: Review[];
  loading: boolean;
  onReviewDeleted: () => void;
  profiles?: Record<string, { display_name?: string | null; avatar_url?: string | null }>;
}

const ReviewList = ({ reviews, loading, onReviewDeleted, profiles = {} }: ReviewListProps) => {
  const { user, isAdmin } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [togglingLove, setTogglingLove] = useState<string | null>(null);

  const handleDelete = async (reviewId: string) => {
    setDeletingId(reviewId);
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      toast.success('Review deleted');
      onReviewDeleted();
    } catch (error: any) {
      toast.error('Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleLove = async (reviewId: string, currentLoved: boolean) => {
    setTogglingLove(reviewId);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ admin_loved: !currentLoved })
        .eq('id', reviewId);

      if (error) throw error;
      onReviewDeleted(); // refresh
    } catch {
      toast.error('Failed to update');
    } finally {
      setTogglingLove(null);
    }
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ 
          admin_reply: replyText.trim(), 
          admin_reply_at: new Date().toISOString() 
        })
        .eq('id', reviewId);

      if (error) throw error;
      toast.success('Reply posted!');
      setReplyingTo(null);
      setReplyText('');
      onReviewDeleted(); // refresh
    } catch {
      toast.error('Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteReply = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ admin_reply: null, admin_reply_at: null })
        .eq('id', reviewId);

      if (error) throw error;
      toast.success('Reply removed');
      onReviewDeleted();
    } catch {
      toast.error('Failed to remove reply');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-20" />
                  <div className="h-16 bg-muted rounded w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold text-lg mb-2">No reviews yet</h3>
          <p className="text-muted-foreground">
            Be the first to review this product!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <UserAvatar
                avatarUrl={profiles[review.user_id]?.avatar_url}
                name={profiles[review.user_id]?.display_name || review.user_name}
                className="h-10 w-10 shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-medium truncate">
                    {profiles[review.user_id]?.display_name || review.user_name}
                  </h4>
                  <div className="flex items-center gap-1">
                    {/* Love reaction indicator (visible to all) */}
                    {review.admin_loved && (
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                    )}
                    
                    {/* Admin actions */}
                    {isAdmin && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          disabled={togglingLove === review.id}
                          onClick={() => handleToggleLove(review.id, !!review.admin_loved)}
                          title={review.admin_loved ? 'Remove love' : 'Love this review'}
                        >
                          <Heart className={`h-4 w-4 ${review.admin_loved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setReplyingTo(replyingTo === review.id ? null : review.id);
                            setReplyText(review.admin_reply || '');
                          }}
                          title="Reply to review"
                        >
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </>
                    )}
                    
                    {user?.id === review.user_id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Review</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete your review? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(review.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingId === review.id ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {review.comment}
                </p>

                {review.review_images && review.review_images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {(review.review_images as string[]).map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={url} 
                          alt={`Review photo ${i + 1}`} 
                          className="w-20 h-20 rounded-lg object-cover border border-border hover:opacity-80 transition-opacity" 
                          loading="lazy"
                        />
                      </a>
                    ))}
                  </div>
                )}

                {/* Admin Reply Display (visible to everyone) */}
                {review.admin_reply && (
                  <div className="mt-3 ml-2 pl-3 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <img 
                        src="/images/logo-circle.png" 
                        alt="Graphic Wala" 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-semibold text-sm">Graphic Wala</span>
                      <span className="text-[10px] bg-primary/15 text-primary font-medium px-1.5 py-0.5 rounded-full">
                        Owner
                      </span>
                      {review.admin_reply_at && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.admin_reply_at), { addSuffix: true })}
                        </span>
                      )}
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-auto text-destructive hover:text-destructive"
                          onClick={() => handleDeleteReply(review.id)}
                          title="Delete reply"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                      {review.admin_reply}
                    </p>
                  </div>
                )}

                {/* Admin Reply Form */}
                {isAdmin && replyingTo === review.id && (
                  <div className="mt-3 space-y-2">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[60px] text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitReply(review.id)}
                        disabled={submittingReply || !replyText.trim()}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        {submittingReply ? 'Posting...' : 'Reply'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReviewList;
