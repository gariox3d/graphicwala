import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Product, Category } from '@/lib/types';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Search, Package, ArrowUp, ArrowDown } from 'lucide-react';

const AdminProducts = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;

      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*, categories(id, name, description, image_url, is_active, created_at)').order('display_order', { ascending: true }),
        supabase.from('categories').select('*').eq('is_active', true),
      ]);

      if (productsRes.data) setProducts(productsRes.data as unknown as Product[]);
      if (categoriesRes.data) setCategories(categoriesRes.data as Category[]);
      setLoading(false);
    };

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('products').delete().eq('id', deleteId);

    if (error) {
      toast.error('Failed to delete product');
    } else {
      setProducts(products.filter(p => p.id !== deleteId));
      toast.success('Product deleted successfully');
    }
    setDeleteId(null);
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update product');
    } else {
      setProducts(products.map(p => 
        p.id === id ? { ...p, is_active: !currentStatus } : p
      ));
      toast.success(`Product ${!currentStatus ? 'activated' : 'deactivated'}`);
    }
  };

  const moveProduct = async (productId: string, direction: 'up' | 'down') => {
    const idx = products.findIndex(p => p.id === productId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= products.length) return;

    const currentOrder = products[idx].display_order ?? idx;
    const swapOrder = products[swapIdx].display_order ?? swapIdx;

    const [res1, res2] = await Promise.all([
      supabase.from('products').update({ display_order: swapOrder }).eq('id', products[idx].id),
      supabase.from('products').update({ display_order: currentOrder }).eq('id', products[swapIdx].id),
    ]);

    if (res1.error || res2.error) {
      toast.error('Failed to reorder');
      return;
    }

    const updated = [...products];
    [updated[idx], updated[swapIdx]] = [updated[swapIdx], updated[idx]];
    updated[idx].display_order = currentOrder;
    updated[swapIdx].display_order = swapOrder;
    setProducts(updated);
    toast.success('Order updated');
  };

  const toggleStock = async (id: string, currentStock: number) => {
    const newStock = currentStock === 0 ? 10 : 0;
    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update stock');
    } else {
      setProducts(products.map(p =>
        p.id === id ? { ...p, stock_quantity: newStock } : p
      ));
      toast.success(newStock === 0 ? 'Marked as Out of Stock' : 'Marked as In Stock (10)');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-muted-foreground">Loading products...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button asChild>
            <Link to="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                All Products ({filteredProducts.length})
              </CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No products found</p>
                <Button asChild className="mt-4">
                  <Link to="/admin/products/new">Add Your First Product</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Order</TableHead>
                      <TableHead>Image</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={!searchQuery && products.indexOf(product) === 0}
                              onClick={() => moveProduct(product.id, 'up')}
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={!searchQuery && products.indexOf(product) === products.length - 1}
                              onClick={() => moveProduct(product.id, 'down')}
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <img
                            src={product.image_url || '/placeholder.svg'}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.categories?.name || 'Uncategorized'}</TableCell>
                        <TableCell>₹{product.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleStock(product.id, product.stock_quantity)}
                            className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                              product.stock_quantity === 0
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : product.stock_quantity <= 5
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {product.stock_quantity === 0 ? 'Out of Stock' : `${product.stock_quantity} in stock`}
                          </button>
                        </TableCell>
                        <TableCell>
                          <button
                            onClick={() => toggleActive(product.id, product.is_active)}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              product.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                            >
                              <Link to={`/admin/products/${product.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminProducts;
