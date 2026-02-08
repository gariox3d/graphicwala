import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    const { data } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', user.id);
    if (data) {
      setWishlistIds(new Set(data.map(w => w.product_id)));
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = useCallback(async (productId: string) => {
    if (!user) {
      toast.error('Please login to save items');
      return;
    }
    
    setLoading(true);
    const isInWishlist = wishlistIds.has(productId);
    
    // Optimistic update
    setWishlistIds(prev => {
      const next = new Set(prev);
      if (isInWishlist) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
        if (error) throw error;
        toast.success('Removed from wishlist');
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id, product_id: productId });
        if (error) throw error;
        toast.success('Added to wishlist ❤️');
      }
    } catch (error) {
      // Revert optimistic update
      setWishlistIds(prev => {
        const next = new Set(prev);
        if (isInWishlist) next.add(productId);
        else next.delete(productId);
        return next;
      });
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [user, wishlistIds]);

  const isWishlisted = useCallback((productId: string) => {
    return wishlistIds.has(productId);
  }, [wishlistIds]);

  return { wishlistIds, toggleWishlist, isWishlisted, loading, refetch: fetchWishlist };
};
