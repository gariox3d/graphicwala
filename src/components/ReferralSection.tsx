import { useReferral } from '@/hooks/useReferral';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Copy, Share2, Users, IndianRupee, Loader2 } from 'lucide-react';
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
          Refer & Earn ₹50
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Share your referral code with friends. They get ₹50 off on their first order, and you earn ₹50 too! 🎁
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
            <IndianRupee className="h-4 w-4 mx-auto mb-1 text-green-600" />
            <p className="text-xl font-bold text-green-600">₹{referralCode.total_earnings}</p>
            <p className="text-[11px] text-muted-foreground">Earned</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralSection;
