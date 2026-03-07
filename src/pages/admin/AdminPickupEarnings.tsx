import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store, Plus, IndianRupee, Trash2, Loader2, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAdminDraftState } from '@/hooks/useAdminDraftState';

interface PickupEarning {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  items_description: string;
  amount: number;
  payment_method: string;
  notes: string | null;
  created_at: string;
}

const AdminPickupEarnings = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<PickupEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const createInitialForm = useCallback(() => ({
    customer_name: '',
    customer_phone: '',
    items_description: '',
    amount: '',
    payment_method: 'cash',
    notes: '',
  }), []);

  const {
    state: form,
    setState: setForm,
    replaceState: replaceForm,
    clearDraft,
  } = useAdminDraftState('admin:pickup-earnings:draft:v1', createInitialForm);

  const fetchEarnings = async () => {
    const { data, error } = await supabase
      .from('store_pickup_earnings')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error(error); }
    else setEarnings((data || []) as PickupEarning[]);
    setLoading(false);
  };

  useEffect(() => { fetchEarnings(); }, []);

  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const todayEarnings = earnings
    .filter(e => format(new Date(e.created_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const handleSave = async () => {
    if (!form.customer_name.trim() || !form.items_description.trim() || !form.amount) {
      toast.error('Customer name, items & amount are required');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('store_pickup_earnings').insert({
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim() || null,
        items_description: form.items_description.trim(),
        amount: parseFloat(form.amount),
        payment_method: form.payment_method,
        notes: form.notes.trim() || null,
        created_by: user!.id,
      } as any);
      if (error) throw error;
      toast.success('Earning record added!');
      setForm({ customer_name: '', customer_phone: '', items_description: '', amount: '', payment_method: 'cash', notes: '' });
      setShowForm(false);
      fetchEarnings();
    } catch (err: any) {
      toast.error('Failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from('store_pickup_earnings').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Record deleted');
      setEarnings(prev => prev.filter(e => e.id !== deleteId));
    } catch (err: any) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Store className="h-8 w-8 text-primary" />
              Store Pickup Earnings
            </h1>
            <p className="text-muted-foreground mt-1">Track cash & in-store pickup orders</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Order
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-xl font-bold">₹{todayEarnings.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">All Time</p>
                <p className="text-xl font-bold">₹{totalEarnings.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Records */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : earnings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No records yet. Click "Add Order" to start tracking.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {earnings.map((e) => (
              <Card key={e.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{e.customer_name}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted capitalize">{e.payment_method}</span>
                      </div>
                      {e.customer_phone && <p className="text-xs text-muted-foreground mt-0.5">{e.customer_phone}</p>}
                      <p className="text-sm mt-1">{e.items_description}</p>
                      {e.notes && <p className="text-xs text-muted-foreground mt-1 italic">Note: {e.notes}</p>}
                      <p className="text-xs text-muted-foreground mt-2">{format(new Date(e.created_at), 'dd MMM yyyy, hh:mm a')}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-lg font-bold text-green-600">₹{Number(e.amount).toLocaleString()}</p>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(e.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Order Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Store Pickup Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Customer Name *</Label>
              <Input value={form.customer_name} onChange={(e) => setForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="Customer name" />
            </div>
            <div>
              <Label>Phone (Optional)</Label>
              <Input value={form.customer_phone} onChange={(e) => setForm(f => ({ ...f, customer_phone: e.target.value }))} placeholder="Phone number" />
            </div>
            <div>
              <Label>Items / Description *</Label>
              <Textarea value={form.items_description} onChange={(e) => setForm(f => ({ ...f, items_description: e.target.value }))} placeholder="e.g. 2x T-shirt print, 1x Mug" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Amount (₹) *</Label>
                <Input type="number" min="0" value={form.amount} onChange={(e) => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
              </div>
              <div>
                <Label>Payment Method</Label>
                <Select value={form.payment_method} onValueChange={(v) => setForm(f => ({ ...f, payment_method: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Input value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving...</> : 'Save Order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminPickupEarnings;
