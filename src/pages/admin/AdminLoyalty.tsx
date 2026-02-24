import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Coins, Save, Loader2, Users, TrendingUp } from 'lucide-react';

interface LoyaltySettings {
  id: string;
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

interface LoyaltyStats {
  total_users: number;
  total_points_earned: number;
  total_points_redeemed: number;
}

const AdminLoyalty = () => {
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [stats, setStats] = useState<LoyaltyStats>({ total_users: 0, total_points_earned: 0, total_points_redeemed: 0 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [settingsRes, balancesRes] = await Promise.all([
        supabase.from('loyalty_settings').select('*').eq('id', 'default').single(),
        supabase.from('loyalty_balances').select('*'),
      ]);

      if (settingsRes.data) setSettings(settingsRes.data as unknown as LoyaltySettings);
      if (balancesRes.data) {
        const balances = balancesRes.data as any[];
        setStats({
          total_users: balances.length,
          total_points_earned: balances.reduce((s, b) => s + (b.total_earned || 0), 0),
          total_points_redeemed: balances.reduce((s, b) => s + (b.total_redeemed || 0), 0),
        });
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from('loyalty_settings')
      .update({
        enabled: settings.enabled,
        points_per_rupee: settings.points_per_rupee,
        min_redeem_points: settings.min_redeem_points,
        points_value_rupees: settings.points_value_rupees,
        signup_bonus: settings.signup_bonus,
        review_bonus: settings.review_bonus,
        silver_threshold: settings.silver_threshold,
        gold_threshold: settings.gold_threshold,
        platinum_threshold: settings.platinum_threshold,
      })
      .eq('id', 'default');

    if (error) toast.error('Failed to save settings');
    else toast.success('Loyalty settings saved!');
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Coins className="h-6 w-6 text-yellow-500" />
              Loyalty Points Program
            </h1>
            <p className="text-muted-foreground">Manage rewards and customer loyalty</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Settings
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.total_users}</p>
                  <p className="text-sm text-muted-foreground">Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total_points_earned.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Points Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Coins className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total_points_redeemed.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Points Redeemed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        {settings && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Program Settings
                <div className="flex items-center gap-2">
                  <Label htmlFor="enabled">Enable Program</Label>
                  <Switch
                    id="enabled"
                    checked={settings.enabled}
                    onCheckedChange={(v) => setSettings({ ...settings, enabled: v })}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Points per ₹1 Spent</Label>
                  <Input
                    type="number"
                    value={settings.points_per_rupee}
                    onChange={(e) => setSettings({ ...settings, points_per_rupee: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Point Value (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.points_value_rupees}
                    onChange={(e) => setSettings({ ...settings, points_value_rupees: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">1 point = ₹{settings.points_value_rupees}</p>
                </div>
                <div className="space-y-2">
                  <Label>Min Points to Redeem</Label>
                  <Input
                    type="number"
                    value={settings.min_redeem_points}
                    onChange={(e) => setSettings({ ...settings, min_redeem_points: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Signup Bonus Points</Label>
                  <Input
                    type="number"
                    value={settings.signup_bonus}
                    onChange={(e) => setSettings({ ...settings, signup_bonus: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Review Bonus Points</Label>
                  <Input
                    type="number"
                    value={settings.review_bonus}
                    onChange={(e) => setSettings({ ...settings, review_bonus: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Tier Thresholds (Total Points Earned)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>🥈 Silver Threshold</Label>
                    <Input
                      type="number"
                      value={settings.silver_threshold}
                      onChange={(e) => setSettings({ ...settings, silver_threshold: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>🥇 Gold Threshold</Label>
                    <Input
                      type="number"
                      value={settings.gold_threshold}
                      onChange={(e) => setSettings({ ...settings, gold_threshold: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>💎 Platinum Threshold</Label>
                    <Input
                      type="number"
                      value={settings.platinum_threshold}
                      onChange={(e) => setSettings({ ...settings, platinum_threshold: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLoyalty;
