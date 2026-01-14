import { useState, useEffect, useCallback } from 'react';
import { useShiprocket } from '@/hooks/useShiprocket';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { Loader2, Truck, AlertCircle, Package, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShippingProduct {
  weight_kg: number;
  quantity: number;
}

interface ShippingRateCalculatorProps {
  products: ShippingProduct[];
  deliveryPincode: string;
  onPincodeChange: (pincode: string) => void;
  onRateCalculated: (rate: {
    shippingCharge: number;
    estimatedDays: number;
    estimatedDeliveryDate: string;
    courierName: string;
    available: boolean;
  } | null) => void;
  autoCalculate?: boolean;
}

const ShippingRateCalculator = ({
  products,
  deliveryPincode,
  onPincodeChange,
  onRateCalculated,
  autoCalculate = true,
}: ShippingRateCalculatorProps) => {
  const { settings } = useStoreSettings();
  const { loading, error, data, getShippingRates, reset } = useShiprocket();
  const [lastCalculatedPincode, setLastCalculatedPincode] = useState('');

  const calculateRates = useCallback(async () => {
    if (!settings?.shiprocket_enabled || !settings?.pickup_pincode || !deliveryPincode) {
      return;
    }

    if (deliveryPincode.length !== 6) {
      return;
    }

    // Avoid recalculating for the same pincode
    if (deliveryPincode === lastCalculatedPincode) {
      return;
    }

    setLastCalculatedPincode(deliveryPincode);
    const result = await getShippingRates(settings.pickup_pincode, deliveryPincode, products);
    
    if (result) {
      onRateCalculated({
        shippingCharge: result.shippingCharge,
        estimatedDays: result.estimatedDays,
        estimatedDeliveryDate: result.estimatedDeliveryDate,
        courierName: result.courierName,
        available: true,
      });
    } else {
      onRateCalculated(null);
    }
  }, [settings, deliveryPincode, products, lastCalculatedPincode, getShippingRates, onRateCalculated]);

  // Auto-calculate when pincode changes
  useEffect(() => {
    if (autoCalculate && settings?.shiprocket_enabled && deliveryPincode.length === 6) {
      const timer = setTimeout(() => {
        calculateRates();
      }, 500); // Debounce
      return () => clearTimeout(timer);
    }
  }, [deliveryPincode, autoCalculate, settings?.shiprocket_enabled, calculateRates]);

  // Reset when Shiprocket is disabled
  useEffect(() => {
    if (!settings?.shiprocket_enabled) {
      reset();
      onRateCalculated(null);
    }
  }, [settings?.shiprocket_enabled, reset, onRateCalculated]);

  // If Shiprocket is not enabled, don't show anything
  if (!settings?.shiprocket_enabled) {
    return null;
  }

  return (
    <div className="space-y-3">
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Calculating shipping rates...
        </div>
      )}

      {error && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">Delivery unavailable</p>
              <p className="text-xs text-amber-600 mt-1">
                {settings?.shiprocket_fallback_message || 'Delivery estimate unavailable for this location'}
              </p>
            </div>
          </div>
        </div>
      )}

      {data && data.available && !loading && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-green-700">
            <Truck className="h-4 w-4" />
            <span className="font-medium">Delivery Available</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-green-600" />
              <span>Shipping: ₹{data.shippingCharge}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-600" />
              <span>{data.estimatedDays} days delivery</span>
            </div>
          </div>
          <p className="text-xs text-green-600">
            via {data.courierName} • Est. delivery: {new Date(data.estimatedDeliveryDate).toLocaleDateString('en-IN', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short' 
            })}
          </p>
        </div>
      )}

      {!autoCalculate && deliveryPincode.length === 6 && !data && !loading && !error && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={calculateRates}
          className="w-full"
        >
          <Truck className="h-4 w-4 mr-2" />
          Check Delivery & Shipping
        </Button>
      )}
    </div>
  );
};

export default ShippingRateCalculator;
