import { useLoyalty } from '@/hooks/useLoyalty';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Gift, Award } from 'lucide-react';

const tierConfig: Record<string, { color: string; label: string; icon: string }> = {
  bronze: { color: 'bg-amber-700 text-white', label: 'Bronze', icon: '🥉' },
  silver: { color: 'bg-gray-400 text-white', label: 'Silver', icon: '🥈' },
  gold: { color: 'bg-yellow-500 text-white', label: 'Gold', icon: '🥇' },
  platinum: { color: 'bg-purple-600 text-white', label: 'Platinum', icon: '💎' },
};

const LoyaltyWidget = () => {
  const { balance, settings, history, loading, pointsValue } = useLoyalty();

  if (loading || !settings?.enabled) return null;

  const tier = tierConfig[balance?.tier || 'bronze'] || tierConfig.bronze;

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
          <p className="text-3xl font-bold text-primary">{balance?.current_balance || 0}</p>
          <p className="text-sm text-muted-foreground">
            Points = ₹{pointsValue(balance?.current_balance || 0)}
          </p>
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

        {/* Earn info */}
        <p className="text-xs text-muted-foreground text-center">
          Earn {settings.points_per_rupee} point per ₹1 spent • Min {settings.min_redeem_points} points to redeem
        </p>

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
