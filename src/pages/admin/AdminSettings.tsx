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
import { Loader2, Settings, Truck, Store, IndianRupee } from 'lucide-react';

const AdminSettings = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { settings, loading, updateSettings } = useStoreSettings();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    default_delivery_charge: 50,
    store_pickup_enabled: true,
    pickup_address: 'Graphic Wala Shop, Main Road',
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
            Configure delivery charges and store pickup options
          </p>
        </div>

        <div className="grid gap-6 max-w-2xl">
          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Delivery Settings
              </CardTitle>
              <CardDescription>
                Delivery configuration for your store
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>📦 Fixed 7-Day Delivery</strong>
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  All products have a fixed 7-day delivery time. Delivery charges are set per product in the product settings.
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>To set delivery charges:</p>
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
