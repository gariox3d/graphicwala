import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Category, UploadField } from '@/lib/types';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Plus, Trash2, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import MultiImageUpload from '@/components/admin/MultiImageUpload';

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = id && id !== 'new';
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productImages, setProductImages] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock_quantity: '0',
    is_active: true,
    customization_enabled: false,
  });

  const [uploadConfig, setUploadConfig] = useState<UploadField[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAdmin) return;
      setLoading(true);

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true);
      
      if (categoriesData) setCategories(categoriesData as Category[]);

      // Fetch product if editing
      if (isEditing) {
        const { data: product, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error || !product) {
          toast.error('Product not found');
          navigate('/admin/products');
          return;
        }

        setFormData({
          name: product.name,
          description: product.description || '',
          price: product.price.toString(),
          category_id: product.category_id || '',
          stock_quantity: product.stock_quantity?.toString() || '0',
          is_active: product.is_active,
          customization_enabled: product.customization_enabled || false,
        });
        
        // Load images - check image_urls first, then fallback to image_url
        const imageUrls = product.image_urls as string[] | null;
        if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
          setProductImages(imageUrls);
        } else if (product.image_url) {
          setProductImages([product.image_url]);
        }
        
        // Parse upload_config
        const config = product.upload_config as unknown as UploadField[] | null;
        if (config && Array.isArray(config) && config.length > 0) {
          setUploadConfig(config);
        } else if (product.customization_enabled) {
          // Migrate old format to new format
          const legacyConfig: UploadField[] = [];
          if (product.front_upload_required) {
            legacyConfig.push({ id: 'front', label: 'Front Design', required: true });
          }
          if (product.back_upload_enabled) {
            legacyConfig.push({ id: 'back', label: 'Back Design', required: false });
          }
          if (legacyConfig.length > 0) {
            setUploadConfig(legacyConfig);
          }
        }
      }

      setLoading(false);
    };

    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, id, isEditing, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addUploadField = () => {
    const newId = `upload_${Date.now()}`;
    setUploadConfig([
      ...uploadConfig,
      { id: newId, label: `Photo ${uploadConfig.length + 1}`, required: false },
    ]);
  };

  const updateUploadField = (index: number, field: Partial<UploadField>) => {
    const updated = [...uploadConfig];
    updated[index] = { ...updated[index], ...field };
    setUploadConfig(updated);
  };

  const removeUploadField = (index: number) => {
    setUploadConfig(uploadConfig.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (formData.customization_enabled && uploadConfig.length === 0) {
      toast.error('Please add at least one upload field for customizable products');
      return;
    }

    setSaving(true);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        category_id: formData.category_id || null,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        is_active: formData.is_active,
        // Primary image (first in array) for backwards compatibility
        image_url: productImages.length > 0 ? productImages[0] : null,
        // All images as array
        image_urls: productImages,
        customization_enabled: formData.customization_enabled,
        upload_config: formData.customization_enabled ? JSON.parse(JSON.stringify(uploadConfig)) : [],
        // Keep legacy fields for backwards compatibility
        front_upload_required: uploadConfig.some(f => f.id === 'front' && f.required),
        back_upload_enabled: uploadConfig.some(f => f.id === 'back'),
      };

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Product created successfully');
      }

      navigate('/admin/products');
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Update product details' : 'Create a new product'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter product description"
                      rows={4}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹) *</Label>
                      <Input
                        id="price"
                        name="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock_quantity">Stock Quantity</Label>
                      <Input
                        id="stock_quantity"
                        name="stock_quantity"
                        type="number"
                        min="0"
                        value={formData.stock_quantity}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Customization Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-primary" />
                    Photo Upload Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="customization_enabled">Enable Custom Photo Upload</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow customers to upload their own photos/designs
                      </p>
                    </div>
                    <Switch
                      id="customization_enabled"
                      checked={formData.customization_enabled}
                      onCheckedChange={(checked) => {
                        setFormData({ ...formData, customization_enabled: checked });
                        if (checked && uploadConfig.length === 0) {
                          setUploadConfig([
                            { id: 'front', label: 'Front Photo', required: true },
                          ]);
                        }
                      }}
                    />
                  </div>

                  {formData.customization_enabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <Label>Upload Fields</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addUploadField}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Field
                        </Button>
                      </div>

                      {uploadConfig.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No upload fields configured. Add at least one.
                        </p>
                      )}

                      {uploadConfig.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                        >
                          <div className="flex-1">
                            <Input
                              value={field.label}
                              onChange={(e) =>
                                updateUploadField(index, { label: e.target.value })
                              }
                              placeholder="Field label (e.g., Front Photo)"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`required-${field.id}`}
                              checked={field.required}
                              onCheckedChange={(checked) =>
                                updateUploadField(index, { required: !!checked })
                              }
                            />
                            <Label
                              htmlFor={`required-${field.id}`}
                              className="text-sm whitespace-nowrap"
                            >
                              Required
                            </Label>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeUploadField(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                        <strong>Examples:</strong>
                        <ul className="list-disc list-inside mt-1">
                          <li>Keychain: Front Photo (required) + Back Photo (required)</li>
                          <li>Photo Frame: 1 Photo (required)</li>
                          <li>Visiting Card: Front (required) + Back (optional)</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <MultiImageUpload
                    images={productImages}
                    onChange={setProductImages}
                    maxImages={10}
                  />
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_active">Active</Label>
                      <p className="text-sm text-muted-foreground">
                        Visible to customers
                      </p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/admin/products')}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default ProductForm;
