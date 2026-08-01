import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ShippingRate {
  serviceable: boolean;
  courier_name?: string;
  rate?: number;
  estimated_days?: number;
  etd?: string | null;
  error?: string;
}

export interface PackageDims {
  length?: number;
  breadth?: number;
  height?: number;
}

const cache = new Map<string, ShippingRate>();

export const fetchShippingRate = async (
  pincode: string,
  weight = 0.5,
  dims: PackageDims = {}
): Promise<ShippingRate> => {
  const key = `${pincode}-${weight}-${dims.length || 0}x${dims.breadth || 0}x${dims.height || 0}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const { data, error } = await supabase.functions.invoke('shiprocket', {
    body: {
      action: 'serviceability',
      delivery_pincode: pincode,
      weight,
      length: dims.length,
      breadth: dims.breadth,
      height: dims.height,
    },
  });

  if (error) {
    return { serviceable: false, error: 'Could not fetch live rates' };
  }

  const result: ShippingRate = data?.success
    ? {
        serviceable: true,
        courier_name: data.courier_name,
        rate: data.rate,
        estimated_days: data.estimated_days,
        etd: data.etd,
      }
    : { serviceable: false, error: data?.error || 'Delivery not available for this pincode' };

  cache.set(key, result);
  return result;
};

/** Live Shiprocket rate + ETA for a pincode (auto-fetches on valid 6-digit pincode) */
export const useShippingRate = (
  pincode?: string,
  weight = 0.5,
  auto = true,
  dims: PackageDims = {}
) => {
  const [rate, setRate] = useState<ShippingRate | null>(null);
  const [loading, setLoading] = useState(false);
  const reqRef = useRef(0);
  const dimKey = `${dims.length || 0}x${dims.breadth || 0}x${dims.height || 0}`;

  const check = useCallback(
    async (pin?: string) => {
      const target = (pin ?? pincode ?? '').trim();
      if (!/^\d{6}$/.test(target)) {
        setRate(null);
        return null;
      }
      const id = ++reqRef.current;
      setLoading(true);
      const [length, breadth, height] = dimKey.split('x').map(Number);
      const result = await fetchShippingRate(target, weight, {
        length: length || undefined,
        breadth: breadth || undefined,
        height: height || undefined,
      });
      if (reqRef.current === id) {
        setRate(result);
        setLoading(false);
      }
      return result;
    },
    [pincode, weight, dimKey]
  );

  useEffect(() => {
    if (!auto) return;
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      setRate(null);
      return;
    }
    const t = setTimeout(() => { check(pincode); }, 400);
    return () => clearTimeout(t);
  }, [pincode, weight, auto, check]);

  return { rate, loading, check };
};

/** Working-day aware delivery date string from number of days */
export const formatDeliveryDate = (days: number) => {
  const d = new Date();
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) added++;
  }
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};
