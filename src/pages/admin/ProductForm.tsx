import { useEffect, useState, useCallback, type SetStateAction } from 'react';
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
import { Loader2, ArrowLeft, Plus, Trash2, Image, Truck, Clock, IndianRupee, Scale, Ruler, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import MultiImageUpload from '@/components/admin/MultiImageUpload';
import { useAdminDraftState } from '@/hooks/useAdminDraftState';

type ProductFormData = {
  name: string;
  description: string;
  price: string;
  category_id: string;
  stock_quantity: string;
  is_active: boolean;
  customization_enabled: boolean;
  delivery_charge: string;
  cutoff_time: string;
  enable_delivery: boolean;
  weight_kg: string;
  length_cm: string;
  breadth_cm: string;
  height_cm: string;
  flash_sale_enabled: boolean;
  sale_price: string;
  sale_start: string;
  sale_end: string;
};

type ProductFormDraft = {
  formData: ProductFormData;
  uploadConfig: UploadField[];
  productImages: string[];
};

const ProductForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = id && id !== 'new';
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const createInitialFormData = useCallback((): ProductFormData => ({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock_quantity: '0',
    is_active: true,
    customization_enabled: false,
    delivery_charge: '',
    cutoff_time: '18:00',
    enable_delivery: true,
    // Shipping dimensions
    weight_kg: '0.5',
    length_cm: '10',
    breadth_cm: '10',
    height_cm: '5',
    // Flash Sale
    flash_sale_enabled: false,
    sale_price: '',
    sale_start: '',
    sale_end: '',
  }), []);

  const createInitialDraft = useCallback((): ProductFormDraft => ({
    formData: createInitialFormData(),
    uploadConfig: [],
    productImages: [],
  }), [createInitialFormData]);

  const {
    state: draft,
    setState: setDraft,
    initializeFromServer,
    clearDraft,
  } = useAdminDraftState(
    `admin:product-form:draft:${id || 'new'}`,
    createInitialDraft,
  );

  const { formData, uploadConfig, productImages } = draft;

  const setFormData = useCallback((nextState: SetStateAction<ProductFormData>) => {
    setDraft((previousDraft) => ({
      ...previousDraft,
      formData:
        typeof nextState === 'function'
          ? (nextState as (value: ProductFormData) => ProductFormData)(previousDraft.formData)
          : nextState,
    }));
  }, [setDraft]);

  const setUploadConfig = useCallback((nextState: SetStateAction<UploadField[]>) => {
    setDraft((previousDraft) => ({
      ...previousDraft,
      uploadConfig:
        typeof nextState === 'function'
          ? (nextState as (value: UploadField[]) => UploadField[])(previousDraft.uploadConfig)
          : nextState,
    }));
  }, [setDraft]);

  const setProductImages = useCallback((nextState: SetStateAction<string[]>) => {
    setDraft((previousDraft) => ({
      ...previousDraft,
      productImages:
        typeof nextState === 'function'
          ? (nextState as (value: string[]) => string[])(previousDraft.productImages)
          : nextState,
    }));
  }, [setDraft]);

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
          delivery_charge: product.delivery_charge?.toString() || '',
          cutoff_time: product.cutoff_time?.slice(0, 5) || '18:00',
          enable_delivery: product.enable_delivery ?? true,
          // Shipping dimensions
          weight_kg: product.weight_kg?.toString() || '0.5',
          length_cm: product.length_cm?.toString() || '10',
          breadth_cm: product.breadth_cm?.toString() || '10',
          height_cm: product.height_cm?.toString() || '5',
          // Flash Sale
          flash_sale_enabled: !!product.sale_price,
          sale_price: product.sale_price?.toString() || '',
          sale_start: product.sale_start ? new Date(product.sale_start).toISOString().slice(0, 16) : '',
          sale_end: product.sale_end ? new Date(product.sale_end).toISOString().slice(0, 16) : '',
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
        // Delivery settings
        delivery_charge: formData.delivery_charge ? parseFloat(formData.delivery_charge) : null,
        cutoff_time: formData.cutoff_time ? `${formData.cutoff_time}:00` : '18:00:00',
        enable_delivery: formData.enable_delivery,
        delivery_days: 7,
        // Shipping dimensions for Shiprocket
        weight_kg: parseFloat(formData.weight_kg) || 0.5,
        length_cm: parseFloat(formData.length_cm) || 10,
        breadth_cm: parseFloat(formData.breadth_cm) || 10,
        height_cm: parseFloat(formData.height_cm) || 5,
        // Flash Sale
        sale_price: formData.flash_sale_enabled && formData.sale_price ? parseFloat(formData.sale_price) : null,
        sale_start: formData.flash_sale_enabled && formData.sale_start ? new Date(formData.sale_start).toISOString() : null,
        sale_end: formData.flash_sale_enabled && formData.sale_end ? new Date(formData.sale_end).toISOString() : null,
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

              {/* Delivery Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Delivery Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable_delivery">Enable Delivery</Label>
                      <p className="text-sm text-muted-foreground">
                        Show delivery countdown timer
                      </p>
                    </div>
                    <Switch
                      id="enable_delivery"
                      checked={formData.enable_delivery}
                      onCheckedChange={(checked) => setFormData({ ...formData, enable_delivery: checked })}
                    />
                  </div>

                  {formData.enable_delivery && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="delivery_charge" className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4" />
                          Delivery Charge (₹) *
                        </Label>
                        <Input
                          id="delivery_charge"
                          name="delivery_charge"
                          type="number"
                          min="0"
                          value={formData.delivery_charge}
                          onChange={handleInputChange}
                          placeholder="Enter delivery charge"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Set to 0 for free delivery
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cutoff_time" className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Order Cut-off Time
                        </Label>
                        <Input
                          id="cutoff_time"
                          name="cutoff_time"
                          type="time"
                          value={formData.cutoff_time}
                          onChange={handleInputChange}
                        />
                        <p className="text-xs text-muted-foreground">
                          Orders after this time start delivery from next day
                        </p>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                        <strong>Fixed: 7-Day Delivery</strong>
                        <p className="mt-1">
                          All products have 7-day delivery. This cannot be changed.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Shipping Dimensions for Shiprocket */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-primary" />
                    Shipping Dimensions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-700">
                    <strong>📦 Required for Shiprocket</strong>
                    <p className="mt-1">
                      These dimensions are used to calculate real shipping rates when Shiprocket is enabled.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight_kg" className="flex items-center gap-2">
                      <Scale className="h-4 w-4" />
                      Weight (kg) *
                    </Label>
                    <Input
                      id="weight_kg"
                      name="weight_kg"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={formData.weight_kg}
                      onChange={handleInputChange}
                      placeholder="0.5"
                    />
                    <p className="text-xs text-muted-foreground">
                      Package weight including product and packaging
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="length_cm" className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        Length (cm)
                      </Label>
                      <Input
                        id="length_cm"
                        name="length_cm"
                        type="number"
                        min="1"
                        value={formData.length_cm}
                        onChange={handleInputChange}
                        placeholder="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="breadth_cm">Breadth (cm)</Label>
                      <Input
                        id="breadth_cm"
                        name="breadth_cm"
                        type="number"
                        min="1"
                        value={formData.breadth_cm}
                        onChange={handleInputChange}
                        placeholder="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height_cm">Height (cm)</Label>
                      <Input
                        id="height_cm"
                        name="height_cm"
                        type="number"
                        min="1"
                        value={formData.height_cm}
                        onChange={handleInputChange}
                        placeholder="5"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flash Sale */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Flash Sale
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="flash_sale_enabled">Enable Flash Sale</Label>
                      <p className="text-sm text-muted-foreground">
                        Show this product in the homepage Flash Sale banner
                      </p>
                    </div>
                    <Switch
                      id="flash_sale_enabled"
                      checked={formData.flash_sale_enabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, flash_sale_enabled: checked })}
                    />
                  </div>

                  {formData.flash_sale_enabled && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="space-y-2">
                        <Label htmlFor="sale_price" className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4" />
                          Sale Price (₹) *
                        </Label>
                        <Input
                          id="sale_price"
                          name="sale_price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.sale_price}
                          onChange={handleInputChange}
                          placeholder="Sale price (must be less than original)"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="sale_start" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Sale Start
                          </Label>
                          <Input
                            id="sale_start"
                            name="sale_start"
                            type="datetime-local"
                            value={formData.sale_start}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sale_end">Sale End</Label>
                          <Input
                            id="sale_end"
                            name="sale_end"
                            type="datetime-local"
                            value={formData.sale_end}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      {formData.price && formData.sale_price && parseFloat(formData.sale_price) < parseFloat(formData.price) && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-primary font-medium">
                          🔥 Discount: {Math.round(((parseFloat(formData.price) - parseFloat(formData.sale_price)) / parseFloat(formData.price)) * 100)}% OFF
                        </div>
                      )}
                      {formData.sale_price && parseFloat(formData.sale_price) >= parseFloat(formData.price) && formData.price && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                          ⚠️ Sale price must be less than original price (₹{formData.price})
                        </div>
                      )}
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
