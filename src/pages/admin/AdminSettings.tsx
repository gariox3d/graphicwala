import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { toast } from 'sonner';
import { Loader2, Settings, Truck, Store, Megaphone } from 'lucide-react';

const AdminSettings = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { settings, loading, updateSettings } = useStoreSettings();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    default_delivery_charge: 50,
    store_pickup_enabled: true,
    pickup_address: 'Graphic Wala Shop, Main Road',
    announcement_text: '',
    announcement_enabled: false,
    delivery_time_text: '🚚 Estimated Delivery: 5–7 working days\n\nOrders are dispatched after quality checks.\nIn rare cases, delivery may take slightly longer due to logistics or regional delays.',
    delivery_disclaimer_enabled: true,
  });

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (settings) {
      setFormData({
        default_delivery_charge: settings.default_delivery_charge,
        store_pickup_enabled: settings.store_pickup_enabled,
        pickup_address: settings.pickup_address,
        announcement_text: settings.announcement_text || '',
        announcement_enabled: settings.announcement_enabled || false,
        delivery_time_text: settings.delivery_time_text || '🚚 Estimated Delivery: 5–7 working days\n\nOrders are dispatched after quality checks.\nIn rare cases, delivery may take slightly longer due to logistics or regional delays.',
        delivery_disclaimer_enabled: settings.delivery_disclaimer_enabled ?? true,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateSettings(formData);
    if (result.success) {
      toast.success('Settings saved successfully');
    } else {
      toast.error('Failed to save settings');
    }
    setSaving(false);
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Settings className="h-7 w-7" />
            Store Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure delivery, shipping, and store options
          </p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          {/* Delivery Settings */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Delivery Settings
              </CardTitle>
              <CardDescription>
                Configure delivery charges and delivery time messaging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="default_delivery_charge">Delivery Charge (₹)</Label>
                <Input
                  id="default_delivery_charge"
                  type="number"
                  min="0"
                  value={formData.default_delivery_charge}
                  onChange={(e) => setFormData({ ...formData, default_delivery_charge: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter delivery charge"
                />
                <p className="text-xs text-muted-foreground">
                  This charge applies to all home delivery orders. Set to 0 for free delivery.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="delivery_time_text">Delivery Time Message</Label>
                <Textarea
                  id="delivery_time_text"
                  value={formData.delivery_time_text}
                  onChange={(e) => setFormData({ ...formData, delivery_time_text: e.target.value })}
                  placeholder="Enter delivery time message"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This message is shown on product pages and checkout. Use line breaks for formatting.
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <Label htmlFor="delivery_disclaimer_enabled">Show Delivery Disclaimer</Label>
                  <p className="text-sm text-muted-foreground">
                    Show additional lines after the main delivery message
                  </p>
                </div>
                <Switch
                  id="delivery_disclaimer_enabled"
                  checked={formData.delivery_disclaimer_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, delivery_disclaimer_enabled: checked })}
                />
              </div>

              <div className="bg-green-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-green-700">
                  <strong>📦 Manual Delivery System Active</strong>
                </p>
                <p className="text-sm text-green-600 mt-1">
                  All orders show "Delivery available" to customers. No pincode validation is performed.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Store Pickup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Store Pickup
              </CardTitle>
              <CardDescription>
                Allow customers to pick up orders from your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pickup_enabled">Enable Store Pickup</Label>
                  <p className="text-sm text-muted-foreground">
                    Customers can choose to pick up instead of delivery
                  </p>
                </div>
                <Switch
                  id="pickup_enabled"
                  checked={formData.store_pickup_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, store_pickup_enabled: checked })}
                />
              </div>

              {formData.store_pickup_enabled && (
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="pickup_address">Pickup Address</Label>
                  <Textarea
                    id="pickup_address"
                    value={formData.pickup_address}
                    onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                    placeholder="Enter your shop address for pickup"
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Announcement Banner */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Homepage Announcement
              </CardTitle>
              <CardDescription>
                Display seasonal or festival messages on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="announcement_enabled">Enable Announcement Banner</Label>
                  <p className="text-sm text-muted-foreground">
                    Shows a banner at the top of the homepage
                  </p>
                </div>
                <Switch
                  id="announcement_enabled"
                  checked={formData.announcement_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, announcement_enabled: checked })}
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="announcement_text">Announcement Message</Label>
                <Textarea
                  id="announcement_text"
                  value={formData.announcement_text}
                  onChange={(e) => setFormData({ ...formData, announcement_text: e.target.value })}
                  placeholder="e.g., 🎁 Raksha Bandhan Special Printing – Order Early!"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Use emojis to make it eye-catching. Keep it short and clear.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
