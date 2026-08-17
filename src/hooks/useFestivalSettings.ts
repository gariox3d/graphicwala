import { supabase } from '@/integrations/supabase/client';
import {
  useFestivalSettingsQuery,
  useInvalidateFestivalSettings,
} from './useFestivalSettingsQuery';

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

/** Ramadan theme settings, read from the shared festival_settings cache. */
export const useFestivalSettings = () => {
  const { data, isLoading, refetch } = useFestivalSettingsQuery();
  const invalidate = useInvalidateFestivalSettings();

  const settings = (data?.find(r => r.theme_name === 'ramadan') as FestivalSettings | undefined) ?? null;

  const updateSettings = async (updates: Partial<FestivalSettings>) => {
    if (!settings?.id) return { success: false };
    const { error } = await supabase
      .from('festival_settings')
      .update(updates)
      .eq('id', settings.id);
    if (!error) {
      await invalidate();
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
