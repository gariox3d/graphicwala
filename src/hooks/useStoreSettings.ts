import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const STORE_SETTINGS_KEY = ['store-settings'] as const;

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

const DEFAULTS: StoreSettings = {
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
};

const fetchStoreSettings = async (): Promise<StoreSettings> => {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 'default')
    .single();

  if (error || !data) return DEFAULTS;

  return {
    ...DEFAULTS,
    id: data.id,
    default_delivery_charge: data.default_delivery_charge ?? 0,
    store_pickup_enabled: data.store_pickup_enabled ?? true,
    pickup_address: data.pickup_address ?? DEFAULTS.pickup_address,
    announcement_text: data.announcement_text,
    announcement_enabled: data.announcement_enabled ?? false,
    delivery_time_text: data.delivery_time_text ?? DEFAULTS.delivery_time_text,
    delivery_disclaimer_enabled: data.delivery_disclaimer_enabled ?? true,
    whatsapp_support_number: data.whatsapp_support_number ?? DEFAULTS.whatsapp_support_number,
    return_policy_enabled: data.return_policy_enabled ?? true,
    return_window_hours: data.return_window_hours ?? 48,
    bulk_discount_enabled: data.bulk_discount_enabled ?? false,
    bulk_discount_min_qty: data.bulk_discount_min_qty ?? 2,
    bulk_discount_percent: data.bulk_discount_percent ?? 10,
    social_proof_enabled: (data as any).social_proof_enabled ?? false,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
};

/**
 * Shared, cached store settings. Every component that calls this hook reads the
 * same React Query entry, so the settings row is fetched once per session
 * instead of once per component (product cards used to trigger one call each).
 */
export const useStoreSettings = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: STORE_SETTINGS_KEY,
    queryFn: fetchStoreSettings,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  });

  const updateSettings = async (updates: Partial<StoreSettings>) => {
    try {
      const { error: updateError } = await supabase
        .from('store_settings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', 'default');

      if (updateError) throw updateError;
      await queryClient.invalidateQueries({ queryKey: STORE_SETTINGS_KEY });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    settings: data ?? null,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refetch,
    updateSettings,
  };
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
