import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import Seo from '@/components/seo/Seo';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Package, Eye, ShoppingBag, Edit2, Save, X, Loader2, MapPin, Phone, Heart, Truck, Store } from 'lucide-react';
import { toast } from 'sonner';
import OrderTimeline from '@/components/OrderTimeline';
import ProfilePhotoUpload from '@/components/profile/ProfilePhotoUpload';
import ReferralSection from '@/components/ReferralSection';
import LoyaltyWidget from '@/components/loyalty/LoyaltyWidget';

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_status: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  delivery_method?: string | null;
  delivery_charge?: number | null;
}

const Dashboard = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setOrders(data);
      }
      setOrdersLoading(false);
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
      });
    }
  }, [profile]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const sanitized = value.replace(/\D/g, '').slice(0, 10);
      setEditForm(prev => ({ ...prev, phone: sanitized }));
      return;
    }
    if (name === 'pincode') {
      const sanitized = value.replace(/\D/g, '').slice(0, 6);
      setEditForm(prev => ({ ...prev, pincode: sanitized }));
      return;
    }
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    if (!editForm.full_name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!editForm.phone || editForm.phone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (editForm.pincode && editForm.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone,
          address: editForm.address || null,
          city: editForm.city || null,
          state: editForm.state || null,
          pincode: editForm.pincode || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Seo
        title="My Account | Graphic Wala"
        description="Manage your orders, profile and wishlist at Graphic Wala."
        path="/dashboard"
        noindex
      />
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">My Account</h1>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile + Referral */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Profile Information
                  </CardTitle>
                  {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="pb-4 border-b border-border">
                    <ProfilePhotoUpload
                      userId={user.id}
                      avatarUrl={profile?.avatar_url}
                      name={profile?.full_name || user.email}
                      onChanged={refreshProfile}
                    />
                    <p className="mt-3 text-sm text-muted-foreground break-all">{user.email}</p>
                  </div>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input id="full_name" name="full_name" value={editForm.full_name} onChange={handleEditChange} placeholder="Your full name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-1"><Phone className="h-3 w-3" /> Mobile Number</Label>
                        <Input id="phone" name="phone" value={editForm.phone} onChange={handleEditChange} placeholder="10-digit mobile" maxLength={10} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" name="address" value={editForm.address} onChange={handleEditChange} placeholder="House/Flat, Street, Area" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" name="city" value={editForm.city} onChange={handleEditChange} placeholder="City" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input id="state" name="state" value={editForm.state} onChange={handleEditChange} placeholder="State" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pincode" className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Pincode</Label>
                        <Input id="pincode" name="pincode" value={editForm.pincode} onChange={handleEditChange} placeholder="6-digit pincode" maxLength={6} />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button onClick={handleSaveProfile} disabled={saving} className="flex-1">
                          {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                          Save
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit} disabled={saving}><X className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div><p className="text-sm text-muted-foreground">Name</p><p className="font-medium">{profile?.full_name || 'Not set'}</p></div>
                      <Separator />
                      <div><p className="text-sm text-muted-foreground">Email</p><p className="font-medium">{user.email}</p></div>
                      <Separator />
                      <div><p className="text-sm text-muted-foreground">Phone</p><p className="font-medium">{profile?.phone || 'Not set'}</p></div>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">
                          {profile?.address ? (
                            <>{profile.address}{profile.city && `, ${profile.city}`}{profile.state && `, ${profile.state}`}{profile.pincode && ` - ${profile.pincode}`}</>
                          ) : 'Not set'}
                        </p>
                      </div>
                      {profile?.pincode && (
                        <>
                          <Separator />
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <div><p className="text-sm text-muted-foreground">Delivery Pincode</p><p className="font-medium">{profile.pincode}</p></div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Link to="/wishlist">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="flex items-center gap-3 py-4">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="font-medium">My Wishlist</span>
                  </CardContent>
                </Card>
              </Link>

              {/* Loyalty Points */}
              <LoyaltyWidget />

              {/* Referral Section */}
              <ReferralSection />
            </div>

            {/* Orders Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Order History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No orders yet</p>
                      <Link to="/products"><Button>Start Shopping</Button></Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-mono text-sm text-muted-foreground">
                                  #{order.id.slice(0, 8).toUpperCase()}
                                </p>
                                <Badge className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                                  {order.payment_status === 'paid' ? 'Paid' : order.payment_status === 'failed' ? 'Failed' : 'Pending'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                })}
                              </p>

                              {/* Delivery Method Badge */}
                              <div className="mt-1">
                                {order.delivery_method === 'store_pickup' ? (
                                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200 gap-1 text-xs">
                                    <Store className="h-3 w-3" />
                                    Store Pickup
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 gap-1 text-xs">
                                    <Truck className="h-3 w-3" />
                                    Home Delivery
                                  </Badge>
                                )}
                              </div>
                              
                              {/* Live Order Tracking Timeline */}
                              <OrderTimeline currentStatus={order.status} />
                            </div>
                            <div className="flex items-center gap-4 md:flex-col md:items-end">
                              <p className="text-lg font-bold text-primary">
                                ₹{order.total_amount.toLocaleString()}
                              </p>
                              <Link to={`/order-confirmation/${order.id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
