import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Order, ORDER_STATUSES } from '@/lib/types';
import { normalizeIndianPhoneForWhatsApp } from '@/lib/phone';
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Search, ShoppingCart, Eye, Package, MapPin, CreditCard, User, Image, Download, Trash2, Truck, Store, MessageCircle, Loader2 } from 'lucide-react';
import { SignedImage, openSignedDesign } from '@/components/SignedImage';

interface OrderWithProfile extends Order {
  profiles?: { full_name: string | null };
  shiprocket_awb?: string | null;
  shiprocket_courier_name?: string | null;
  shiprocket_order_id?: string | null;
  delivery_method?: string | null;
}

interface OrderItemUpload {
  id: string;
  field_id: string;
  label: string;
  required: boolean;
  file_url: string;
}

interface OrderItemWithUploads {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  front_design_url?: string | null;
  back_design_url?: string | null;
  design_approval_status?: string | null;
  uploads?: OrderItemUpload[];
}

const WHATSAPP_STATUS_MESSAGES: Record<string, (name: string, orderId: string, amount: number, products: string) => string> = {
  designing: (name, orderId, amount, products) =>
    `🎨 *Graphic Wala - Design Update*\n\nHello ${name}! 👋\n\nYour order *#${orderId}* (₹${amount.toLocaleString()}) is now being designed!\n\n📦 *Items:* ${products}\n\nOur creative team is crafting something special just for you. We'll update you soon! ✨`,
  approved: (name, orderId, amount, products) =>
    `✅ *Graphic Wala - Design Approved*\n\nHello ${name}! 👋\n\nGreat news! Your order *#${orderId}* (₹${amount.toLocaleString()}) design has been approved!\n\n📦 *Items:* ${products}\n\nIt's now heading to production. Thank you for choosing Graphic Wala! 🙏`,
  printing: (name, orderId, amount, products) =>
    `🖨️ *Graphic Wala - Printing Started*\n\nHello ${name}! 👋\n\nYour order *#${orderId}* (₹${amount.toLocaleString()}) is now in production!\n\n📦 *Items:* ${products}\n\nWe're printing your design with premium quality materials. It'll be ready soon! 💪`,
  shipped: (name, orderId, amount, products) =>
    `🚚 *Graphic Wala - Order Shipped*\n\nHello ${name}! 👋\n\nYour order *#${orderId}* (₹${amount.toLocaleString()}) has been shipped!\n\n📦 *Items:* ${products}\n\nIt's on its way to you. You'll receive it shortly! 📦✨`,
  completed: (name, orderId, amount, products) =>
    `🎉 *Graphic Wala - Order Delivered*\n\nHello ${name}! 👋\n\nYour order *#${orderId}* (₹${amount.toLocaleString()}) has been successfully delivered!\n\n📦 *Items:* ${products}\n\nWe hope you love it. If you have any issues, feel free to reach out! ❤️\n\nThank you for choosing Graphic Wala! 🙏`,
  cancelled: (name, orderId, amount, products) =>
    `❌ *Graphic Wala - Order Cancelled*\n\nHello ${name}! 👋\n\nYour order *#${orderId}* (₹${amount.toLocaleString()}) has been cancelled.\n\n📦 *Items:* ${products}\n\nIf you have any questions, please message us on WhatsApp. We're always here to help! 🙏`,
};

const getWhatsAppLink = (phone: string, message: string) => {
  const normalizedPhone = normalizeIndianPhoneForWhatsApp(phone);
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
};

