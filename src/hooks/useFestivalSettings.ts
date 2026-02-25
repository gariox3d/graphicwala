import { useState, useEffect } from 'react';
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

export const useFestivalSettings = () => {
  const [settings, setSettings] = useState<FestivalSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('festival_settings')
        .select('*')
        .eq('theme_name', 'ramadan')
        .maybeSingle();

      if (error) {
        throw error;
      }

      setSettings(data ? (data as FestivalSettings) : null);
    } catch (error) {
      console.error('Error fetching festival settings:', error);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (updates: Partial<FestivalSettings>) => {
    if (!settings?.id) return { success: false };
    
    const { error } = await supabase
      .from('festival_settings')
      .update(updates)
      .eq('id', settings.id);

    if (!error) {
      setSettings(prev => prev ? { ...prev, ...updates } : null);
      return { success: true };
    }
    return { success: false, error };
  };

  // Check if theme should be active (considering auto-enable by date)
  const isThemeActive = (): boolean => {
    if (!settings) return false;
    if (!settings.is_enabled) return false;
    
    if (settings.auto_enable_by_date && settings.start_date && settings.end_date) {
      const now = new Date();
      const start = new Date(settings.start_date);
      const end = new Date(settings.end_date);
      end.setHours(23, 59, 59, 999);
      return now >= start && now <= end;
    }

    return settings.is_enabled;
  };

  return { settings, loading, updateSettings, isThemeActive, refetch: fetchSettings };
};
