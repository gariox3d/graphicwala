import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Video as VideoIcon, FolderOpen, Inbox,
  CheckCircle2, MessageCircle, ExternalLink,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getYouTubeThumb } from "@/lib/inviteTemplates";
import {
  CategoryFormSchema,
  CustomField,
  CustomFieldType,
  EventType,
  emptyFormSchema,
  newCustomField,
} from "@/lib/inviteTemplates";

type Category = {
  id: string; name: string; slug: string; description: string | null;
  icon_emoji: string; display_order: number; is_active: boolean;
  form_schema?: CategoryFormSchema;
};
type VideoRow = {
  id: string; category_id: string | null; title: string; description: string | null;
  thumbnail_url: string | null; youtube_url: string; price: number;
  display_order: number; is_active: boolean;
};
type OrderRow = {
  id: string; video_title: string | null; customer_name: string;
  whatsapp_number: string; email: string | null; amount: number;
  payment_status: string; delivery_status: string; delivered_at: string | null;
  expected_delivery_at: string; created_at: string;
  form_data: any; admin_notes: string | null;
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const AdminInvites = () => {
  const [tab, setTab] = useState<"categories" | "videos" | "orders">("categories");
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <VideoIcon className="h-7 w-7 text-primary" /> Video Invitations
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage categories, sample videos, and customer orders
        </p>
      </div>
      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid grid-cols-3 max-w-xl">
          <TabsTrigger value="categories"><FolderOpen className="h-4 w-4 mr-1" /> Categories</TabsTrigger>
          <TabsTrigger value="videos"><VideoIcon className="h-4 w-4 mr-1" /> Videos</TabsTrigger>
          <TabsTrigger value="orders"><Inbox className="h-4 w-4 mr-1" /> Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="categories" className="mt-6"><CategoriesTab /></TabsContent>
        <TabsContent value="videos" className="mt-6"><VideosTab /></TabsContent>
        <TabsContent value="orders" className="mt-6"><OrdersTab /></TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

/* ============ Categories Tab ============ */
const emptyCat = {
  name: "", slug: "", description: "", icon_emoji: "🎉",
  display_order: 0, is_active: true,
  form_schema: emptyFormSchema(),
};

const CategoriesTab = () => {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCat);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("invite_categories").select("*").order("display_order");
    setItems((data as Category[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm(emptyCat); setOpen(true); };
  const openEdit = (c: Category) => {
    setEditingId(c.id);
    setForm({
      name: c.name, slug: c.slug, description: c.description || "",
      icon_emoji: c.icon_emoji || "🎉", display_order: c.display_order, is_active: c.is_active,
      form_schema: (c.form_schema as CategoryFormSchema) || emptyFormSchema(),
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    const slug = form.slug.trim() || slugify(form.name);
    const payload = { ...form, slug };
    const { error } = editingId
      ? await supabase.from("invite_categories").update(payload).eq("id", editingId)
      : await supabase.from("invite_categories").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Updated" : "Created");
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this category? All its videos will be unlinked.")) return;
    const { error } = await supabase.from("invite_categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Categories</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Category" : "New Category"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Slug (auto if empty)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="wedding, birthday…" /></div>
              <div><Label>Emoji Icon</Label><Input value={form.icon_emoji} onChange={(e) => setForm({ ...form, icon_emoji: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} /></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
              <FormSchemaEditor
                schema={form.form_schema}
                onChange={(s) => setForm({ ...form, form_schema: s })}
              />
            </div>
            <DialogFooter><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading…</p> : items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No categories yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.icon_emoji}</span>
                  <div>
                    <div className="font-semibold">{c.name} {!c.is_active && <Badge variant="secondary" className="ml-1">Inactive</Badge>}</div>
                    <div className="text-xs text-muted-foreground">{c.slug} • Order: {c.display_order}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* ============ Videos Tab ============ */
const emptyVid = {
  category_id: "" as string,
  title: "", description: "", thumbnail_url: "", youtube_url: "",
  price: 0, display_order: 0, is_active: true,
};

const VideosTab = () => {
  const [items, setItems] = useState<VideoRow[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyVid);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const [v, c] = await Promise.all([
      supabase.from("invite_videos").select("*").order("display_order"),
      supabase.from("invite_categories").select("*").order("display_order"),
    ]);
    setItems((v.data as VideoRow[]) || []);
    setCats((c.data as Category[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm(emptyVid); setOpen(true); };
  const openEdit = (v: VideoRow) => {
    setEditingId(v.id);
    setForm({
      category_id: v.category_id || "",
      title: v.title, description: v.description || "",
      thumbnail_url: v.thumbnail_url || "", youtube_url: v.youtube_url,
      price: Number(v.price), display_order: v.display_order, is_active: v.is_active,
    });
    setOpen(true);
  };

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("invite-thumbnails").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("invite-thumbnails").getPublicUrl(path);
      setForm((f) => ({ ...f, thumbnail_url: data.publicUrl }));
      toast.success("Thumbnail uploaded");
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.title.trim() || !form.youtube_url.trim()) return toast.error("Title and YouTube URL required");
    if (Number(form.price) < 0) return toast.error("Invalid price");
    const payload = {
      ...form,
      category_id: form.category_id || null,
      thumbnail_url: form.thumbnail_url || null,
      description: form.description || null,
    };
    const { error } = editingId
      ? await supabase.from("invite_videos").update(payload).eq("id", editingId)
      : await supabase.from("invite_videos").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editingId ? "Updated" : "Created");
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this video?")) return;
    const { error } = await supabase.from("invite_videos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const previewThumb = form.thumbnail_url || getYouTubeThumb(form.youtube_url);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sample Videos</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Add Video</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Video" : "New Video"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose category" /></SelectTrigger>
                  <SelectContent>
                    {cats.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.icon_emoji} {c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>YouTube / Shorts URL *</Label><Input value={form.youtube_url} onChange={(e) => setForm({ ...form, youtube_url: e.target.value })} placeholder="https://youtube.com/shorts/..." /></div>
              <div>
                <Label>Thumbnail (optional — auto from YouTube if blank)</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={uploading}
                    onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
                  />
                </div>
                {previewThumb && (
                  <img src={previewThumb} alt="thumb" className="mt-2 w-32 aspect-[9/16] object-cover rounded border" />
                )}
              </div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Price (₹) *</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>Display Order</Label><Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>Active</Label></div>
            </div>
            <DialogFooter><Button onClick={save} disabled={uploading}>{uploading ? "Uploading…" : "Save"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading…</p> : items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No videos yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((v) => {
              const thumb = v.thumbnail_url || getYouTubeThumb(v.youtube_url);
              const cat = cats.find((c) => c.id === v.category_id);
              return (
                <div key={v.id} className="border rounded-lg overflow-hidden bg-card">
                  <div className="aspect-[9/16] bg-muted relative">
                    {thumb ? <img src={thumb} className="w-full h-full object-cover" alt={v.title} /> : null}
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded font-bold">₹{v.price}</div>
                    {!v.is_active && <div className="absolute inset-0 bg-background/70 flex items-center justify-center"><Badge variant="secondary">Inactive</Badge></div>}
                  </div>
                  <div className="p-3 space-y-1">
                    <div className="font-semibold text-sm line-clamp-1">{v.title}</div>
                    <div className="text-xs text-muted-foreground">{cat?.icon_emoji} {cat?.name || "Uncategorised"}</div>
                    <div className="flex gap-1 pt-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(v)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => remove(v.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/* ============ Orders Tab ============ */
const OrdersTab = () => {
  const [items, setItems] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<OrderRow | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("invite_orders")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as OrderRow[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const markDelivered = async (id: string) => {
    const { error } = await supabase
      .from("invite_orders")
      .update({ delivery_status: "sent", delivered_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Marked as delivered"); load();
    setViewing(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this order record?")) return;
    const { error } = await supabase.from("invite_orders").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load(); setViewing(null);
  };

  const waLink = (wa: string, name: string, title: string) => {
    const cleaned = wa.replace(/\D/g, "").slice(-10);
    const msg = `Hi ${name}, your Graphic Wala custom video invitation (${title}) is ready! 🎉`;
    return `https://wa.me/91${cleaned}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <Card>
      <CardHeader><CardTitle>Customer Orders ({items.length})</CardTitle></CardHeader>
      <CardContent>
        {loading ? <p>Loading…</p> : items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No invite orders yet.</p>
        ) : (
          <div className="space-y-2">
            {items.map((o) => (
              <div key={o.id} className="border rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{o.customer_name}</span>
                    <Badge variant={o.payment_status === "paid" ? "default" : "secondary"}>{o.payment_status}</Badge>
                    <Badge variant={o.delivery_status === "sent" ? "default" : "destructive"}>
                      {o.delivery_status === "sent" ? "Delivered" : "Pending Delivery"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {o.video_title} • +91 {o.whatsapp_number} • ₹{o.amount} •{" "}
                    {new Date(o.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setViewing(o)}>View</Button>
                  <Button size="sm" variant="outline" asChild>
                    <a href={waLink(o.whatsapp_number, o.customer_name, o.video_title || "")} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-4 w-4" />
                    </a>
                  </Button>
                  {o.delivery_status !== "sent" && (
                    <Button size="sm" onClick={() => markDelivered(o.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Delivered
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><b>Customer:</b> {viewing.customer_name}</div>
                <div><b>WhatsApp:</b> +91 {viewing.whatsapp_number}</div>
                <div><b>Email:</b> {viewing.email || "—"}</div>
                <div><b>Amount:</b> ₹{viewing.amount}</div>
                <div><b>Video:</b> {viewing.video_title}</div>
                <div><b>Status:</b> {viewing.delivery_status}</div>
              </div>
              <div className="border-t pt-3">
                <div className="font-semibold mb-2">Form Data</div>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(viewing.form_data, null, 2)}
                </pre>
              </div>
              <DialogFooter className="gap-2 flex-wrap">
                <Button asChild variant="outline">
                  <a href={waLink(viewing.whatsapp_number, viewing.customer_name, viewing.video_title || "")} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-1" /> WhatsApp Customer
                  </a>
                </Button>
                {viewing.delivery_status !== "sent" && (
                  <Button onClick={() => markDelivered(viewing.id)}>
                    <CheckCircle2 className="h-4 w-4 mr-1" /> Mark Delivered
                  </Button>
                )}
                <Button variant="destructive" onClick={() => remove(viewing.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default AdminInvites;