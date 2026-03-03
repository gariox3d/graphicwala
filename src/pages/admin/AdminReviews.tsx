import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StarRating from '@/components/reviews/StarRating';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Star, Search, Edit2, Trash2, MessageSquare, Heart, Send } from 'lucide-react';

interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  admin_reply?: string | null;
  admin_reply_at?: string | null;
  admin_loved?: boolean | null;
  products?: {
    name: string;
    image_url: string | null;
  };
}

interface Product {
  id: string;
  name: string;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deleteReviewId, setDeleteReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, products(name, image_url)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    setProducts(data || []);
  };

  useEffect(() => {
    fetchReviews();
    fetchProducts();
  }, []);

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleSaveEdit = async () => {
    if (!editingReview) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ rating: editRating, comment: editComment })
        .eq('id', editingReview.id);
      if (error) throw error;
      toast.success('Review updated');
      setEditingReview(null);
      fetchReviews();
    } catch {
      toast.error('Failed to update review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteReviewId) return;
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', deleteReviewId);
      if (error) throw error;
      toast.success('Review deleted');
      setDeleteReviewId(null);
      fetchReviews();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const handleToggleLove = async (reviewId: string, currentLoved: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ admin_loved: !currentLoved })
        .eq('id', reviewId);
      if (error) throw error;
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, admin_loved: !currentLoved } : r));
      toast.success(!currentLoved ? '❤️ Loved!' : 'Love removed');
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ admin_reply: replyText.trim(), admin_reply_at: new Date().toISOString() })
        .eq('id', reviewId);
      if (error) throw error;
      toast.success('Reply posted!');
      setReplyingTo(null);
      setReplyText('');
      fetchReviews();
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
      fetchReviews();
    } catch {
      toast.error('Failed to remove reply');
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.products?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = selectedProduct === 'all' || review.product_id === selectedProduct;
    return matchesSearch && matchesProduct;
  });

  const stats = {
    total: reviews.length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0',
    fiveStars: reviews.filter((r) => r.rating === 5).length,
    oneStars: reviews.filter((r) => r.rating === 1).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reviews Management</h1>
          <p className="text-muted-foreground">View, reply and manage all customer reviews</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgRating}</p>
                  <p className="text-sm text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Star className="h-6 w-6 text-green-500 fill-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.fiveStars}</p>
                  <p className="text-sm text-muted-foreground">5-Star Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <Star className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.oneStars}</p>
                  <p className="text-sm text-muted-foreground">1-Star Reviews</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Table */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No reviews found</p>
              </div>
            ) : (
              <div className="space-y-0">
                {/* Desktop Table */}
                <div className="overflow-x-auto hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Reviewer</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="max-w-[300px]">Comment</TableHead>
                        <TableHead>Reply</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReviews.map((review) => (
                        <TableRow key={review.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {review.products?.image_url ? (
                                <img
                                  src={review.products.image_url}
                                  alt={review.products.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs font-bold">
                                  {review.products?.name?.charAt(0)}
                                </div>
                              )}
                              <span className="font-medium truncate max-w-[150px]">
                                {review.products?.name || 'Unknown Product'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{review.user_name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant={review.rating >= 4 ? 'default' : review.rating >= 3 ? 'secondary' : 'destructive'}>
                                {review.rating}
                              </Badge>
                              <StarRating rating={review.rating} size="sm" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="truncate max-w-[300px]">{review.comment}</p>
                          </TableCell>
                          <TableCell>
                            {review.admin_reply ? (
                              <Badge variant="secondary" className="text-xs">Replied</Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(review.created_at), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
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
                                title="Reply"
                              >
                                <MessageSquare className={`h-4 w-4 ${review.admin_reply ? 'text-primary' : 'text-muted-foreground'}`} />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(review)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteReviewId(review.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {filteredReviews.map((review) => (
                    <Card key={review.id} className="overflow-hidden">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {review.products?.image_url ? (
                              <img src={review.products.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                            ) : (
                              <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs font-bold">
                                {review.products?.name?.charAt(0)}
                              </div>
                            )}
                            <span className="font-medium text-sm truncate max-w-[150px]">
                              {review.products?.name}
                            </span>
                          </div>
                          <StarRating rating={review.rating} size="sm" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{review.user_name}</p>
                          <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                        </div>
                        {review.admin_reply && (
                          <div className="pl-3 border-l-2 border-primary/30 bg-primary/5 rounded-r p-2">
                            <p className="text-xs font-semibold text-primary">Your Reply:</p>
                            <p className="text-sm text-muted-foreground">{review.admin_reply}</p>
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), 'dd MMM yyyy')}
                          </span>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => handleToggleLove(review.id, !!review.admin_loved)}>
                              <Heart className={`h-4 w-4 ${review.admin_loved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => { setReplyingTo(replyingTo === review.id ? null : review.id); setReplyText(review.admin_reply || ''); }}>
                              <MessageSquare className={`h-4 w-4 ${review.admin_reply ? 'text-primary' : 'text-muted-foreground'}`} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(review)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteReviewId(review.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reply Dialog */}
      <Dialog open={!!replyingTo} onOpenChange={() => { setReplyingTo(null); setReplyText(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviews.find(r => r.id === replyingTo)?.admin_reply ? 'Edit Reply' : 'Reply to Review'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {replyingTo && (() => {
              const rev = reviews.find(r => r.id === replyingTo);
              return rev ? (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium">{rev.user_name} — <StarRating rating={rev.rating} size="sm" /></p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{rev.comment}</p>
                </div>
              ) : null;
            })()}
            <Textarea
              placeholder="Write your reply as the store owner..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2">
            {reviews.find(r => r.id === replyingTo)?.admin_reply && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => { if (replyingTo) { handleDeleteReply(replyingTo); setReplyingTo(null); setReplyText(''); } }}
              >
                <Trash2 className="h-4 w-4 mr-1" /> Remove Reply
              </Button>
            )}
            <Button variant="outline" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
              Cancel
            </Button>
            <Button
              onClick={() => replyingTo && handleSubmitReply(replyingTo)}
              disabled={submittingReply || !replyText.trim()}
            >
              <Send className="h-4 w-4 mr-1" />
              {submittingReply ? 'Posting...' : 'Post Reply'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rating</label>
              <StarRating rating={editRating} size="lg" interactive onRatingChange={setEditRating} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Comment</label>
              <Textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReview(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteReviewId} onOpenChange={() => setDeleteReviewId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminReviews;
