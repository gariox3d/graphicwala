import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ShiprocketProduct {
  weight_kg: number;
  quantity: number;
}

interface ShippingRate {
  available: boolean;
  shippingCharge: number;
  estimatedDays: number;
  estimatedDeliveryDate: string;
  courierName: string;
  totalWeight: number;
  allOptions?: Array<{
    name: string;
    rate: number;
    estimatedDays: number;
    etd: string;
  }>;
}

interface ShiprocketResult {
  loading: boolean;
  error: string | null;
  data: ShippingRate | null;
}

export const useShiprocket = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ShippingRate | null>(null);

  const getShippingRates = useCallback(async (
    pickupPincode: string,
    deliveryPincode: string,
    products: ShiprocketProduct[]
  ): Promise<ShippingRate | null> => {
    if (!pickupPincode || !deliveryPincode) {
      setError('Missing pincode information');
      return null;
    }

    // Validate pincode format (6 digits for India)
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(deliveryPincode)) {
      setError('Please enter a valid 6-digit pincode');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: response, error: funcError } = await supabase.functions.invoke('shiprocket', {
        body: {
          action: 'get_rates',
          pickupPincode,
          deliveryPincode,
          products,
        },
      });

      if (funcError) {
        throw new Error(funcError.message || 'Failed to get shipping rates');
      }

      if (!response.success || !response.available) {
        const errorMsg = response.error || 'Delivery not available for this location';
        setError(errorMsg);
        setData(null);
        return null;
      }

      const rateData: ShippingRate = {
        available: true,
        shippingCharge: response.shippingCharge,
        estimatedDays: response.estimatedDays,
        estimatedDeliveryDate: response.estimatedDeliveryDate,
        courierName: response.courierName,
        totalWeight: response.totalWeight,
        allOptions: response.allOptions,
      };

      setData(rateData);
      setError(null);
      return rateData;
    } catch (err: any) {
      console.error('Shiprocket error:', err);
      setError(err.message || 'Failed to fetch shipping rates');
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkServiceability = useCallback(async (
    pickupPincode: string,
    deliveryPincode: string,
    weight: number = 0.5
  ): Promise<boolean> => {
    try {
      const { data: response } = await supabase.functions.invoke('shiprocket', {
        body: {
          action: 'check_serviceability',
          pickupPincode,
          deliveryPincode,
          weight,
        },
      });

      return response?.available || false;
    } catch {
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    getShippingRates,
    checkServiceability,
    reset,
  };
};
