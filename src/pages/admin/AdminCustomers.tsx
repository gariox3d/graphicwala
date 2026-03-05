import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Search, Copy, Check, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeIndianPhoneForWhatsApp } from '@/lib/phone';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CustomerInfo {
  user_id: string;
  name: string;
  phone: string;
  email: string;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CustomerInfo | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_all_customers');
      if (error) { console.error('Error:', error); return; }
      if (data) {
        setCustomers(
          data
            .filter((c: any) => c.full_name || c.phone || c.email)
            .map((c: any) => ({
              user_id: c.user_id,
              name: c.full_name || '',
              phone: c.phone || '',
              email: c.email || '',
            }))
        );
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
  });

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success('Copied!');
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase.rpc('admin_delete_user', { p_user_id: deleteTarget.user_id });
      if (error) throw error;
      toast.success(`User "${deleteTarget.name || deleteTarget.email}" deleted`);
      setCustomers(prev => prev.filter(c => c.user_id !== deleteTarget.user_id));
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error('Failed to delete user: ' + (err.message || 'Unknown error'));
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Customers
          </h1>
          <p className="text-muted-foreground mt-1">
            All registered customers — Name, Phone & Email for marketing.
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, phone or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <div className="text-sm text-muted-foreground">
          Total Customers: <span className="font-semibold text-foreground">{customers.length}</span>
          {search && <> • Showing: <span className="font-semibold text-foreground">{filtered.length}</span></>}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse text-muted-foreground">Loading customers...</div>
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">No customers found.</CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">#</th>
                      <th className="text-left p-4 font-semibold">Name</th>
                      <th className="text-left p-4 font-semibold">Phone</th>
                      <th className="text-left p-4 font-semibold">Email</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c, i) => {
                      const whatsappPhone = normalizeIndianPhoneForWhatsApp(c.phone);
                      return (
                        <tr key={c.user_id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4 text-muted-foreground">{i + 1}</td>
                          <td className="p-4 font-medium">{c.name || '—'}</td>
                          <td className="p-4">{c.phone || '—'}</td>
                          <td className="p-4">{c.email || '—'}</td>
                          <td className="p-4">
                            <div className="flex gap-2 flex-wrap">
                              {c.phone && (
                                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => copyToClipboard(c.phone, i)}>
                                  {copiedIdx === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  <span className="ml-1">Phone</span>
                                </Button>
                              )}
                              {c.email && (
                                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => copyToClipboard(c.email, i + 10000)}>
                                  {copiedIdx === i + 10000 ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  <span className="ml-1">Email</span>
                                </Button>
                              )}
                              {whatsappPhone && (
                                <Button size="sm" variant="default" className="h-8 text-xs bg-green-600 hover:bg-green-700" asChild>
                                  <a href={`https://wa.me/${whatsappPhone}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                                </Button>
                              )}
                              <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => setDeleteTarget(c)}>
                                <Trash2 className="h-3 w-3 mr-1" /> Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name || deleteTarget?.email}</strong> and all their data (cart, orders history, reviews, loyalty points, referrals). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Deleting...</> : 'Delete User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminCustomers;
