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
import { Loader2, Settings, Truck, Store, Megaphone, Package, MapPin } from 'lucide-react';

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
    pickup_pincode: '854105',
    shiprocket_enabled: false,
    shiprocket_fallback_message: 'Delivery estimate unavailable for your location. Standard delivery: 5-7 working days.',
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
        pickup_pincode: settings.pickup_pincode || '854105',
        shiprocket_enabled: settings.shiprocket_enabled || false,
        shiprocket_fallback_message: settings.shiprocket_fallback_message || 'Delivery estimate unavailable for your location. Standard delivery: 5-7 working days.',
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
          {/* Shiprocket Integration */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Shiprocket Shipping
              </CardTitle>
              <CardDescription>
                Enable real-time shipping rates and delivery estimates from Shiprocket
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="shiprocket_enabled">Enable Shiprocket</Label>
                  <p className="text-sm text-muted-foreground">
                    Get real shipping rates & delivery estimates
                  </p>
                </div>
                <Switch
                  id="shiprocket_enabled"
                  checked={formData.shiprocket_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, shiprocket_enabled: checked })}
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="pickup_pincode" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Pickup Pincode (Seller Location) *
                </Label>
                <Input
                  id="pickup_pincode"
                  value={formData.pickup_pincode}
                  onChange={(e) => setFormData({ ...formData, pickup_pincode: e.target.value })}
                  placeholder="Enter your shop's pincode"
                  maxLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  This is your shop's pincode from where orders will be shipped
                </p>
              </div>

              {formData.shiprocket_enabled && (
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="shiprocket_fallback_message">Fallback Message</Label>
                  <Textarea
                    id="shiprocket_fallback_message"
                    value={formData.shiprocket_fallback_message}
                    onChange={(e) => setFormData({ ...formData, shiprocket_fallback_message: e.target.value })}
                    placeholder="Message to show when Shiprocket is unavailable"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    Shown when delivery estimate is unavailable for a pincode
                  </p>
                </div>
              )}

              {formData.shiprocket_enabled && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>✓ Shiprocket Active</strong>
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Customers will see real shipping charges and delivery estimates based on their pincode. Make sure to set product weights in each product's settings.
                  </p>
                </div>
              )}

              {!formData.shiprocket_enabled && (
                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-700">
                    <strong>⚠️ Using Fixed Delivery</strong>
                  </p>
                  <p className="text-sm text-amber-600 mt-1">
                    When disabled, products use their fixed delivery charge set in product settings.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Fallback Delivery Settings
              </CardTitle>
              <CardDescription>
                Used when Shiprocket is disabled or unavailable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>📦 Fixed 7-Day Delivery</strong>
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  When Shiprocket is disabled, products use their individual delivery charge settings.
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>To set fallback delivery charges:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Go to Products → Edit Product</li>
                  <li>Set Delivery Charge (₹) for each product</li>
                  <li>Set Order Cut-off Time for countdown timer</li>
                </ol>
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
