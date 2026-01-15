import { useState, useEffect, useRef } from 'react';
import { MapPin, Truck, Package, Loader2, AlertCircle, CheckCircle2, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useShiprocket } from '@/hooks/useShiprocket';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useAuth } from '@/contexts/AuthContext';

interface ShippingEstimatorProps {
  productWeight?: number;
  quantity: number;
  onShippingCalculated?: (charge: number, estimatedDays: number, deliveryDate: string) => void;
  className?: string;
}

const ShippingEstimator = ({
  productWeight = 0.5,
  quantity,
  onShippingCalculated,
  className = ''
}: ShippingEstimatorProps) => {
  const { profile } = useAuth();
  const [pincode, setPincode] = useState('');
  const [hasChecked, setHasChecked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { loading, error, data, getShippingRates, reset } = useShiprocket();
  const { settings, loading: settingsLoading } = useStoreSettings();
  const initialFetchDone = useRef(false);

  // Auto-load user's pincode from profile
  useEffect(() => {
    if (profile?.pincode && profile.pincode.length === 6 && !pincode) {
      setPincode(profile.pincode);
    }
  }, [profile]);

  // Auto-fetch shipping rates when user has pincode in profile
  useEffect(() => {
    if (
      !initialFetchDone.current &&
      profile?.pincode &&
      profile.pincode.length === 6 &&
      settings?.shiprocket_enabled &&
      !settingsLoading &&
      !loading &&
      !hasChecked
    ) {
      initialFetchDone.current = true;
      handleCheckDelivery(profile.pincode);
    }
  }, [profile?.pincode, settings?.shiprocket_enabled, settingsLoading]);

  // Recalculate when quantity changes and we already have data
  useEffect(() => {
    if (hasChecked && data && pincode.length === 6) {
      handleCheckDelivery(pincode);
    }
  }, [quantity]);

  // Notify parent when shipping is calculated
  useEffect(() => {
    if (data && onShippingCalculated) {
      onShippingCalculated(data.shippingCharge, data.estimatedDays, data.estimatedDeliveryDate);
    }
  }, [data, onShippingCalculated]);

  const handleCheckDelivery = async (deliveryPincode?: string) => {
    const pincodeToUse = deliveryPincode || pincode;
    if (!pincodeToUse || pincodeToUse.length !== 6) {
      return;
    }

    if (!settings?.shiprocket_enabled) {
      return;
    }

    const pickupPincode = settings?.pickup_pincode || '800001';
    
    await getShippingRates(pickupPincode, pincodeToUse, [
      { weight_kg: productWeight, quantity }
    ]);
    
    setHasChecked(true);
    setIsEditing(false);
  };

  const handlePincodeChange = (value: string) => {
    const sanitized = value.replace(/\D/g, '').slice(0, 6);
    setPincode(sanitized);
    
    // Reset previous results when pincode changes
    if (hasChecked) {
      reset();
      setHasChecked(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && pincode.length === 6) {
      handleCheckDelivery();
    }
  };

  const handleEditPincode = () => {
    setIsEditing(true);
    reset();
    setHasChecked(false);
  };

  // Show loading state for settings
  if (settingsLoading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading delivery options...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If Shiprocket is not enabled, show a simple message
  if (!settings?.shiprocket_enabled) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="h-4 w-4" />
            <span className="text-sm">
              {settings?.shiprocket_fallback_message || 'Delivery available across India. Shipping calculated at checkout.'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show auto-loading state
  if (profile?.pincode && !hasChecked && !isEditing && loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">
              Checking delivery to {profile.pincode}...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardContent className="pt-6 space-y-4">
        {/* Show pincode input only if editing or no pincode */}
        {(!hasChecked || isEditing || !data) && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              {profile?.pincode && !isEditing ? 'Delivery to Your Address' : 'Check Delivery Availability'}
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter 6-digit pincode"
                value={pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                maxLength={6}
              />
              <Button
                onClick={() => handleCheckDelivery()}
                disabled={loading || pincode.length !== 6}
                size="default"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Check'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Results - show when we have data and not editing */}
        {hasChecked && !isEditing && (
          <div className="space-y-3">
            {error ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">Delivery Unavailable</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Delivery temporarily unavailable for pincode {pincode}. Please try a different address.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={handleEditPincode}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Change Pincode
                    </Button>
                  </div>
                </div>
              </div>
            ) : data ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-3">
                {/* Success Header with Edit option */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      Delivering to {pincode}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleEditPincode}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    Change
                  </Button>
                </div>

                {/* Delivery Details */}
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>Estimated Delivery</span>
                    </div>
                    <span className="font-semibold text-sm">
                      {data.estimatedDays} {data.estimatedDays === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>Shipping Charge</span>
                    </div>
                    <span className="font-semibold text-sm">₹{data.shippingCharge}</span>
                  </div>
                </div>

                {/* Delivery Date Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-green-500/30">
                    <Truck className="h-3 w-3 mr-1" />
                    Delivered by {data.estimatedDeliveryDate}
                  </Badge>
                  {data.courierName && (
                    <span className="text-xs text-muted-foreground">
                      via {data.courierName}
                    </span>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Initial prompt when no check done and not loading */}
        {!hasChecked && !loading && !profile?.pincode && (
          <p className="text-xs text-muted-foreground">
            Enter your pincode to see exact delivery date and shipping charges
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ShippingEstimator;
