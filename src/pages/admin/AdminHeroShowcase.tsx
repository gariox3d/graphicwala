import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Upload, Trash2 } from 'lucide-react';

const AdminHeroShowcase = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [row, setRow] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hero_showcase')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setRow(
      data || {
        is_active: true,
        collection_label: 'COLLECTION 01',
        eyebrow: 'YOUR PHOTO',
        title: 'A moment,\nframed forever.',
        price_prefix: 'STARTS AT',
        price_label: '₹99',
        rating_value: '4.9 / 5',
        rating_subtitle: '10K+ ORDERS',
        image_url: null,
      }
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const ensureFreshAdminSession = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast.error('Your session has expired. Please sign in again.');
      return false;
    }

    const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshedData.session) {
      toast.error('Your session could not be refreshed. Please sign in again.');
      return false;
    }

    const { data: adminRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', refreshedData.session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !adminRole) {
      toast.error('Administrator access is required.');
      return false;
    }

    return true;
  };

  const save = async () => {
    setSaving(true);
    const hasAdminSession = await ensureFreshAdminSession();
    if (!hasAdminSession) {
      setSaving(false);
      return;
    }
    const payload = {
      is_active: row.is_active,
      collection_label: row.collection_label,
      eyebrow: row.eyebrow,
      title: row.title,
      price_prefix: row.price_prefix,
      price_label: row.price_label,
      rating_value: row.rating_value,
      rating_subtitle: row.rating_subtitle,
      image_url: row.image_url,
    };
    const { error } = row.id
      ? await supabase.from('hero_showcase').update(payload).eq('id', row.id)
      : await supabase.from('hero_showcase').insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Hero showcase saved');
    load();
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    const hasAdminSession = await ensureFreshAdminSession();
    if (!hasAdminSession) {
      setUploading(false);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploading(false);
      toast.error('Please upload a JPG, PNG, or WebP image.');
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `hero/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('ad-images').upload(path, file, {
      upsert: false,
      cacheControl: '3600',
    });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from('ad-images').getPublicUrl(path);
    setRow((r: any) => ({ ...r, image_url: data.publicUrl }));
    setUploading(false);
    toast.success('Image uploaded — click Save to apply');
  };

  const removeImage = () => setRow((r: any) => ({ ...r, image_url: null }));

  if (loading || !row) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Hero Showcase Card</h1>
          <p className="text-sm text-muted-foreground">
            Manage the featured card on the homepage hero section.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Visibility</CardTitle>
            <div className="flex items-center gap-2">
              <Switch
                checked={row.is_active}
                onCheckedChange={(v) => setRow({ ...row, is_active: v })}
              />
              <span className="text-sm">{row.is_active ? 'Showing on site' : 'Hidden'}</span>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Image (optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {row.image_url && (
              <div className="relative w-48 aspect-[4/5] rounded-xl overflow-hidden border">
                <img src={row.image_url} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex gap-2">
              <label className="inline-flex">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                  }}
                />
                <Button asChild variant="outline" disabled={uploading}>
                  <span>
                    {uploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {row.image_url ? 'Replace image' : 'Upload image'}
                  </span>
                </Button>
              </label>
              {row.image_url && (
                <Button variant="ghost" onClick={removeImage}>
                  <Trash2 className="h-4 w-4 mr-2" /> Remove
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              4:5 portrait works best. If no image, the text below is shown inside the card.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Card Text</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Collection Label</Label>
              <Input
                value={row.collection_label}
                onChange={(e) => setRow({ ...row, collection_label: e.target.value })}
              />
            </div>
            <div>
              <Label>Eyebrow</Label>
              <Input
                value={row.eyebrow}
                onChange={(e) => setRow({ ...row, eyebrow: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Title (use new lines for wrap)</Label>
              <textarea
                className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[80px]"
                value={row.title}
                onChange={(e) => setRow({ ...row, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Price Prefix</Label>
              <Input
                value={row.price_prefix}
                onChange={(e) => setRow({ ...row, price_prefix: e.target.value })}
              />
            </div>
            <div>
              <Label>Price Label</Label>
              <Input
                value={row.price_label}
                onChange={(e) => setRow({ ...row, price_label: e.target.value })}
              />
            </div>
            <div>
              <Label>Rating Value</Label>
              <Input
                value={row.rating_value}
                onChange={(e) => setRow({ ...row, rating_value: e.target.value })}
              />
            </div>
            <div>
              <Label>Rating Subtitle</Label>
              <Input
                value={row.rating_subtitle}
                onChange={(e) => setRow({ ...row, rating_subtitle: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving} size="lg">
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminHeroShowcase;