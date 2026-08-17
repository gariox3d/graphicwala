import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FestivalSettingsRow {
  id: string;
  theme_name: string;
  is_enabled: boolean;
  start_date?: string | null;
  end_date?: string | null;
  greeting_text: string | null;
  banner_image_url?: string | null;
  show_countdown?: boolean;
  auto_enable_by_date?: boolean;
  primary_color_override: string | null;
}

export const FESTIVAL_SETTINGS_KEY = ['festival-settings'] as const;

const fetchAllFestivalSettings = async (): Promise<FestivalSettingsRow[]> => {
  const { data, error } = await supabase.from('festival_settings').select('*');
  if (error || !data) return [];
  return data as unknown as FestivalSettingsRow[];
};

/**
 * All festival theme rows in ONE cached request. Ramadan and Valentine hooks
 * both read from this single query entry instead of firing their own fetch.
 */
export const useFestivalSettingsQuery = () => {
  const query = useQuery({
    queryKey: FESTIVAL_SETTINGS_KEY,
    queryFn: fetchAllFestivalSettings,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });
  return query;
};

export const useInvalidateFestivalSettings = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: FESTIVAL_SETTINGS_KEY });
};
