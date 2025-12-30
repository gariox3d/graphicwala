import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StoreSettings {
  id: string;
  default_delivery_charge: number;
  store_pickup_enabled: boolean;
  pickup_address: string;
  announcement_text: string | null;
  announcement_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export const useStoreSettings = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (fetchError) throw fetchError;
      setSettings(data as StoreSettings);
    } catch (err: any) {
      console.error('Error fetching store settings:', err);
      setError(err.message);
      // Set default values if settings don't exist
      setSettings({
        id: 'default',
        default_delivery_charge: 50,
        store_pickup_enabled: true,
        pickup_address: 'Graphic Wala Shop, Main Road',
        announcement_text: null,
        announcement_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<StoreSettings>) => {
    try {
      const { error: updateError } = await supabase
        .from('store_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', 'default');

      if (updateError) throw updateError;
      await fetchSettings();
      return { success: true };
    } catch (err: any) {
      console.error('Error updating store settings:', err);
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, error, refetch: fetchSettings, updateSettings };
};

export const getProductDeliveryCharge = (
  productDeliveryCharge: number | null | undefined,
  defaultDeliveryCharge: number
): number => {
  if (productDeliveryCharge !== null && productDeliveryCharge !== undefined) {
    return productDeliveryCharge;
  }
  return defaultDeliveryCharge;
};
