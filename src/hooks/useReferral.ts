import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ReferralCode {
  id: string;
  code: string;
  total_referrals: number;
  total_earnings: number;
  created_at: string;
}

interface ReferralReward {
  id: string;
  referrer_reward: number;
  referee_reward: number;
  status: string;
  created_at: string;
}

export const useReferral = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReferralData = useCallback(async () => {
    if (!user) {
      setReferralCode(null);
      setRewards([]);
      setLoading(false);
      return;
    }

    try {
      const [codeRes, rewardsRes] = await Promise.all([
        supabase
          .from('referral_codes')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('referral_rewards')
          .select('*')
          .or(`referrer_id.eq.${user.id},referee_id.eq.${user.id}`)
          .order('created_at', { ascending: false }),
      ]);

      if (codeRes.data) setReferralCode(codeRes.data as ReferralCode);
      if (rewardsRes.data) setRewards(rewardsRes.data as ReferralReward[]);
    } catch (err) {
      console.error('Error fetching referral data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReferralData();
  }, [fetchReferralData]);

  const copyReferralLink = useCallback(() => {
    if (!referralCode) return;
    const link = `${window.location.origin}/auth?ref=${referralCode.code}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied! 🎉');
  }, [referralCode]);

  const shareReferral = useCallback(() => {
    if (!referralCode) return;
    const link = `${window.location.origin}/auth?ref=${referralCode.code}`;
    const text = `Hey! Use my referral code ${referralCode.code} to get ₹50 off on your first order at Graphic Wala! 🎁`;
    
    if (navigator.share) {
      navigator.share({ title: 'Graphic Wala Referral', text, url: link });
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + '\n' + link)}`;
      window.open(whatsappUrl, '_blank');
    }
  }, [referralCode]);

  return { referralCode, rewards, loading, copyReferralLink, shareReferral, refetch: fetchReferralData };
};
