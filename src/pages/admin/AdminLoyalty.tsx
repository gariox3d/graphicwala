import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Coins, Save, Loader2, Users, TrendingUp, Plus, Minus, Send } from 'lucide-react';
import { useAdminDraftState } from '@/hooks/useAdminDraftState';

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

interface CustomerOption {
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
}

const AdminLoyalty = () => {
  const createInitialSettings = useCallback((): LoyaltySettings | null => null, []);
  const {
    state: settings,
    setState: setSettings,
    initializeFromServer,
    clearDraft,
  } = useAdminDraftState<LoyaltySettings | null>('admin:loyalty-settings:draft:v1', createInitialSettings);

  const [stats, setStats] = useState<LoyaltyStats>({ total_users: 0, total_points_earned: 0, total_points_redeemed: 0 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Manual points state
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsType, setPointsType] = useState<'earned' | 'redeemed'>('earned');
  const [pointsDescription, setPointsDescription] = useState('');
  const [sendingPoints, setSendingPoints] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [settingsRes, balancesRes, customersRes] = await Promise.all([
        supabase.from('loyalty_settings').select('*').eq('id', 'default').single(),
        supabase.from('loyalty_balances').select('*'),
        supabase.rpc('get_all_customers'),
      ]);

      if (settingsRes.data) initializeFromServer(settingsRes.data as unknown as LoyaltySettings);
      if (balancesRes.data) {
        const balances = balancesRes.data as any[];
        setStats({
          total_users: balances.length,
          total_points_earned: balances.reduce((s, b) => s + (b.total_earned || 0), 0),
          total_points_redeemed: balances.reduce((s, b) => s + (b.total_redeemed || 0), 0),
        });
      }
      if (customersRes.data) setCustomers(customersRes.data as CustomerOption[]);
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
    else {
      clearDraft();
      toast.success('Loyalty settings saved!');
    }
    setSaving(false);
  };

  const handleSendPoints = async () => {
    if (!selectedCustomer) { toast.error('Please select a customer'); return; }
    const pts = parseInt(pointsAmount);
    if (!pts || pts <= 0) { toast.error('Enter a valid points amount'); return; }
    if (!pointsDescription.trim()) { toast.error('Enter a description/reason'); return; }

    setSendingPoints(true);
    try {
      const { error } = await supabase.rpc('add_loyalty_points', {
        p_user_id: selectedCustomer,
        p_points: pts,
        p_type: pointsType,
        p_source: 'admin_manual',
        p_description: pointsDescription.trim(),
      });

      if (error) throw error;

      const customer = customers.find(c => c.user_id === selectedCustomer);
      toast.success(`${pointsType === 'earned' ? 'Added' : 'Deducted'} ${pts} points ${pointsType === 'earned' ? 'to' : 'from'} ${customer?.full_name || 'customer'}`);
      setSelectedCustomer('');
      setPointsAmount('');
      setPointsDescription('');

      // Refresh stats
      const { data: balancesData } = await supabase.from('loyalty_balances').select('*');
      if (balancesData) {
        const balances = balancesData as any[];
        setStats({
          total_users: balances.length,
          total_points_earned: balances.reduce((s, b) => s + (b.total_earned || 0), 0),
          total_points_redeemed: balances.reduce((s, b) => s + (b.total_redeemed || 0), 0),
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send points');
    } finally {
      setSendingPoints(false);
    }
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

        {/* Manual Points Grant */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Manual Points — Give or Deduct
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.user_id} value={c.user_id}>
                        {c.full_name || c.email || c.phone || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={pointsType} onValueChange={(v) => setPointsType(v as 'earned' | 'redeemed')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="earned">
                      <span className="flex items-center gap-1"><Plus className="h-3 w-3 text-green-600" /> Add Points</span>
                    </SelectItem>
                    <SelectItem value="redeemed">
                      <span className="flex items-center gap-1"><Minus className="h-3 w-3 text-red-500" /> Deduct Points</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Points</Label>
                <Input
                  type="number"
                  placeholder="e.g. 100"
                  value={pointsAmount}
                  onChange={(e) => setPointsAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Reason</Label>
                <Input
                  placeholder="e.g. Bonus reward"
                  value={pointsDescription}
                  onChange={(e) => setPointsDescription(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleSendPoints} disabled={sendingPoints} className="w-full sm:w-auto">
              {sendingPoints ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {pointsType === 'earned' ? 'Give Points' : 'Deduct Points'}
            </Button>
          </CardContent>
        </Card>

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
                  <Input type="number" value={settings.points_per_rupee} onChange={(e) => setSettings({ ...settings, points_per_rupee: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Point Value (₹)</Label>
                  <Input type="number" step="0.01" value={settings.points_value_rupees} onChange={(e) => setSettings({ ...settings, points_value_rupees: Number(e.target.value) })} />
                  <p className="text-xs text-muted-foreground">1 point = ₹{settings.points_value_rupees}</p>
                </div>
                <div className="space-y-2">
                  <Label>Min Points to Redeem</Label>
                  <Input type="number" value={settings.min_redeem_points} onChange={(e) => setSettings({ ...settings, min_redeem_points: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Signup Bonus Points</Label>
                  <Input type="number" value={settings.signup_bonus} onChange={(e) => setSettings({ ...settings, signup_bonus: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Review Bonus Points</Label>
                  <Input type="number" value={settings.review_bonus} onChange={(e) => setSettings({ ...settings, review_bonus: Number(e.target.value) })} />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Tier Thresholds (Total Points Earned)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>🥈 Silver Threshold</Label>
                    <Input type="number" value={settings.silver_threshold} onChange={(e) => setSettings({ ...settings, silver_threshold: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>🥇 Gold Threshold</Label>
                    <Input type="number" value={settings.gold_threshold} onChange={(e) => setSettings({ ...settings, gold_threshold: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>💎 Platinum Threshold</Label>
                    <Input type="number" value={settings.platinum_threshold} onChange={(e) => setSettings({ ...settings, platinum_threshold: Number(e.target.value) })} />
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
