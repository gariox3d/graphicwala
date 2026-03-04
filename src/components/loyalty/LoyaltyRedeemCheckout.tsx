import { useState } from 'react';
import { useLoyalty } from '@/hooks/useLoyalty';
import { Button } from '@/components/ui/button';
import { Coins, Check, X } from 'lucide-react';

interface LoyaltyRedeemCheckoutProps {
  onApply: (discount: number) => void;
  onRemove: () => void;
  applied: boolean;
}

const LoyaltyRedeemCheckout = ({ onApply, onRemove, applied }: LoyaltyRedeemCheckoutProps) => {
  const { balance, settings, canRedeem, pointsValue } = useLoyalty();

  if (!settings?.enabled || !balance) return null;

  const currentBalance = balance.current_balance;
  const redeemValue = pointsValue(currentBalance);

  if (!canRedeem && !applied) return null;

  return (
    <div className="border rounded-lg p-3 space-y-2 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
      <div className="flex items-center gap-2">
        <Coins className="h-4 w-4 text-yellow-600" />
        <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
          Loyalty Points
        </span>
      </div>

      {applied ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400">
            <Check className="h-4 w-4" />
            <span>₹{redeemValue} discount applied!</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-destructive hover:text-destructive"
            onClick={onRemove}
          >
            <X className="h-3 w-3 mr-1" />
            Remove
          </Button>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            You have <strong>{currentBalance} points</strong> (₹{redeemValue}). Use them for a discount!
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-yellow-300 text-yellow-800 hover:bg-yellow-100 dark:border-yellow-700 dark:text-yellow-300 dark:hover:bg-yellow-900"
            onClick={() => onApply(redeemValue)}
          >
            <Coins className="h-4 w-4 mr-1" />
            Use {currentBalance} Points (₹{redeemValue} off)
          </Button>
        </>
      )}
    </div>
  );
};

export default LoyaltyRedeemCheckout;
