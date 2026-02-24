import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface Ad {
  id: string;
  slot_id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
  slot_width: number;
  slot_height: number;
  created_at: string;
}

const AD_SLOTS = [
  { id: 'homepage_after_hero', label: 'Homepage — After Hero', width: 1200, height: 200 },
  { id: 'homepage_after_categories', label: 'Homepage — After Categories', width: 1200, height: 200 },
  { id: 'homepage_after_products', label: 'Homepage — After Products', width: 1200, height: 200 },
  { id: 'homepage_mid_page', label: 'Homepage — Mid Page', width: 1200, height: 300 },
  { id: 'products_page_top', label: 'Products Page — Top', width: 1200, height: 150 },
  { id: 'product_detail_bottom', label: 'Product Detail — Bottom', width: 1200, height: 200 },
];

const AdminAds = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // New ad form
  const [selectedSlot, setSelectedSlot] = useState(AD_SLOTS[0].id);
  const [title, setTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const fetchAds = async () => {
    const { data } = await supabase
      .from('custom_ads')
      .select('*')
      .order('slot_id')
      .order('display_order', { ascending: true });
    if (data) setAds(data as unknown as Ad[]);
    setLoading(false);
  };

  useEffect(() => { fetchAds(); }, []);

  const handleImageUpload = async (file: File) => {
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('ad-images').upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('ad-images').getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleAddAd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileInput = (e.target as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) { toast.error('Image select karo'); return; }

    setUploading(true);
    try {
      const imageUrl = await handleImageUpload(file);
      const slot = AD_SLOTS.find(s => s.id === selectedSlot)!;
      const { error } = await supabase.from('custom_ads').insert({
        slot_id: selectedSlot,
        title,
        image_url: imageUrl,
        link_url: linkUrl || null,
        slot_width: slot.width,
        slot_height: slot.height,
      } as any);
      if (error) throw error;
      toast.success('Ad added!');
      setTitle('');
      setLinkUrl('');
      fileInput.value = '';
      fetchAds();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (ad: Ad) => {
    await supabase.from('custom_ads').update({ is_active: !ad.is_active } as any).eq('id', ad.id);
    fetchAds();
  };

  const deleteAd = async (ad: Ad) => {
    if (!confirm('Delete this ad?')) return;
    // Delete image from storage
    const path = ad.image_url.split('/ad-images/')[1];
    if (path) await supabase.storage.from('ad-images').remove([path]);
    await supabase.from('custom_ads').delete().eq('id', ad.id);
    toast.success('Ad deleted');
    fetchAds();
  };

  const currentSlot = AD_SLOTS.find(s => s.id === selectedSlot)!;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Custom Ads / Banners</h1>
          <p className="text-muted-foreground">Apne ads manage karo — image upload karo, slot choose karo</p>
        </div>

        {/* Add New Ad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Naya Ad Add Karo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddAd} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ad Slot (Location)</Label>
                  <Select value={selectedSlot} onValueChange={setSelectedSlot}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AD_SLOTS.map(slot => (
                        <SelectItem key={slot.id} value={slot.id}>
                          {slot.label} — {slot.width}×{slot.height}px
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    📐 Recommended size: <strong>{currentSlot.width} × {currentSlot.height} px</strong>
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Title (Optional)</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Sale Banner" />
                </div>
                <div className="space-y-2">
                  <Label>Link URL (Optional)</Label>
                  <Input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>Ad Image *</Label>
                  <Input type="file" accept="image/*" required />
                </div>
              </div>
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Add Ad'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Ads by Slot */}
        {AD_SLOTS.map(slot => {
          const slotAds = ads.filter(a => a.slot_id === slot.id);
          if (slotAds.length === 0) return null;
          return (
            <Card key={slot.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  {slot.label}
                  <span className="text-xs font-normal text-muted-foreground ml-2">
                    ({slot.width}×{slot.height}px)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {slotAds.map(ad => (
                    <div key={ad.id} className="border rounded-lg overflow-hidden">
                      <div className="relative bg-muted" style={{ maxHeight: 200 }}>
                        <img src={ad.image_url} alt={ad.title} className="w-full h-auto object-cover" style={{ maxHeight: 200 }} />
                        {!ad.is_active && (
                          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                            <span className="text-sm font-medium text-muted-foreground">Inactive</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{ad.title || 'Untitled'}</span>
                          <div className="flex items-center gap-2">
                            <Switch checked={ad.is_active} onCheckedChange={() => toggleActive(ad)} />
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteAd(ad)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {ad.link_url && (
                          <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" /> {ad.link_url}
                          </a>
                        )}
                        <p className="text-xs text-muted-foreground">Size: {ad.slot_width}×{ad.slot_height}px</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {!loading && ads.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Koi ad nahi hai abhi. Upar se add karo!</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAds;
