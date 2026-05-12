import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ValentineSettings {
  id: string;
  theme_name: string;
  is_enabled: boolean;
  greeting_text: string | null;
  primary_color_override: string | null;
}

export const useValentineSettings = () => {
  const [settings, setSettings] = useState<ValentineSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('festival_settings')
        .select('*')
        .eq('theme_name', 'valentine')
        .maybeSingle();

      if (error) {
        throw error;
      }

      setSettings(data ? (data as ValentineSettings) : null);
    } catch (error) {
      console.error('Error fetching valentine settings:', error);
      setSettings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (updates: Partial<ValentineSettings>) => {
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

  const isThemeActive = (): boolean => {
    if (!settings) return false;
    return settings.is_enabled;
  };

  return { settings, loading, updateSettings, isThemeActive, refetch: fetchSettings };
};