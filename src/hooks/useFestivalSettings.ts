import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FestivalSettings {
  id: string;
  theme_name: string;
  is_enabled: boolean;
  start_date: string | null;
  end_date: string | null;
  greeting_text: string | null;
  banner_image_url: string | null;
  show_countdown: boolean;
  auto_enable_by_date: boolean;
  primary_color_override: string | null;
}

export const FESTIVAL_SETTINGS_KEY = ['festival-settings', 'ramadan'] as const;

const fetchFestivalSettings = async (): Promise<FestivalSettings | null> => {
  const { data, error } = await supabase
    .from('festival_settings')
    .select('*')
    .eq('theme_name', 'ramadan')
    .maybeSingle();
  if (error) return null;
  return (data as FestivalSettings) ?? null;
};

/** Cached festival settings — one shared request for the whole app. */
export const useFestivalSettings = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: FESTIVAL_SETTINGS_KEY,
    queryFn: fetchFestivalSettings,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const settings = data ?? null;

  const updateSettings = async (updates: Partial<FestivalSettings>) => {
    if (!settings?.id) return { success: false };
    const { error } = await supabase
      .from('festival_settings')
      .update(updates)
      .eq('id', settings.id);
    if (!error) {
      await queryClient.invalidateQueries({ queryKey: FESTIVAL_SETTINGS_KEY });
      return { success: true };
    }
    return { success: false, error };
  };

  const isThemeActive = (): boolean => {
    if (!settings || !settings.is_enabled) return false;
    if (settings.auto_enable_by_date && settings.start_date && settings.end_date) {
      const now = new Date();
      const start = new Date(settings.start_date);
      const end = new Date(settings.end_date);
      end.setHours(23, 59, 59, 999);
      return now >= start && now <= end;
    }
    return settings.is_enabled;
  };

  return { settings, loading: isLoading, updateSettings, isThemeActive, refetch };
};
