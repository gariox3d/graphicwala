import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Ticket, Copy, Calendar, IndianRupee, Percent, Tag } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const emptyCoupon: {
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  is_active: boolean;
  expires_at: string;
} = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: 0,
  min_order_amount: 0,
  max_discount_amount: null,
  usage_limit: null,
  is_active: true,
  expires_at: '',
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCoupon);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCoupons(data as unknown as Coupon[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyCoupon);
    setDialogOpen(true);
  };

  const openEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type as 'percentage' | 'fixed',
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount,
      max_discount_amount: coupon.max_discount_amount,
      usage_limit: coupon.usage_limit,
      is_active: coupon.is_active,
      expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }
    if (form.discount_value <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }
    if (form.discount_type === 'percentage' && form.discount_value > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    setSaving(true);
    const payload = {
      code: form.code.toUpperCase().trim(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: form.discount_value,
      min_order_amount: form.min_order_amount || 0,
      max_discount_amount: form.max_discount_amount || null,
      usage_limit: form.usage_limit || null,
      is_active: form.is_active,
      expires_at: form.expires_at ? new Date(form.expires_at + 'T23:59:59').toISOString() : null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('coupons').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('coupons').insert(payload));
    }

    if (error) {
      toast.error(error.message.includes('unique') ? 'This coupon code already exists' : error.message);
    } else {
      toast.success(editingId ? 'Coupon updated!' : 'Coupon created!');
      setDialogOpen(false);
      fetchCoupons();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (!error) {
      toast.success('Coupon deleted');
      fetchCoupons();
    } else {
      toast.error('Failed to delete coupon');
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('coupons').update({ is_active: !current }).eq('id', id);
    if (!error) {
      fetchCoupons();
      toast.success(`Coupon ${!current ? 'activated' : 'deactivated'}`);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Ticket className="h-8 w-8 text-primary" />
              Coupons
            </h1>
            <p className="text-muted-foreground mt-1">Create and manage discount coupons</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Coupon Code *</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SAVE20"
                    className="uppercase font-mono text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. 20% off on all products"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Discount Type</Label>
                    <Select
                      value={form.discount_type}
                      onValueChange={(v: string) => setForm({ ...form, discount_type: v as 'percentage' | 'fixed' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Discount Value *</Label>
                    <Input
                      type="number"
                      value={form.discount_value || ''}
                      onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
                      placeholder={form.discount_type === 'percentage' ? 'e.g. 20' : 'e.g. 100'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Order Amount (₹)</Label>
                    <Input
                      type="number"
                      value={form.min_order_amount || ''}
                      onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })}
                      placeholder="0"
                    />
                  </div>
                  {form.discount_type === 'percentage' && (
                    <div className="space-y-2">
                      <Label>Max Discount (₹)</Label>
                      <Input
                        type="number"
                        value={form.max_discount_amount || ''}
                        onChange={(e) => setForm({ ...form, max_discount_amount: e.target.value ? Number(e.target.value) : null })}
                        placeholder="No limit"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Usage Limit</Label>
                    <Input
                      type="number"
                      value={form.usage_limit || ''}
                      onChange={(e) => setForm({ ...form, usage_limit: e.target.value ? Number(e.target.value) : null })}
                      placeholder="Unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={form.expires_at}
                      onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(v) => setForm({ ...form, is_active: v })}
                  />
                  <Label>Active</Label>
                </div>

                <Separator />

                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No coupons yet. Create your first coupon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {coupons.map((coupon) => {
              const expired = isExpired(coupon.expires_at);
              const limitReached = coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit;

              return (
                <Card key={coupon.id} className={`${!coupon.is_active || expired || limitReached ? 'opacity-60' : ''}`}>
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <button
                            onClick={() => copyCode(coupon.code)}
                            className="font-mono text-lg font-bold bg-muted px-3 py-1 rounded-md flex items-center gap-2 hover:bg-muted/80 transition-colors"
                          >
                            <Tag className="h-4 w-4 text-primary" />
                            {coupon.code}
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          </button>

                          {coupon.is_active && !expired && !limitReached && (
                            <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                          )}
                          {!coupon.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          {expired && (
                            <Badge variant="destructive">Expired</Badge>
                          )}
                          {limitReached && (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">Limit Reached</Badge>
                          )}
                        </div>

                        {coupon.description && (
                          <p className="text-sm text-muted-foreground">{coupon.description}</p>
                        )}

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {coupon.discount_type === 'percentage' ? (
                              <><Percent className="h-3 w-3" /> {coupon.discount_value}% off</>
                            ) : (
                              <><IndianRupee className="h-3 w-3" /> ₹{coupon.discount_value} off</>
                            )}
                          </span>
                          {coupon.min_order_amount > 0 && (
                            <span>Min: ₹{coupon.min_order_amount}</span>
                          )}
                          {coupon.max_discount_amount && (
                            <span>Max: ₹{coupon.max_discount_amount}</span>
                          )}
                          {coupon.usage_limit && (
                            <span>Used: {coupon.used_count}/{coupon.usage_limit}</span>
                          )}
                          {coupon.expires_at && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Expires: {new Date(coupon.expires_at).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={coupon.is_active}
                          onCheckedChange={() => toggleActive(coupon.id, coupon.is_active)}
                        />
                        <Button variant="outline" size="icon" onClick={() => openEdit(coupon)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(coupon.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
