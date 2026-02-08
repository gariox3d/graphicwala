import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, X, Check, Loader2 } from 'lucide-react';

export interface AppliedCoupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount_amount: number | null;
  discountAmount: number;
}

interface CouponInputProps {
  orderTotal: number;
  onApply: (coupon: AppliedCoupon | null) => void;
  appliedCoupon: AppliedCoupon | null;
}

const CouponInput = ({ orderTotal, onApply, appliedCoupon }: CouponInputProps) => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateDiscount = (coupon: any, total: number): number => {
    let discount = 0;
    if (coupon.discount_type === 'percentage') {
      discount = (total * coupon.discount_value) / 100;
      if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
        discount = coupon.max_discount_amount;
      }
    } else {
      discount = coupon.discount_value;
    }
    return Math.min(discount, total);
  };

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch coupon
      const { data: coupon, error: fetchError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase().trim())
        .eq('is_active', true)
        .single();

      if (fetchError || !coupon) {
        setError('Invalid coupon code');
        setLoading(false);
        return;
      }

      // Check expiry
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        setError('This coupon has expired');
        setLoading(false);
        return;
      }

      // Check usage limit
      if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
        setError('This coupon has reached its usage limit');
        setLoading(false);
        return;
      }

      // Check minimum order amount
      if (coupon.min_order_amount && orderTotal < coupon.min_order_amount) {
        setError(`Minimum order of ₹${coupon.min_order_amount} required`);
        setLoading(false);
        return;
      }

      // Check if user already used this coupon
      if (user) {
        const { data: usage } = await supabase
          .from('coupon_usage')
          .select('id')
          .eq('coupon_id', coupon.id)
          .eq('user_id', user.id);

        if (usage && usage.length > 0) {
          setError('You have already used this coupon');
          setLoading(false);
          return;
        }
      }

      const discountAmount = calculateDiscount(coupon, orderTotal);

      onApply({
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type as 'percentage' | 'fixed',
        discount_value: coupon.discount_value,
        max_discount_amount: coupon.max_discount_amount,
        discountAmount,
      });

      setCode('');
    } catch (err) {
      setError('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  const handleRemove = () => {
    onApply(null);
    setError('');
  };

  if (appliedCoupon) {
    return (
      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Coupon applied!
            </span>
            <Badge variant="outline" className="font-mono text-green-700 border-green-300">
              {appliedCoupon.code}
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={handleRemove} className="h-7 px-2 text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-green-600 mt-1">
          You save ₹{appliedCoupon.discountAmount.toLocaleString()}
          {appliedCoupon.discount_type === 'percentage' && ` (${appliedCoupon.discount_value}% off)`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder="Enter coupon code"
            className="pl-9 uppercase font-mono"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <Button
          variant="outline"
          onClick={handleApply}
          disabled={loading || !code.trim()}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default CouponInput;
