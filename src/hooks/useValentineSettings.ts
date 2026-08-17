import { supabase } from '@/integrations/supabase/client';
import {
  useFestivalSettingsQuery,
  useInvalidateFestivalSettings,
} from './useFestivalSettingsQuery';

export interface ValentineSettings {
  id: string;
  theme_name: string;
  is_enabled: boolean;
  greeting_text: string | null;
  primary_color_override: string | null;
}

/** Valentine theme settings, read from the shared festival_settings cache. */
export const useValentineSettings = () => {
  const { data, isLoading, refetch } = useFestivalSettingsQuery();
  const invalidate = useInvalidateFestivalSettings();

  const settings = (data?.find(r => r.theme_name === 'valentine') as ValentineSettings | undefined) ?? null;

  const updateSettings = async (updates: Partial<ValentineSettings>) => {
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

  const isThemeActive = (): boolean => !!settings?.is_enabled;

  return { settings, loading: isLoading, updateSettings, isThemeActive, refetch };
};
