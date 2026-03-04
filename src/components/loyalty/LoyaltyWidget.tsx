import { useLoyalty } from '@/hooks/useLoyalty';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Gift, ShoppingCart, Star, UserPlus, MessageSquare } from 'lucide-react';

const tierConfig: Record<string, { color: string; label: string; icon: string }> = {
  bronze: { color: 'bg-amber-700 text-white', label: 'Bronze', icon: '🥉' },
  silver: { color: 'bg-gray-400 text-white', label: 'Silver', icon: '🥈' },
  gold: { color: 'bg-yellow-500 text-white', label: 'Gold', icon: '🥇' },
  platinum: { color: 'bg-purple-600 text-white', label: 'Platinum', icon: '💎' },
};

const LoyaltyWidget = () => {
  const { balance, settings, history, loading, pointsValue, canRedeem } = useLoyalty();

  if (loading || !settings?.enabled) return null;

  const tier = tierConfig[balance?.tier || 'bronze'] || tierConfig.bronze;
  const currentBalance = balance?.current_balance || 0;
  const minRedeem = settings.min_redeem_points;
  const progressToRedeem = Math.min((currentBalance / minRedeem) * 100, 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Coins className="h-5 w-5 text-yellow-500" />
          Loyalty Points
          <Badge className={`${tier.color} ml-auto text-xs`}>
            {tier.icon} {tier.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance */}
        <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-3xl font-bold text-primary">{currentBalance}</p>
          <p className="text-sm text-muted-foreground">
            Points = ₹{pointsValue(currentBalance)}
          </p>
        </div>

        {/* Redeem Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Redeem Progress</span>
            <span>{currentBalance}/{minRedeem} points</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500" 
              style={{ width: `${progressToRedeem}%` }}
            />
          </div>
          {canRedeem ? (
            <p className="text-xs text-green-600 font-medium">
              ✅ You can redeem ₹{pointsValue(currentBalance)} at checkout!
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Earn {minRedeem - currentBalance} more points to start redeeming
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Earned</p>
              <p className="font-semibold text-sm">{balance?.total_earned || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <Gift className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Redeemed</p>
              <p className="font-semibold text-sm">{balance?.total_redeemed || 0}</p>
            </div>
          </div>
        </div>

        {/* How to Earn */}
        <div className="space-y-2 bg-muted/30 rounded-lg p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">How to Earn Points</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <ShoppingCart className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Every ₹1 spent = <strong>{settings.points_per_rupee} point</strong></span>
            </div>
            {settings.signup_bonus > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <UserPlus className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Sign up bonus: <strong>{settings.signup_bonus} points</strong></span>
              </div>
            )}
            {settings.review_bonus > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <MessageSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Write a review: <strong>{settings.review_bonus} points</strong></span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs">
              <Star className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Use points at checkout for <strong>instant discount</strong></span>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">💡 How to Use Points</p>
          <p className="text-xs text-green-600 dark:text-green-400">
            Once you have {minRedeem}+ points, you'll see a "Use Points" option at checkout. 
            Your points will be converted to ₹ discount automatically!
          </p>
        </div>

        {/* Recent History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">Recent Activity</p>
            {history.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate flex-1">
                  {item.description || item.source}
                </span>
                <span className={`font-medium ${item.type === 'earned' ? 'text-green-600' : 'text-red-500'}`}>
                  {item.type === 'earned' ? '+' : '-'}{item.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoyaltyWidget;