const AdminOrders = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithProfile | null>(null);
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemWithUploads[]>([]);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchOrders = async () => {
    if (!isAdmin) return;
    // SECURITY: Only fetch orders with payment_status = 'paid'
    // Unpaid/pending orders should NEVER be shown as they represent abandoned checkouts
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'paid')
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

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [isAdmin]);

  const fetchOrderProductNames = async (orderId: string): Promise<string> => {
    const { data } = await supabase
      .from('order_items')
      .select('product_name, quantity')
      .eq('order_id', orderId);
    if (!data || data.length === 0) return 'Your products';
    return data.map(i => `${i.product_name}${i.quantity > 1 ? ` x${i.quantity}` : ''}`).join(', ');
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    if (error) {
      toast.error('Failed to update order status');
    } else {
      const order = orders.find(o => o.id === orderId);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success('Order status updated');
      
      // Trigger status email (async, don't block UI)
      sendStatusEmail(orderId, newStatus);

      // Show WhatsApp notification toast
      if (order && WHATSAPP_STATUS_MESSAGES[newStatus]) {
        const customerName = order.customer_name || order.profiles?.full_name || 'Customer';
        const shortId = orderId.slice(0, 8).toUpperCase();
        const products = await fetchOrderProductNames(orderId);
        const message = WHATSAPP_STATUS_MESSAGES[newStatus](customerName, shortId, Number(order.total_amount), products);
        const whatsappUrl = getWhatsAppLink(order.shipping_phone, message);
        
        toast('📱 WhatsApp Update भेजें?', {
          description: `${customerName} को ${newStatus} update भेजें`,
          duration: 15000,
          action: {
            label: 'WhatsApp भेजें',
            onClick: () => window.open(whatsappUrl, '_blank'),
          },
        });
      }
    }
  };

  const sendStatusEmail = async (orderId: string, newStatus: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-status-email', {
        body: { orderId, newStatus }
      });
      
      if (error) {
        console.error('Failed to send status email:', error);
        // Don't show error toast - email is secondary to status update
      } else if (data?.success) {
        console.log('Status email sent successfully');
      }
    } catch (err) {
      console.error('Status email error:', err);
    }
  };

  const viewOrderDetails = async (order: OrderWithProfile) => {
    setSelectedOrder(order);
    
    // Fetch order items
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);
    
    if (items) {
      // Fetch uploads for each order item
      const itemIds = items.map(i => i.id);
      const { data: uploads } = await supabase
        .from('order_item_uploads')
        .select('*')
        .in('order_item_id', itemIds);
      
      const uploadsMap = new Map<string, OrderItemUpload[]>();
      uploads?.forEach(u => {
        const existing = uploadsMap.get(u.order_item_id) || [];
        existing.push(u);
        uploadsMap.set(u.order_item_id, existing);
      });
      
      const itemsWithUploads = items.map(item => ({
        ...item,
        uploads: uploadsMap.get(item.id) || [],
      }));
      
      setOrderItems(itemsWithUploads);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeleting(true);
    try {
      // First, get all order items and their uploads
      const { data: items } = await supabase
        .from('order_items')
        .select('id, front_design_url, back_design_url')
        .eq('order_id', orderId);
      
      if (items) {
        // Get uploads from order_item_uploads table
        const itemIds = items.map(i => i.id);
        const { data: uploads } = await supabase
          .from('order_item_uploads')
          .select('file_url')
          .in('order_item_id', itemIds);
        
        // Collect all file URLs to delete from storage
        const filesToDelete: string[] = [];
        
        items.forEach(item => {
          if (item.front_design_url) {
            const path = item.front_design_url.split('customer-designs/')[1];
            if (path) filesToDelete.push(path);
          }
          if (item.back_design_url) {
            const path = item.back_design_url.split('customer-designs/')[1];
            if (path) filesToDelete.push(path);
          }
        });
        
        uploads?.forEach(upload => {
          if (upload.file_url) {
            const path = upload.file_url.split('customer-designs/')[1];
            if (path) filesToDelete.push(path);
          }
        });
        
        // Delete files from storage
        if (filesToDelete.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('customer-designs')
            .remove(filesToDelete);
          
          if (storageError) {
            console.error('Storage delete error:', storageError);
          }
        }
      }
      
      // Delete order (cascades to order_items and order_item_uploads)
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);
      
      if (deleteError) {
        throw deleteError;
      }
      
      toast.success('Order and uploaded files deleted successfully');
      setOrders(orders.filter(o => o.id !== orderId));
      setDeleteOrderId(null);
    } catch (error: any) {
      console.error('Delete order error:', error);
      toast.error('Failed to delete order');
    } finally {
      setDeleting(false);
    }
  };


  const handleCreateShipment = async (order: OrderWithProfile) => {
    setShippingOrderId(order.id);
    try {
      const { data, error } = await supabase.functions.invoke('shiprocket', {
        body: { action: 'create_shipment', order_id: order.id },
      });
      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Shipment creation failed');

      setOrders(prev => prev.map(o => o.id === order.id ? {
        ...o,
        shiprocket_order_id: String(data.shiprocket_order_id),
        shiprocket_awb: data.awb,
        shiprocket_courier_name: data.courier_name,
      } : o));

      toast.success(data.awb
        ? `Shipment created • ${data.courier_name} • AWB ${data.awb}`
        : `Shipment created. ${data.awb_error || 'AWB pending'}`);
    } catch (e: any) {
      toast.error(e.message || 'Shipment creation failed');
    } finally {
      setShippingOrderId(null);
    }
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
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage orders with customer details and uploaded designs</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                All Orders ({filteredOrders.length})
              </CardTitle>
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
                     <TableHead>Delivery</TableHead>
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
                      <TableCell>
                        {order.delivery_method === 'store_pickup' ? (
                          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 gap-1">
                            <Store className="h-3 w-3" />
                            Pickup
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 gap-1">
                            <Truck className="h-3 w-3" />
                            Delivery
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">₹{Number(order.total_amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getPaymentBadge(order.payment_status || '')}>
                          {order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                          <SelectTrigger className={`w-32 h-8 ${getStatusBadge(order.status)}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map(s => (
                              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => viewOrderDetails(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.delivery_method !== 'store_pickup' && (
                            order.shiprocket_awb ? (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 whitespace-nowrap">
                                {order.shiprocket_courier_name || 'Shipped'} • {order.shiprocket_awb}
                              </Badge>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Create Shiprocket shipment"
                                disabled={shippingOrderId === order.id}
                                onClick={() => handleCreateShipment(order)}
                              >
                                {shippingOrderId === order.id
                                  ? <Loader2 className="h-4 w-4 animate-spin" />
                                  : <Truck className="h-4 w-4" />}
                              </Button>
                            )
                          )}
                          {WHATSAPP_STATUS_MESSAGES[order.status] && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={async () => {
                                const name = order.customer_name || order.profiles?.full_name || 'Customer';
                                const products = await fetchOrderProductNames(order.id);
                                const msg = WHATSAPP_STATUS_MESSAGES[order.status](name, order.id.slice(0, 8).toUpperCase(), Number(order.total_amount), products);
                                window.open(getWhatsAppLink(order.shipping_phone, msg), '_blank');
                              }}
                              title="WhatsApp Update भेजें"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {order.status === 'cancelled' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteOrderId(order.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - Print Ready</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order ID</p>
                  <p className="font-mono">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge className={getStatusBadge(selectedOrder.status)}>{selectedOrder.status}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment</p>
                  <Badge className={getPaymentBadge(selectedOrder.payment_status || '')}>
                    {selectedOrder.payment_status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />Customer Information
                </h4>
                <div className="bg-muted p-4 rounded-lg space-y-1">
                  <p className="font-medium text-lg">
                    {selectedOrder.customer_name || selectedOrder.profiles?.full_name || 'Unknown'}
                  </p>
                  <p><strong>Phone:</strong> {selectedOrder.shipping_phone}</p>
                  {selectedOrder.email && <p><strong>Email:</strong> {selectedOrder.email}</p>}
                  
                  {/* WhatsApp Quick Actions */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t">
                    {Object.entries(WHATSAPP_STATUS_MESSAGES).map(([status, msgFn]) => {
                      const customerName = selectedOrder.customer_name || selectedOrder.profiles?.full_name || 'Customer';
                      const shortId = selectedOrder.id.slice(0, 8).toUpperCase();
                      const productsList = orderItems.map(i => `${i.product_name}${i.quantity > 1 ? ` x${i.quantity}` : ''}`).join(', ') || 'Your products';
                      const message = msgFn(customerName, shortId, Number(selectedOrder.total_amount), productsList);
                      const url = getWhatsAppLink(selectedOrder.shipping_phone, message);
                      const isCurrentStatus = selectedOrder.status === status;
                      return (
                        <Button
                          key={status}
                          size="sm"
                          variant={isCurrentStatus ? "default" : "outline"}
                          className={`gap-1 text-xs capitalize ${isCurrentStatus ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
                          onClick={() => window.open(url, '_blank')}
                        >
                          <MessageCircle className="h-3 w-3" />
                          {status}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Delivery Method Badge */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  {selectedOrder.delivery_method === 'store_pickup' ? (
                    <><Store className="h-4 w-4" />Delivery Method</>
                  ) : (
                    <><Truck className="h-4 w-4" />Delivery Method</>
                  )}
                </h4>
                <div className={`p-4 rounded-lg border-2 ${selectedOrder.delivery_method === 'store_pickup' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                  {selectedOrder.delivery_method === 'store_pickup' ? (
                    <div className="flex items-center gap-2">
                      <Store className="h-5 w-5 text-orange-600" />
                      <span className="font-semibold text-orange-700 text-lg">🏪 Store Pickup</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-700 text-lg">🚚 Home Delivery</span>
                    </div>
                  )}
                  {selectedOrder.delivery_charge != null && Number(selectedOrder.delivery_charge) > 0 && (
                    <p className="text-sm mt-1 text-muted-foreground">Delivery Charge: ₹{Number(selectedOrder.delivery_charge).toLocaleString()}</p>
                  )}
                  {selectedOrder.estimated_delivery_date && (
                    <p className="text-sm mt-1 text-muted-foreground">Est. Delivery: {new Date(selectedOrder.estimated_delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />{selectedOrder.delivery_method === 'store_pickup' ? 'Customer Address' : 'Shipping Address'}
                </h4>
                <div className="bg-muted p-4 rounded-lg">
                  <p>{selectedOrder.shipping_address}</p>
                  <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_pincode}</p>
                  {selectedOrder.landmark && (
                    <p className="text-sm text-muted-foreground">Landmark: {selectedOrder.landmark}</p>
                  )}
                </div>
              </div>

              {selectedOrder.order_notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Order Notes</h4>
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p>{selectedOrder.order_notes}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />Order Items & Designs
                </h4>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {item.quantity} × ₹{Number(item.product_price).toLocaleString()}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ₹{(Number(item.product_price) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                      
                      {/* New upload_config based uploads */}
                      {item.uploads && item.uploads.length > 0 && (
                        <div className="grid md:grid-cols-2 gap-4 mt-3 pt-3 border-t">
                          {item.uploads.map((upload) => (
                            <div key={upload.id} className="space-y-2">
                              <p className="text-sm font-medium flex items-center gap-1">
                                <Image className="h-3 w-3" />
                                {upload.label}
                                {upload.required && <span className="text-destructive">*</span>}
                              </p>
                              <div className="aspect-video bg-muted rounded overflow-hidden">
                                {upload.file_url.endsWith('.pdf') ? (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    PDF Document
                                  </div>
                                ) : (
                                  <SignedImage url={upload.file_url} alt={upload.label} className="w-full h-full object-contain" />
                                )}
                              </div>
                              <button type="button" onClick={() => openSignedDesign(upload.file_url)} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                <Download className="h-3 w-3" />Download Original
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Legacy front/back design fields */}
                      {(!item.uploads || item.uploads.length === 0) && (item.front_design_url || item.back_design_url) && (
                        <div className="grid md:grid-cols-2 gap-4 mt-3 pt-3 border-t">
                          {item.front_design_url && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium flex items-center gap-1">
                                <Image className="h-3 w-3" />Front Design
                              </p>
                              <div className="aspect-video bg-muted rounded overflow-hidden">
                                <SignedImage url={item.front_design_url} alt="Front" className="w-full h-full object-contain" />
                              </div>
                              <button type="button" onClick={() => openSignedDesign(item.front_design_url || '')} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                <Download className="h-3 w-3" />Download
                              </button>
                            </div>
                          )}
                          {item.back_design_url && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium flex items-center gap-1">
                                <Image className="h-3 w-3" />Back Design
                              </p>
                              <div className="aspect-video bg-muted rounded overflow-hidden">
                                <SignedImage url={item.back_design_url} alt="Back" className="w-full h-full object-contain" />
                              </div>
                              <button type="button" onClick={() => openSignedDesign(item.back_design_url || '')} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                <Download className="h-3 w-3" />Download
                              </button>
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
                  <h4 className="font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />Payment
                  </h4>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cancelled Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this order and all uploaded design files from storage.
              This action cannot be undone. Storage space will be freed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOrderId && handleDeleteOrder(deleteOrderId)}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete Order & Files'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminOrders;