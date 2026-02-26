import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Search, Copy, Check, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { normalizeIndianPhoneForWhatsApp } from '@/lib/phone';

interface AbandonedCustomer {
  user_id: string;
  full_name: string;
  phone: string;
  email: string;
  cart_items_count: number;
  last_upload_at: string;
}

const AdminAbandonedCarts = () => {
  const [customers, setCustomers] = useState<AbandonedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase.rpc('get_abandoned_cart_customers');
        if (error) {
          console.error('Error:', error);
          return;
        }
        if (data) {
          setCustomers(data as AbandonedCustomer[]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return c.full_name.toLowerCase().includes(q) || c.phone.includes(q) || c.email.toLowerCase().includes(q);
  });

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(key);
    toast.success('Copied!');
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-orange-500" />
            Abandoned Carts
          </h1>
          <p className="text-muted-foreground mt-1">
            Customers jinhone design upload kiya lekin order nahi kiya — inko message karo!
          </p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">{customers.length}</span>
          {search && <> • Showing: <span className="font-semibold text-foreground">{filtered.length}</span></>}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {customers.length === 0 ? 'Koi abandoned cart nahi mila — bahut accha! 🎉' : 'No results found.'}
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
                      <th className="text-left p-4 font-semibold">Cart Items</th>
                      <th className="text-left p-4 font-semibold">Last Upload</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c, i) => {
                      const whatsappPhone = normalizeIndianPhoneForWhatsApp(c.phone);

                      return (
                        <tr key={c.user_id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="p-4 text-muted-foreground">{i + 1}</td>
                          <td className="p-4 font-medium">{c.full_name || '—'}</td>
                          <td className="p-4">{c.phone || '—'}</td>
                          <td className="p-4">{c.email || '—'}</td>
                          <td className="p-4">
                            <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                              {c.cart_items_count} items
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground text-xs">
                            {c.last_upload_at ? formatDistanceToNow(new Date(c.last_upload_at), { addSuffix: true }) : '—'}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              {c.phone && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs"
                                    onClick={() => copy(c.phone, `ph-${c.user_id}`)}
                                  >
                                    {copiedIdx === `ph-${c.user_id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                    <span className="ml-1">Phone</span>
                                  </Button>
                                  {whatsappPhone && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="h-8 text-xs bg-green-600 hover:bg-green-700"
                                      asChild
                                    >
                                      <a
                                        href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hi! Aapne hamare store pe design upload kiya tha. Kya main aapki koi help kar sakta hun? 😊')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <MessageCircle className="h-3 w-3 mr-1" />
                                        WhatsApp
                                      </a>
                                    </Button>
                                  )}
                                </>
                              )}
                              {c.email && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs"
                                  onClick={() => copy(c.email, `em-${c.user_id}`)}
                                >
                                  {copiedIdx === `em-${c.user_id}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                  <span className="ml-1">Email</span>
                                </Button>
                              )}
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
    </AdminLayout>
  );
};

export default AdminAbandonedCarts;
