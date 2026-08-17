import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { readCache, writeCache } from '@/lib/persistentCache';

export interface HeroShowcase {
  id: string;
  is_active: boolean;
  collection_label: string;
  eyebrow: string;
  title: string;
  price_prefix: string;
  price_label: string;
  rating_value: string;
  rating_subtitle: string;
  image_url: string | null;
}

export const HERO_SHOWCASE_KEY = ['hero-showcase'] as const;

const fetchHeroShowcase = async (): Promise<HeroShowcase | null> => {
  const { data } = await supabase
    .from('hero_showcase')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  const row = (data as HeroShowcase | null) ?? null;
  writeCache('hero-showcase', row);
  return row;
};

/** Cached hero showcase card, with a single realtime subscription for admin edits. */
export const useHeroShowcase = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: HERO_SHOWCASE_KEY,
    queryFn: fetchHeroShowcase,
    // Instant paint from last known hero card to avoid a hero layout shift.
    initialData: () => readCache<HeroShowcase | null>('hero-showcase'),
    initialDataUpdatedAt: 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    const channel = supabase
      .channel('hero_showcase_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_showcase' }, () => {
        queryClient.invalidateQueries({ queryKey: HERO_SHOWCASE_KEY });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { data: data ?? null, loading: isLoading, refetch };
};
