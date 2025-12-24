import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Order, ORDER_STATUSES } from '@/lib/types';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, ShoppingCart, Eye, Package, MapPin, CreditCard, User, Image, Download, ExternalLink } from 'lucide-react';

interface OrderWithProfile extends Order {
  profiles?: { full_name: string | null };
}

const AdminOrders = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithProfile | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAdmin) return;
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const userIds = [...new Set(data.map(o => o.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        const ordersWithProfiles = data.map(order => ({
          ...order,
          profiles: profileMap.get(order.user_id) || null,
        }));
        setOrders(ordersWithProfiles as OrderWithProfile[]);
      }
      setLoading(false);
    };
    if (isAdmin) fetchOrders();
  }, [isAdmin]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      toast.error('Failed to update order status');
    } else {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Order status updated');
    }
  };

  const viewOrderDetails = async (order: OrderWithProfile) => {
    setSelectedOrder(order);
    const { data } = await supabase.from('order_items').select('*').eq('order_id', order.id);
    setOrderItems(data || []);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      designing: 'bg-purple-100 text-purple-700',
      approved: 'bg-blue-100 text-blue-700',
      printing: 'bg-indigo-100 text-indigo-700',
      shipped: 'bg-cyan-100 text-cyan-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentBadge = (status: string) => {
    if (status === 'paid') return 'bg-green-100 text-green-700';
    if (status === 'failed') return 'bg-red-100 text-red-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading) {
    return <AdminLayout><div className="flex items-center justify-center h-64"><div className="animate-pulse">Loading...</div></div></AdminLayout>;
  }
  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold">Orders</h1><p className="text-muted-foreground">Manage orders with customer details and uploaded designs</p></div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <CardTitle className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" />All Orders ({filteredOrders.length})</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Filter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {ORDER_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <p className="font-medium">{order.customer_name || order.profiles?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">{order.shipping_phone}</p>
                      </TableCell>
                      <TableCell className="font-semibold">₹{Number(order.total_amount).toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline" className={getPaymentBadge(order.payment_status || '')}>{order.payment_status}</Badge></TableCell>
                      <TableCell>
                        <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                          <SelectTrigger className={`w-32 h-8 ${getStatusBadge(order.status)}`}><SelectValue /></SelectTrigger>
                          <SelectContent>{ORDER_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="icon" onClick={() => viewOrderDetails(order)}><Eye className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Order Details - Print Ready</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">Order ID</p><p className="font-mono">{selectedOrder.id}</p></div>
                <div><p className="text-muted-foreground">Date</p><p>{new Date(selectedOrder.created_at).toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Status</p><Badge className={getStatusBadge(selectedOrder.status)}>{selectedOrder.status}</Badge></div>
                <div><p className="text-muted-foreground">Payment</p><Badge className={getPaymentBadge(selectedOrder.payment_status || '')}>{selectedOrder.payment_status}</Badge></div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" />Customer Information</h4>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p className="font-medium text-lg">{selectedOrder.customer_name || selectedOrder.profiles?.full_name || 'Unknown'}</p>
                  <p><strong>Phone:</strong> {selectedOrder.shipping_phone}</p>
                  {selectedOrder.email && <p><strong>Email:</strong> {selectedOrder.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" />Shipping Address</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p>{selectedOrder.shipping_address}</p>
                  <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_pincode}</p>
                  {selectedOrder.landmark && <p className="text-sm text-muted-foreground">Landmark: {selectedOrder.landmark}</p>}
                </div>
              </div>

              {selectedOrder.order_notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Order Notes</h4>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg"><p>{selectedOrder.order_notes}</p></div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2"><Package className="h-4 w-4" />Order Items & Designs</h4>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ₹{Number(item.product_price).toLocaleString()}</p>
                        </div>
                        <p className="font-semibold">₹{(Number(item.product_price) * item.quantity).toLocaleString()}</p>
                      </div>
                      
                      {(item.front_design_url || item.back_design_url) && (
                        <div className="grid md:grid-cols-2 gap-4 mt-3 pt-3 border-t">
                          {item.front_design_url && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium flex items-center gap-1"><Image className="h-3 w-3" />Front Design</p>
                              <div className="aspect-video bg-muted rounded overflow-hidden">
                                <img src={item.front_design_url} alt="Front" className="w-full h-full object-contain" />
                              </div>
                              <a href={item.front_design_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                <Download className="h-3 w-3" />Download
                              </a>
                            </div>
                          )}
                          {item.back_design_url && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium flex items-center gap-1"><Image className="h-3 w-3" />Back Design</p>
                              <div className="aspect-video bg-muted rounded overflow-hidden">
                                <img src={item.back_design_url} alt="Back" className="w-full h-full object-contain" />
                              </div>
                              <a href={item.back_design_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                <Download className="h-3 w-3" />Download
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-4 text-lg font-bold border-t">
                    <span>Total</span>
                    <span className="text-primary">₹{Number(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedOrder.razorpay_payment_id && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4" />Payment</h4>
                  <div className="bg-muted p-4 rounded-lg text-sm space-y-1">
                    <p><span className="text-muted-foreground">Payment ID:</span> {selectedOrder.razorpay_payment_id}</p>
                    <p><span className="text-muted-foreground">Order ID:</span> {selectedOrder.razorpay_order_id}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
