import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useHeroShowcase = () => {
  const [data, setData] = useState<HeroShowcase | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const { data: row } = await supabase
      .from('hero_showcase')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setData(row as HeroShowcase | null);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('hero_showcase_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hero_showcase' }, () => {
        fetchData();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, loading, refetch: fetchData };
};