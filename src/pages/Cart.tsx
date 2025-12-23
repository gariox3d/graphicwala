import { Link, Navigate } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/lib/types';

const Cart = () => {
  const { user, loading: authLoading } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, cartTotal, loading } = useCart();

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
          {loading ? (
            <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-lg" />)}</div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Your cart is empty</p>
              <Link to="/products"><Button variant="hero">Continue Shopping</Button></Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  const product = item.products as Product;
                  return (
                    <div key={item.id} className="flex gap-4 p-4 bg-card rounded-lg shadow-soft">
                      <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {product?.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-muted-foreground/30">{product?.name?.charAt(0)}</div>}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{product?.name}</h3>
                        <p className="text-primary font-bold">₹{product?.price?.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-card p-6 rounded-lg shadow-soft h-fit">
                <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                <div className="flex justify-between mb-4"><span>Subtotal</span><span className="font-bold">₹{cartTotal.toFixed(2)}</span></div>
                <Button variant="hero" className="w-full" size="lg">Proceed to Checkout</Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
