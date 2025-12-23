import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase.from('products').select('*, categories(*)').eq('id', id).maybeSingle();
      if (data) setProduct(data as Product);
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!product) return <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 flex items-center justify-center"><p>Product not found</p></main><Footer /></div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <Link to="/products" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8"><ArrowLeft className="h-4 w-4 mr-2" />Back to Products</Link>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted">
              {product.image_url ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-muted-foreground/30">{product.name.charAt(0)}</div>}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-primary mb-6">₹{product.price.toFixed(2)}</p>
              <p className="text-muted-foreground mb-6">{product.description || 'No description available.'}</p>
              <p className="text-sm text-muted-foreground mb-6">{product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}</p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border rounded-lg">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
              <Button variant="hero" size="xl" className="w-full" onClick={() => addToCart(product.id, quantity)} disabled={product.stock_quantity === 0}><ShoppingCart className="h-5 w-5" />Add to Cart</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
