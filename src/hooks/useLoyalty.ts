import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LoyaltyBalance {
  user_id: string;
  total_earned: number;
  total_redeemed: number;
  current_balance: number;
  tier: string;
  updated_at: string;
}

interface LoyaltySettings {
  enabled: boolean;
  points_per_rupee: number;
  min_redeem_points: number;
  points_value_rupees: number;
  signup_bonus: number;
  review_bonus: number;
  silver_threshold: number;
  gold_threshold: number;
  platinum_threshold: number;
}

interface PointsHistory {
  id: string;
  points: number;
  type: string;
  source: string;
  description: string | null;
  created_at: string;
}

export const useLoyalty = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<LoyaltyBalance | null>(null);
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [history, setHistory] = useState<PointsHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('loyalty_settings')
        .select('*')
        .eq('id', 'default')
        .single();
      if (data) setSettings(data as unknown as LoyaltySettings);
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!user) {
      setBalance(null);
      setHistory([]);
      setLoading(false);
      return;
    }

    const fetchBalance = async () => {
      const [balRes, histRes] = await Promise.all([
        supabase.from('loyalty_balances').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('loyalty_points').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      ]);
      if (balRes.data) setBalance(balRes.data as unknown as LoyaltyBalance);
      if (histRes.data) setHistory(histRes.data as unknown as PointsHistory[]);
      setLoading(false);
    };
    fetchBalance();
  }, [user]);

  const pointsValue = (points: number) => {
    if (!settings) return 0;
    return Math.round(points * settings.points_value_rupees * 100) / 100;
  };

  const canRedeem = balance && settings ? balance.current_balance >= settings.min_redeem_points : false;

  return { balance, settings, history, loading, pointsValue, canRedeem };
};
