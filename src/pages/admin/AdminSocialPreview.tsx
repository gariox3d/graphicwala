import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Upload, Trash2, Share2 } from 'lucide-react';

const DEFAULT_OG = 'https://www.graphicwala.com/og-square.png';

const AdminSocialPreview = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [row, setRow] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('store_settings')
      .select('id, og_image_url, og_title, og_description')
      .limit(1)
      .maybeSingle();
    setRow(data || { og_image_url: null, og_title: '', og_description: '' });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const ensureAdmin = async () => {
    const { data: refreshed, error } = await supabase.auth.refreshSession();
    if (error || !refreshed.session) {
      toast.error('Session expired. Please sign in again.');
      return false;
    }
    const { data: adminRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', refreshed.session.user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!adminRole) {
      toast.error('Administrator access is required.');
      return false;
    }
    return true;
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    if (!(await ensureAdmin())) return setUploading(false);

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploading(false);
      return toast.error('Only JPG, PNG or WebP images are allowed');
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploading(false);
      return toast.error('Image must be smaller than 5MB');
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `social/og-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('ad-images').upload(path, file, {
      upsert: false,
      contentType: file.type,
      cacheControl: '31536000',
    });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from('ad-images').getPublicUrl(path);
    setRow((r: any) => ({ ...r, og_image_url: data.publicUrl }));
    setUploading(false);
    toast.success('Image uploaded — click Save to apply');
  };

  const save = async () => {
    setSaving(true);
    if (!(await ensureAdmin())) return setSaving(false);
    const payload = {
      og_image_url: row.og_image_url || null,
      og_title: row.og_title || null,
      og_description: row.og_description || null,
    };
    const { error } = row?.id
      ? await supabase.from('store_settings').update(payload).eq('id', row.id)
      : await supabase.from('store_settings').insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success('Social preview saved');
    load();
  };

  if (loading || !row) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const previewImage = row.og_image_url || DEFAULT_OG;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="h-5 w-5" /> Social Preview (OG Image)
          </h1>
          <p className="text-sm text-muted-foreground">
            Ye image tab dikhti hai jab koi aapke website ka link WhatsApp, Facebook ya
            Instagram par share karta hai. Recommended size: 1200 x 630 px (ya 1080 x 1080 square).
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preview image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full max-w-md rounded-xl overflow-hidden border bg-white">
              <img src={previewImage} alt="Social preview" className="w-full h-auto object-contain" />
            </div>
            <div className="flex flex-wrap gap-2">
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
                    {row.og_image_url ? 'Replace image' : 'Upload image'}
                  </span>
                </Button>
              </label>
              {row.og_image_url && (
                <Button
                  variant="ghost"
                  onClick={() => setRow({ ...row, og_image_url: null })}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Use default
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Label>Or paste an image URL</Label>
              <Input
                value={row.og_image_url || ''}
                placeholder="https://..."
                onChange={(e) => setRow({ ...row, og_image_url: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={row.og_title || ''}
                placeholder="Graphicwala | Custom Photo Frames, PVC Cards & Keychains"
                onChange={(e) => setRow({ ...row, og_title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={row.og_description || ''}
                placeholder="Order customized photo frames, PVC cards, ID cards & keychains online."
                onChange={(e) => setRow({ ...row, og_description: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Note: WhatsApp/Facebook purani preview kuch din tak cache karte hain. Turant update
          dekhne ke liye Facebook Sharing Debugger me link daal kar "Scrape Again" karein.
        </p>
      </div>
    </AdminLayout>
  );
};

export default AdminSocialPreview;
