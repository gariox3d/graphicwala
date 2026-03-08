import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StoreSettings {
  id: string;
  default_delivery_charge: number;
  store_pickup_enabled: boolean;
  pickup_address: string;
  announcement_text: string | null;
  announcement_enabled: boolean;
  delivery_time_text: string;
  delivery_disclaimer_enabled: boolean;
  // Return policy settings
  whatsapp_support_number: string;
  return_policy_enabled: boolean;
  return_window_hours: number;
  // Bulk discount settings
  bulk_discount_enabled: boolean;
  bulk_discount_min_qty: number;
  bulk_discount_percent: number;
  // Social proof
  social_proof_enabled: boolean;
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
      
      // Map database fields to our interface
      setSettings({
        id: data.id,
        default_delivery_charge: data.default_delivery_charge ?? 0,
        store_pickup_enabled: data.store_pickup_enabled ?? true,
        pickup_address: data.pickup_address ?? 'Graphic Wala Shop, Main Road',
        announcement_text: data.announcement_text,
        announcement_enabled: data.announcement_enabled ?? false,
        delivery_time_text: data.delivery_time_text ?? '🚚 Estimated Delivery: 5–7 working days\n\nOrders are dispatched after quality checks.\nIn rare cases, delivery may take slightly longer due to logistics or regional delays.',
        delivery_disclaimer_enabled: data.delivery_disclaimer_enabled ?? true,
        // Return policy settings
        whatsapp_support_number: data.whatsapp_support_number ?? '+916207142994',
        return_policy_enabled: data.return_policy_enabled ?? true,
        return_window_hours: data.return_window_hours ?? 48,
        bulk_discount_enabled: data.bulk_discount_enabled ?? false,
        bulk_discount_min_qty: data.bulk_discount_min_qty ?? 2,
        bulk_discount_percent: data.bulk_discount_percent ?? 10,
        social_proof_enabled: (data as any).social_proof_enabled ?? false,
        created_at: data.created_at,
        updated_at: data.updated_at,
      });
    } catch (err: any) {
      console.error('Error fetching store settings:', err);
      setError(err.message);
      // Set default values if settings don't exist
      setSettings({
        id: 'default',
        default_delivery_charge: 0,
        store_pickup_enabled: true,
        pickup_address: 'Graphic Wala Shop, Main Road',
        announcement_text: null,
        announcement_enabled: false,
        delivery_time_text: '🚚 Estimated Delivery: 5–7 working days\n\nOrders are dispatched after quality checks.\nIn rare cases, delivery may take slightly longer due to logistics or regional delays.',
        delivery_disclaimer_enabled: true,
        whatsapp_support_number: '+916207142994',
        return_policy_enabled: true,
        return_window_hours: 48,
        bulk_discount_enabled: false,
        bulk_discount_min_qty: 2,
        bulk_discount_percent: 10,
        social_proof_enabled: false,
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
