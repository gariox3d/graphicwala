import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { toast } from 'sonner';
import { Loader2, Truck, MapPin, PlugZap, Calculator } from 'lucide-react';

interface PickupLocation {
  pickup_location: string;
  address: string;
  city: string;
  state: string;
  pin_code: string;
  phone: string;
}

const AdminShipping = () => {
  const { settings, loading, refetch } = useStoreSettings();
  const [pickupPincode, setPickupPincode] = useState('854105');
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [testPin, setTestPin] = useState('');
  const [testWeight, setTestWeight] = useState('0.5');
  const [rateResult, setRateResult] = useState<any>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setPickupPincode((settings as any).pickup_pincode || '854105');
    setEnabled((settings as any).shiprocket_enabled ?? true);
  }, [settings]);

  const call = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('shiprocket', { body });
    if (error) throw new Error(error.message);
    return data;
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('store_settings')
      .update({ pickup_pincode: pickupPincode, shiprocket_enabled: enabled, updated_at: new Date().toISOString() } as any)
      .eq('id', 'default');
    setSaving(false);
    if (error) return toast.error('Could not save settings');
    toast.success('Shipping settings saved');
    refetch();
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const auth = await call({ action: 'check_auth' });
      setConnected(!!auth?.success);
      if (auth?.success) {
        const loc = await call({ action: 'pickup_locations' });
        setLocations(loc?.locations || []);
        toast.success('Shiprocket connected');
      } else {
        toast.error(auth?.error || 'Connection failed');
      }
    } catch (e: any) {
      setConnected(false);
      toast.error(e.message || 'Connection failed');
    } finally {
      setTesting(false);
    }
  };

  const handleRateCheck = async () => {
    if (!/^\d{6}$/.test(testPin)) return toast.error('Enter a valid 6-digit pincode');
    setChecking(true);
    setRateResult(null);
    try {
      const res = await call({
        action: 'serviceability',
        delivery_pincode: testPin,
        weight: Number(testWeight) || 0.5,
      });
      setRateResult(res);
      if (!res?.success) toast.error(res?.error || 'Not serviceable');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" /> Shipping (Shiprocket)
          </h1>
          <p className="text-sm text-muted-foreground">
            Surface couriers only — Delhivery Surface is preferred automatically. Air couriers are never selected.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PlugZap className="h-5 w-5 text-primary" /> Connection</CardTitle>
            <CardDescription>Check your Shiprocket account connection and pickup locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Button onClick={handleTest} disabled={testing} variant="secondary">
                {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Test Connection
              </Button>
              {connected === true && <Badge className="bg-green-100 text-green-700">Connected</Badge>}
              {connected === false && <Badge variant="destructive">Not connected</Badge>}
            </div>

            {locations.length > 0 && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Pickup Locations</Label>
                {locations.map((l) => (
                  <div key={l.pickup_location} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{l.pickup_location} • {l.pin_code}</p>
                    <p className="text-muted-foreground">{l.address}, {l.city}, {l.state} • {l.phone}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sr_enabled">Enable Shiprocket</Label>
                <p className="text-sm text-muted-foreground">Show live courier rates and allow shipment creation</p>
              </div>
              <Switch id="sr_enabled" checked={enabled} onCheckedChange={setEnabled} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup_pincode">Pickup Pincode</Label>
              <Input
                id="pickup_pincode"
                value={pickupPincode}
                maxLength={6}
                onChange={(e) => setPickupPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            <Button onClick={handleSave} disabled={saving || loading}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Save
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" /> Rate Calculator</CardTitle>
            <CardDescription>Check live courier charge and delivery days for any pincode</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Delivery pincode"
                value={testPin}
                maxLength={6}
                onChange={(e) => setTestPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <Input
                placeholder="Weight (kg)"
                value={testWeight}
                onChange={(e) => setTestWeight(e.target.value)}
                className="sm:w-36"
              />
              <Button onClick={handleRateCheck} disabled={checking}>
                {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Check'}
              </Button>
            </div>

            {rateResult?.success && (
              <div className="rounded-lg border bg-green-50 p-4 text-sm space-y-1">
                <p className="font-semibold text-green-800">{rateResult.courier_name}</p>
                <p>Charge: <strong>₹{rateResult.rate}</strong></p>
                <p>Delivery in <strong>{rateResult.estimated_days} days</strong>{rateResult.etd ? ` (ETD ${rateResult.etd})` : ''}</p>
              </div>
            )}
            {rateResult && !rateResult.success && (
              <p className="text-sm text-destructive">{rateResult.error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminShipping;
