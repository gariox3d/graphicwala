import { useState, useEffect, useCallback } from 'react';
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
import { useAdminDraftState } from '@/hooks/useAdminDraftState';
import { toast } from 'sonner';
import { Loader2, Settings, Truck, Store, Megaphone, Shield, Phone, Percent, Eye } from 'lucide-react';

const AdminSettings = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { settings, loading, updateSettings } = useStoreSettings();
  const [saving, setSaving] = useState(false);

  const createInitialFormData = useCallback(() => ({
    default_delivery_charge: 50,
    store_pickup_enabled: true,
    pickup_address: 'Graphic Wala Shop, Main Road',
    announcement_text: '',
    announcement_enabled: false,
    delivery_time_text: '🚚 Estimated Delivery: 5–7 working days\n\nOrders are dispatched after quality checks.\nIn rare cases, delivery may take slightly longer due to logistics or regional delays.',
    delivery_disclaimer_enabled: true,
    // Return policy settings
    whatsapp_support_number: '+916207142994',
    return_policy_enabled: true,
    return_window_hours: 48,
    bulk_discount_enabled: false,
    bulk_discount_min_qty: 2,
    bulk_discount_percent: 10,
    social_proof_enabled: false,
  }), []);

  const {
    state: formData,
    setState: setFormData,
    initializeFromServer,
    clearDraft,
  } = useAdminDraftState('admin:settings:draft:v1', createInitialFormData);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (settings) {
      initializeFromServer({
        default_delivery_charge: settings.default_delivery_charge,
        store_pickup_enabled: settings.store_pickup_enabled,
        pickup_address: settings.pickup_address,
        announcement_text: settings.announcement_text || '',
        announcement_enabled: settings.announcement_enabled || false,
        delivery_time_text: settings.delivery_time_text || '🚚 Estimated Delivery: 5–7 working days\n\nOrders are dispatched after quality checks.\nIn rare cases, delivery may take slightly longer due to logistics or regional delays.',
        delivery_disclaimer_enabled: settings.delivery_disclaimer_enabled ?? true,
        whatsapp_support_number: settings.whatsapp_support_number || '+916207142994',
        return_policy_enabled: settings.return_policy_enabled ?? true,
        return_window_hours: settings.return_window_hours ?? 48,
        bulk_discount_enabled: settings.bulk_discount_enabled ?? false,
        bulk_discount_min_qty: settings.bulk_discount_min_qty ?? 2,
        bulk_discount_percent: settings.bulk_discount_percent ?? 10,
        social_proof_enabled: (settings as any).social_proof_enabled ?? false,
      });
    }
  }, [settings, initializeFromServer]);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateSettings(formData);
    if (result.success) {
      clearDraft();
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

          {/* Return Policy Settings */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Return & Damage Policy
              </CardTitle>
              <CardDescription>
                Configure return policy and WhatsApp support for damaged products
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="return_policy_enabled">Enable Return Policy Section</Label>
                  <p className="text-sm text-muted-foreground">
                    Show return policy on product, checkout, and order confirmation pages
                  </p>
                </div>
                <Switch
                  id="return_policy_enabled"
                  checked={formData.return_policy_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, return_policy_enabled: checked })}
                />
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="whatsapp_support_number" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  WhatsApp Support Number
                </Label>
                <Input
                  id="whatsapp_support_number"
                  value={formData.whatsapp_support_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_support_number: e.target.value })}
                  placeholder="+916207142994"
                />
                <p className="text-xs text-muted-foreground">
                  Include country code (e.g., +91 for India). Used for return/damage reports.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="return_window_hours">Return Window (Hours)</Label>
                <Input
                  id="return_window_hours"
                  type="number"
                  min="12"
                  max="168"
                  value={formData.return_window_hours}
                  onChange={(e) => setFormData({ ...formData, return_window_hours: parseInt(e.target.value) || 48 })}
                />
                <p className="text-xs text-muted-foreground">
                  Time limit for customers to report damaged/defective products (default: 48 hours)
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg mt-4">
                <p className="text-sm text-amber-700">
                  <strong>📦 Return Policy Notice</strong>
                </p>
                <p className="text-sm text-amber-600 mt-1">
                  Returns are only accepted for damaged or defective products. Customers must send video proof via WhatsApp.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Discount Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                Bulk / Combo Discount
              </CardTitle>
              <CardDescription>
                Auto-discount when customers buy multiple items
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="bulk_discount_enabled">Enable Bulk Discount</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically apply discount when quantity meets minimum
                  </p>
                </div>
                <Switch
                  id="bulk_discount_enabled"
                  checked={formData.bulk_discount_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, bulk_discount_enabled: checked })}
                />
              </div>

              {formData.bulk_discount_enabled && (
                <>
                  <div className="space-y-2 pt-4 border-t">
                    <Label htmlFor="bulk_discount_min_qty">Minimum Quantity (per product)</Label>
                    <Input
                      id="bulk_discount_min_qty"
                      type="number"
                      min="2"
                      max="50"
                      value={formData.bulk_discount_min_qty}
                      onChange={(e) => setFormData({ ...formData, bulk_discount_min_qty: parseInt(e.target.value) || 2 })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Discount applies when a single product quantity reaches this number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bulk_discount_percent">Discount Percentage (%)</Label>
                    <Input
                      id="bulk_discount_percent"
                      type="number"
                      min="1"
                      max="90"
                      value={formData.bulk_discount_percent}
                      onChange={(e) => setFormData({ ...formData, bulk_discount_percent: parseFloat(e.target.value) || 10 })}
                    />
                    <p className="text-xs text-muted-foreground">
                      e.g., 10% off when buying {formData.bulk_discount_min_qty}+ of the same product
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg mt-2">
                    <p className="text-sm text-blue-700">
                      <strong>💡 Example:</strong> If a product costs ₹500 and customer buys {formData.bulk_discount_min_qty}+, 
                      they get {formData.bulk_discount_percent}% off = ₹{(500 * (1 - formData.bulk_discount_percent / 100)).toFixed(0)} per piece
                    </p>
                  </div>
                </>
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
