import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Users, Search, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Get from profiles (name + phone)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, phone');

        // Get from orders (email + customer_name + phone)
        const { data: orders } = await supabase
          .from('orders')
          .select('user_id, customer_name, email, shipping_phone');

        // Merge: use user_id as key
        const customerMap = new Map<string, CustomerInfo>();

        if (profiles) {
          for (const p of profiles) {
            customerMap.set(p.user_id, {
              name: p.full_name || '',
              phone: p.phone || '',
              email: '',
            });
          }
        }

        if (orders) {
          for (const o of orders) {
            const existing = customerMap.get(o.user_id);
            if (existing) {
              if (!existing.name && o.customer_name) existing.name = o.customer_name;
              if (!existing.phone && o.shipping_phone) existing.phone = o.shipping_phone;
              if (!existing.email && o.email) existing.email = o.email;
            } else {
              customerMap.set(o.user_id, {
                name: o.customer_name || '',
                phone: o.shipping_phone || '',
                email: o.email || '',
              });
            }
          }
        }

        setCustomers(Array.from(customerMap.values()).filter(c => c.name || c.phone || c.email));
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

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

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Stats */}
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
            <CardContent className="py-12 text-center text-muted-foreground">
              No customers found.
            </CardContent>
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
                    {filtered.map((c, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-muted-foreground">{i + 1}</td>
                        <td className="p-4 font-medium">{c.name || '—'}</td>
                        <td className="p-4">{c.phone || '—'}</td>
                        <td className="p-4">{c.email || '—'}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {c.phone && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => copyToClipboard(c.phone, i)}
                              >
                                {copiedIdx === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                <span className="ml-1">Phone</span>
                              </Button>
                            )}
                            {c.email && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={() => copyToClipboard(c.email, i + 10000)}
                              >
                                {copiedIdx === i + 10000 ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                <span className="ml-1">Email</span>
                              </Button>
                            )}
                            {c.phone && (
                              <Button
                                size="sm"
                                variant="default"
                                className="h-8 text-xs bg-green-600 hover:bg-green-700"
                                asChild
                              >
                                <a
                                  href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  WhatsApp
                                </a>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;
