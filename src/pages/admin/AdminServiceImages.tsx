import { ChangeEvent, useEffect, useState } from 'react';
import { Image as ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HOMEPAGE_SERVICE_GROUPS } from '@/data/homepageServices';
import { supabase } from '@/integrations/supabase/client';
import { ACCEPT_ATTR, prepareImageForUpload, sanitizeFileName, validateImageFile } from '@/lib/imageOptimizer';
import { toast } from 'sonner';

interface ServiceImageRow {
  service_key: string;
  image_url: string;
  storage_path: string;
}

const AdminServiceImages = () => {
  const [images, setImages] = useState<Record<string, ServiceImageRow>>({});
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const loadImages = async () => {
    const { data, error } = await supabase
      .from('homepage_service_images')
      .select('service_key, image_url, storage_path');
    if (error) toast.error('Could not load service images');
    const next = (data || []).reduce<Record<string, ServiceImageRow>>((map, row) => {
      map[row.service_key] = row;
      return map;
    }, {});
    setImages(next);
    setLoading(false);
  };

  useEffect(() => {
    loadImages();
  }, []);

  const ensureAdmin = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error || !data.session) {
      toast.error('Session expired. Please sign in again.');
      return null;
    }
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.session.user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!role) {
      toast.error('Administrator access is required.');
      return null;
    }
    return data.session.user.id;
  };

  const uploadImage = async (serviceKey: string, file: File) => {
    setBusyKey(serviceKey);
    const userId = await ensureAdmin();
    if (!userId) {
      setBusyKey(null);
      return;
    }

    const check = await validateImageFile(file, { minWidth: 800 });
    if (!check.ok || !check.meta) {
      toast.error(check.error || 'Invalid image');
      setBusyKey(null);
      return;
    }
    if (check.warning) toast.warning(check.warning);

    const prepared = await prepareImageForUpload(file, check.meta);
    const safeName = sanitizeFileName(prepared.file.name);
    const extension = safeName.split('.').pop() || 'jpg';
    const storagePath = `homepage-services/${serviceKey}-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('ad-images').upload(storagePath, prepared.file, {
      upsert: false,
      contentType: prepared.file.type,
      cacheControl: '31536000',
    });
    if (uploadError) {
      toast.error(uploadError.message);
      setBusyKey(null);
      return;
    }

    const { data: publicData } = supabase.storage.from('ad-images').getPublicUrl(storagePath);
    const previous = images[serviceKey];
    const { error: saveError } = await supabase.from('homepage_service_images').upsert({
      service_key: serviceKey,
      image_url: publicData.publicUrl,
      storage_path: storagePath,
      updated_by: userId,
    });
    if (saveError) {
      await supabase.storage.from('ad-images').remove([storagePath]);
      toast.error(saveError.message);
      setBusyKey(null);
      return;
    }

    if (previous?.storage_path) {
      await supabase.storage.from('ad-images').remove([previous.storage_path]);
    }
    await loadImages();
    setBusyKey(null);
    toast.success(previous ? 'Image replaced' : 'Image uploaded');
  };

  const handleFile = (serviceKey: string) => async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) await uploadImage(serviceKey, file);
  };

  const deleteImage = async (serviceKey: string) => {
    const current = images[serviceKey];
    if (!current) return;
    setBusyKey(serviceKey);
    if (!(await ensureAdmin())) {
      setBusyKey(null);
      return;
    }
    const { error } = await supabase.from('homepage_service_images').delete().eq('service_key', serviceKey);
    if (error) {
      toast.error(error.message);
      setBusyKey(null);
      return;
    }
    await supabase.storage.from('ad-images').remove([current.storage_path]);
    await loadImages();
    setBusyKey(null);
    toast.success('Image deleted');
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><ImageIcon className="h-6 w-6" /> Service Images</h1>
          <p className="text-sm text-muted-foreground">Manage thumbnails for the DESIGN, PRINT, and CUSTOMIZE cards on the homepage.</p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-7 w-7 animate-spin" /></div>
        ) : HOMEPAGE_SERVICE_GROUPS.map((group) => (
          <Card key={group.title}>
            <CardHeader><CardTitle>{group.title}</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => {
                const current = images[item.key];
                const busy = busyKey === item.key;
                return (
                  <div key={item.key} className="space-y-3 rounded-lg border border-border p-3">
                    <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-muted">
                      {current ? (
                        <img src={current.image_url} alt={item.label} className="h-full w-full object-contain" />
                      ) : (
                        <ImageIcon className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>
                    <p className="font-semibold">{item.label}</p>
                    <div className="flex flex-wrap gap-2">
                      <label>
                        <input type="file" accept={ACCEPT_ATTR} className="hidden" disabled={busy} onChange={handleFile(item.key)} />
                        <Button asChild size="sm" variant="outline" disabled={busy}>
                          <span>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}{current ? 'Replace' : 'Upload'}</span>
                        </Button>
                      </label>
                      {current && (
                        <Button size="sm" variant="destructive" disabled={busy} onClick={() => deleteImage(item.key)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminServiceImages;
