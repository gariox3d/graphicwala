import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Minus, Plus, Image } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/types';
import { useCart } from '@/contexts/CartContext';
import DesignUpload from '@/components/DesignUpload';
import WhatsAppButton from '@/components/WhatsAppButton';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [designUrls, setDesignUrls] = useState<{ front: string | null; back: string | null }>({
    front: null,
    back: null,
  });

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('id', id)
        .maybeSingle();
      if (data) setProduct(data as Product);
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    // Check if customization is required
    if (product.customization_enabled && product.front_upload_required && !designUrls.front) {
      toast.error('Please upload your front design before adding to cart');
      return;
    }

    // Store design URLs in sessionStorage for checkout
    if (designUrls.front || designUrls.back) {
      const designs = JSON.parse(sessionStorage.getItem('productDesigns') || '{}');
      designs[product.id] = designUrls;
      sessionStorage.setItem('productDesigns', JSON.stringify(designs));
    }

    addToCart(product.id, quantity);
    toast.success('Added to cart! Your designs will be included with your order.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Product not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container">
          <Link
            to="/products"
            className="inline-flex items-center text-muted-foreground hover:text-primary mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-muted-foreground/30">
                    {product.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {product.categories && (
                    <Badge variant="secondary">{product.categories.name}</Badge>
                  )}
                  {product.customization_enabled && (
                    <Badge className="bg-primary/10 text-primary border-primary/30">
                      <Image className="h-3 w-3 mr-1" />
                      Customizable
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                <p className="text-3xl font-bold text-primary mb-4">
                  ₹{product.price.toFixed(2)}
                </p>
                <p className="text-muted-foreground mb-4">
                  {product.description || 'No description available.'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {product.stock_quantity > 0 ? (
                    <span className="text-green-600">{product.stock_quantity} in stock</span>
                  ) : (
                    <span className="text-destructive">Out of stock</span>
                  )}
                </p>
              </div>

              {/* Customization Section */}
              {product.customization_enabled && (
                <DesignUpload
                  productId={product.id}
                  productName={product.name}
                  frontRequired={product.front_upload_required}
                  backEnabled={product.back_upload_enabled}
                  onUploadComplete={(frontUrl, backUrl) => {
                    setDesignUrls({ front: frontUrl, back: backUrl });
                  }}
                  existingFrontUrl={designUrls.front}
                  existingBackUrl={designUrls.back}
                />
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </Button>
                  <WhatsAppButton
                    message={`Hi, I'm interested in ${product.name} (₹${product.price}). Can you help me?`}
                    variant="outline"
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white border-green-500"
                  />
                </div>
              </div>

              {/* Help Section */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Need help with your design? Contact us on WhatsApp and we'll assist you!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Floating WhatsApp Button */}
      <WhatsAppButton variant="floating" showText={false} />
    </div>
  );
};

export default ProductDetail;
