import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ValentineSettings {
  id: string;
  theme_name: string;
  is_enabled: boolean;
  greeting_text: string | null;
  primary_color_override: string | null;
}

export const VALENTINE_SETTINGS_KEY = ['festival-settings', 'valentine'] as const;

const fetchValentineSettings = async (): Promise<ValentineSettings | null> => {
  const { data, error } = await supabase
    .from('festival_settings')
    .select('*')
    .eq('theme_name', 'valentine')
    .maybeSingle();
  if (error) return null;
  return (data as ValentineSettings) ?? null;
};

/** Cached valentine settings — one shared request for the whole app. */
export const useValentineSettings = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useQuery({
    queryKey: VALENTINE_SETTINGS_KEY,
    queryFn: fetchValentineSettings,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const settings = data ?? null;

  const updateSettings = async (updates: Partial<ValentineSettings>) => {
    if (!settings?.id) return { success: false };
    const { error } = await supabase
      .from('festival_settings')
      .update(updates)
      .eq('id', settings.id);
    if (!error) {
      await queryClient.invalidateQueries({ queryKey: VALENTINE_SETTINGS_KEY });
      return { success: true };
    }
    return { success: false, error };
  };

  const isThemeActive = (): boolean => !!settings?.is_enabled;

  return { settings, loading: isLoading, updateSettings, isThemeActive, refetch };
};
