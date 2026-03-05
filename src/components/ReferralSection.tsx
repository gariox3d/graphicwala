import { useReferral } from '@/hooks/useReferral';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Copy, Share2, Users, Star, Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ReferralSection = () => {
  const { referralCode, rewards, loading, copyReferralLink, shareReferral } = useReferral();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!referralCode) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Gift className="h-5 w-5 text-primary" />
          Refer & Earn Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Share your referral code with friends. Both of you earn <strong>100 bonus points</strong> that can be redeemed as discount! 🎁
        </p>

        {/* Referral Code Display */}
        <div className="bg-card border-2 border-dashed border-primary/30 rounded-lg p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Your Referral Code</p>
          <p className="text-2xl font-bold tracking-widest text-primary">{referralCode.code}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={copyReferralLink}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy Link
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={shareReferral}
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
        </div>

        <Separator />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-lg p-3 text-center border">
            <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
            <p className="text-xl font-bold">{referralCode.total_referrals}</p>
            <p className="text-[11px] text-muted-foreground">Referrals</p>
          </div>
          <div className="bg-card rounded-lg p-3 text-center border">
            <Star className="h-4 w-4 mx-auto mb-1 text-amber-500" />
            <p className="text-xl font-bold text-amber-600">{referralCode.total_earnings}</p>
            <p className="text-[11px] text-muted-foreground">Points Earned</p>
          </div>
        </div>

        <Separator />

        {/* How it works */}
        <div className="space-y-2 bg-muted/30 rounded-lg p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">How It Works</p>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0 mt-0.5">1</div>
              <p className="text-xs text-muted-foreground"><strong className="text-foreground">Share</strong> your code or link with friends via WhatsApp, Instagram etc.</p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0 mt-0.5">2</div>
              <p className="text-xs text-muted-foreground"><strong className="text-foreground">Friend signs up</strong> using your code and gets <strong>100 bonus points</strong></p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0 mt-0.5">3</div>
              <p className="text-xs text-muted-foreground"><strong className="text-foreground">You earn 100 points</strong> too! Use points as discount on checkout</p>
            </div>
          </div>
        </div>

        {/* Recent Referral Activity */}
        {rewards.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Recent Referrals</p>
              {rewards.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm bg-muted/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    <span className="text-xs text-muted-foreground">
                      {r.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-amber-600">+{r.referrer_reward} pts</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Tip */}
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 border border-green-200 dark:border-green-800">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">💡 Pro Tip</p>
          <p className="text-xs text-green-600 dark:text-green-400">
            Share on WhatsApp groups & Instagram stories for maximum referrals. No limit on how many friends you can refer!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralSection;
