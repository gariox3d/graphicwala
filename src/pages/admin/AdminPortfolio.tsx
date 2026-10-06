import { useEffect, useState } from 'react';
import { Briefcase, Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { PORTFOLIO_CATEGORIES, PortfolioItem } from '@/data/portfolioCategories';
import { ACCEPT_ATTR, prepareImageForUpload, sanitizeFileName, validateImageFile } from '@/lib/imageOptimizer';
import { toast } from 'sonner';

const BUCKET = 'ad-images';
const empty = { id: '', title: '', description: '', category: PORTFOLIO_CATEGORIES[0] as string, is_active: true };

const AdminPortfolio = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('All');

  const load = async () => {
    const { data, error } = await supabase.from('portfolio_items').select('*').order('display_order').order('created_at', { ascending: false });
    if (error) toast.error('Could not load portfolio');
    setItems((data as PortfolioItem[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const ensureAdmin = async () => {
    const { data } = await supabase.auth.refreshSession();
    if (!data.session) { toast.error('Session expired. Please sign in again.'); return false; }
    const { data: role } = await supabase.from('user_roles').select('role').eq('user_id', data.session.user.id).eq('role', 'admin').maybeSingle();
    if (!role) { toast.error('Administrator access is required.'); return false; }
    return true;
  };

  const uploadFile = async (f: File) => {
    const check = await validateImageFile(f, { minWidth: 600 });
    if (!check.ok || !check.meta) { toast.error(check.error || 'Invalid image'); return null; }
    if (check.warning) toast.warning(check.warning);
    const prepared = await prepareImageForUpload(f, check.meta);
    const ext = sanitizeFileName(prepared.file.name).split('.').pop() || 'jpg';
    const path = `portfolio/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, prepared.file, { contentType: prepared.file.type, cacheControl: '31536000' });
    if (error) { toast.error(error.message); return null; }
    return { path, url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.id && !file) return toast.error('Please choose an image');
    setSaving(true);
    try {
      if (!(await ensureAdmin())) return;
      const existing = items.find((i) => i.id === form.id);
      let uploaded: { path: string; url: string } | null = null;
      if (file) { uploaded = await uploadFile(file); if (!uploaded) return; }
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category,
        is_active: form.is_active,
        ...(uploaded ? { image_url: uploaded.url, storage_path: uploaded.path } : {}),
      };
      const { error } = form.id
        ? await supabase.from('portfolio_items').update(payload).eq('id', form.id)
        : await supabase.from('portfolio_items').insert({ ...payload, image_url: uploaded!.url, storage_path: uploaded!.path });
      if (error) {
        if (uploaded) await supabase.storage.from(BUCKET).remove([uploaded.path]);
        toast.error(error.message);
        return;
      }
      if (uploaded && existing?.storage_path) await supabase.storage.from(BUCKET).remove([existing.storage_path]);
      toast.success(form.id ? 'Portfolio item updated' : 'Portfolio item added');
      setForm(empty); setFile(null); await load();
    } finally { setSaving(false); }
  };

  const toggle = async (item: PortfolioItem) => {
    if (!(await ensureAdmin())) return;
    const { error } = await supabase.from('portfolio_items').update({ is_active: !item.is_active }).eq('id', item.id);
    if (error) return toast.error(error.message);
    toast.success(item.is_active ? 'Hidden from website' : 'Visible on website');
    load();
  };

  const remove = async (item: PortfolioItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    if (!(await ensureAdmin())) return;
    const { error } = await supabase.from('portfolio_items').delete().eq('id', item.id);
    if (error) return toast.error(error.message);
    await supabase.storage.from(BUCKET).remove([item.storage_path]);
    toast.success('Deleted');
    if (form.id === item.id) setForm(empty);
    load();
  };

  const shown = filter === 'All' ? items : items.filter((i) => i.category === filter);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Briefcase className="h-6 w-6" /> Portfolio</h1>
          <p className="text-sm text-muted-foreground">Images shown on the Portfolio page of your website.</p>
        </div>

        <Card>
          <CardHeader><CardTitle>{form.id ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} maxLength={120} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Category *</Label>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {PORTFOLIO_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Short Description</Label>
              <Textarea value={form.description} maxLength={300} rows={2} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{form.id ? 'Replace Image (optional)' : 'Image *'}</Label>
              <Input type="file" accept={ACCEPT_ATTR} onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Show on website</Label>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                {form.id ? 'Save Changes' : 'Add Item'}
              </Button>
              {form.id && <Button variant="outline" onClick={() => { setForm(empty); setFile(null); }}>Cancel</Button>}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          {['All', ...PORTFOLIO_CATEGORIES].map((c) => (
            <Button key={c} size="sm" variant={filter === c ? 'default' : 'outline'} onClick={() => setFilter(c)}>{c}</Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-7 w-7 animate-spin" /></div>
        ) : shown.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No portfolio items yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((item) => (
              <div key={item.id} className={`space-y-2 rounded-lg border border-border p-3 ${item.is_active ? '' : 'opacity-60'}`}>
                <div className="aspect-square overflow-hidden rounded-md bg-muted">
                  <img src={item.image_url} alt={item.title} className="h-full w-full object-contain" loading="lazy" />
                </div>
                <p className="text-xs font-medium text-primary">{item.category}{!item.is_active && ' · Hidden'}</p>
                <p className="font-semibold">{item.title}</p>
                {item.description && <p className="line-clamp-2 text-xs text-muted-foreground">{item.description}</p>}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setForm({ id: item.id, title: item.title, description: item.description || '', category: item.category, is_active: item.is_active }); setFile(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    <Pencil className="mr-1 h-4 w-4" /> Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggle(item)}>
                    {item.is_active ? <><EyeOff className="mr-1 h-4 w-4" /> Hide</> : <><Eye className="mr-1 h-4 w-4" /> Show</>}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(item)}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPortfolio;
