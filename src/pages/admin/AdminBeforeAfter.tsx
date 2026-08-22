import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { validateImageFile, prepareImageForUpload } from '@/lib/imageOptimizer';
import { toast } from 'sonner';
import { Plus, Trash2, ArrowRight, ArrowUp, ArrowDown, Loader2, Upload } from 'lucide-react';

interface ShowcaseItem {
  id: string;
  product_name: string;
  customer_name: string;
  before_image_url: string;
  after_image_url: string;
  caption: string | null;
  is_active: boolean;
  display_order: number;
}

const AdminBeforeAfter = () => {
  const [items, setItems] = useState<ShowcaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    product_name: '',
    customer_name: 'Happy Customer',
    before_image_url: '',
    after_image_url: '',
    caption: '',
  });
  const [uploading, setUploading] = useState<'before' | 'after' | null>(null);

  const fetchItems = async () => {
    const { data } = await supabase
      .from('before_after_showcase')
      .select('*')
      .order('display_order', { ascending: true });
    if (data) setItems(data as ShowcaseItem[]);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const uploadImage = async (file: File, type: 'before' | 'after') => {
    setUploading(type);
    const check = await validateImageFile(file);
    if (!check.ok || !check.meta) {
      toast.error(check.error || 'Invalid image');
      setUploading(null);
      return;
    }
    const prepared = await prepareImageForUpload(file, check.meta);
    const ext = prepared.file.type === 'image/webp' ? 'webp' : file.name.split('.').pop();
    const filePath = `before-after/${Date.now()}-${type}.${ext}`;
    const { error } = await supabase.storage
      .from('product-images')
      .upload(filePath, prepared.file, { contentType: prepared.file.type, cacheControl: '31536000' });
    if (error) {
      toast.error('Upload failed: ' + error.message);
      setUploading(null);
      return;
    }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
    setForm(prev => ({
      ...prev,
      [type === 'before' ? 'before_image_url' : 'after_image_url']: urlData.publicUrl,
    }));
    setUploading(null);
  };

  const handleAdd = async () => {
    if (!form.product_name || !form.before_image_url || !form.after_image_url) {
      toast.error('Product name and both images are required');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('before_after_showcase').insert({
      product_name: form.product_name,
      customer_name: form.customer_name || 'Happy Customer',
      before_image_url: form.before_image_url,
      after_image_url: form.after_image_url,
      caption: form.caption || null,
      display_order: items.length,
    });
    if (error) toast.error(error.message);
    else {
      toast.success('Showcase item added!');
      setDialogOpen(false);
      setForm({ product_name: '', customer_name: 'Happy Customer', before_image_url: '', after_image_url: '', caption: '' });
      fetchItems();
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('before_after_showcase').update({ is_active: !current }).eq('id', id);
    fetchItems();
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this showcase item?')) return;
    await supabase.from('before_after_showcase').delete().eq('id', id);
    toast.success('Deleted');
    fetchItems();
  };

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newItems.length) return;

    await Promise.all([
      supabase.from('before_after_showcase').update({ display_order: swapIndex }).eq('id', newItems[index].id),
      supabase.from('before_after_showcase').update({ display_order: index }).eq('id', newItems[swapIndex].id),
    ]);
    fetchItems();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Before / After Gallery</h1>
            <p className="text-muted-foreground">Customer design vs final printed product showcase</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Showcase</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Before/After Showcase</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input value={form.product_name} onChange={e => setForm(p => ({ ...p, product_name: e.target.value }))} placeholder="e.g. Photo Frame" />
                </div>
                <div>
                  <Label>Customer Name</Label>
                  <Input value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Before (Design) Image *</Label>
                    <div className="mt-1 space-y-2">
                      {form.before_image_url && <img src={form.before_image_url} className="w-full aspect-square object-cover rounded-lg" />}
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
                        <Upload className="h-4 w-4" />
                        {uploading === 'before' ? 'Uploading...' : 'Upload Image'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'before')} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label>After (Product) Image *</Label>
                    <div className="mt-1 space-y-2">
                      {form.after_image_url && <img src={form.after_image_url} className="w-full aspect-square object-cover rounded-lg" />}
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
                        <Upload className="h-4 w-4" />
                        {uploading === 'after' ? 'Uploading...' : 'Upload Image'}
                        <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0], 'after')} />
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Caption (Optional)</Label>
                  <Textarea value={form.caption} onChange={e => setForm(p => ({ ...p, caption: e.target.value }))} placeholder="Short description..." />
                </div>
                <Button onClick={handleAdd} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Add Showcase
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No showcase items yet. Add your first before/after comparison!</CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {items.map((item, index) => (
              <Card key={item.id} className={!item.is_active ? 'opacity-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Before image */}
                    <img src={item.before_image_url} className="w-16 h-16 rounded object-cover" alt="Before" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    {/* After image */}
                    <img src={item.after_image_url} className="w-16 h-16 rounded object-cover" alt="After" />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{item.product_name}</h3>
                      <p className="text-xs text-muted-foreground">by {item.customer_name}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch checked={item.is_active} onCheckedChange={() => toggleActive(item.id, item.is_active)} />
                      <Button variant="ghost" size="icon" onClick={() => moveItem(index, 'up')} disabled={index === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBeforeAfter;
