import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock, Plus, Trash2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ProgrammeBuilder from "@/components/invites/ProgrammeBuilder";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  EventType,
  InviteFormData,
  ProgrammeItem,
  RsvpItem,
  getCoupleMode,
  getDefaultProgrammes,
  getYouTubeEmbed,
  newRsvp,
} from "@/lib/inviteTemplates";

declare global {
  interface Window { Razorpay: any }
}

const InviteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [video, setVideo] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [contact, setContact] = useState({ name: "", whatsapp: "", email: "" });
  const [form, setForm] = useState<InviteFormData>({
    eventType: "hindu",
    programmes: [],
    rsvp: [newRsvp()],
    compliments_from: "",
    special_instructions: "",
  });

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    document.body.appendChild(s);
    return () => {
      try { document.body.removeChild(s); } catch {}
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data: v } = await supabase
        .from("invite_videos")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();
      if (!v) { setLoading(false); return; }
      setVideo(v);
      if (v.category_id) {
        const { data: c } = await supabase
          .from("invite_categories")
          .select("*")
          .eq("id", v.category_id)
          .maybeSingle();
        setCategory(c);
        setForm((f) => ({ ...f, programmes: getDefaultProgrammes(c?.slug, f.eventType) }));
      }
      setLoading(false);
    })();
  }, [id]);

  // Prefill contact from profile
  useEffect(() => {
    if (profile || user) {
      setContact((c) => ({
        name: c.name || profile?.full_name || "",
        whatsapp: c.whatsapp || profile?.phone?.replace(/\D/g, "").slice(-10) || "",
        email: c.email || user?.email || "",
      }));
    }
  }, [profile, user]);

  const embedUrl = useMemo(() => (video ? getYouTubeEmbed(video.youtube_url) : null), [video]);
  const coupleMode = getCoupleMode(category?.slug);

  const updateRsvp = (id: string, field: "name" | "phone", value: string) =>
    setForm((f) => ({ ...f, rsvp: f.rsvp.map((r) => (r.id === id ? { ...r, [field]: value } : r)) }));

  const handleEventTypeChange = (val: EventType) => {
    setForm((f) => ({
      ...f,
      eventType: val,
      programmes: getDefaultProgrammes(category?.slug, val),
    }));
  };

  const validate = (): string | null => {
    if (!contact.name.trim()) return "Please enter your name";
    const wa = contact.whatsapp.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(wa))
      return "Please enter a valid 10-digit WhatsApp number (Indian mobile)";
    if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email))
      return "Please enter a valid email";
    if (form.programmes.length === 0 || !form.programmes[0].name.trim())
      return "Please add at least one programme";
    return null;
  };

  const handlePay = async () => {
    if (!user) {
      toast.error("Please log in first to order this invite");
      navigate("/auth");
      return;
    }
    const err = validate();
    if (err) { toast.error(err); return; }
    if (!video) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-razorpay", {
        body: { action: "create-order", amount: Number(video.price), video_id: video.id },
      });
      if (error || !data?.success) throw new Error(data?.error || "Failed to start payment");
      const { order, key_id } = data;

      const wa = contact.whatsapp.replace(/\D/g, "").slice(-10);

      const options = {
        key: key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Graphic Wala",
        description: `Video Invite: ${video.title}`,
        order_id: order.id,
        handler: async (resp: any) => {
          try {
            const { data: verify, error: vErr } = await supabase.functions.invoke(
              "invite-razorpay",
              {
                body: {
                  action: "verify-and-place",
                  razorpay_order_id: resp.razorpay_order_id,
                  razorpay_payment_id: resp.razorpay_payment_id,
                  razorpay_signature: resp.razorpay_signature,
                  video_id: video.id,
                  user_id: user.id,
                  customer_name: contact.name.trim(),
                  whatsapp_number: wa,
                  email: contact.email.trim() || null,
                  form_data: form,
                },
              }
            );
            if (vErr || !verify?.success)
              throw new Error(verify?.error || "Payment verification failed");
            toast.success("Order placed! We will deliver in 24 hours.");
            navigate(`/invites/confirmation/${verify.order_id}`, { replace: true });
          } catch (e: any) {
            toast.error(e.message || "Verification failed. Please contact support.");
          } finally {
            setSubmitting(false);
          }
        },
        prefill: { name: contact.name, contact: wa, email: contact.email },
        theme: { color: "#dc2626" },
        modal: {
          ondismiss: () => {
            toast.error("Payment not completed");
            setSubmitting(false);
          },
          escape: false, confirm_close: true,
        },
      };
      const rz = new window.Razorpay(options);
      rz.on("payment.failed", () => {
        toast.error("Payment failed");
        setSubmitting(false);
      });
      rz.open();
    } catch (e: any) {
      toast.error(e.message || "Could not start payment");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center text-muted-foreground">Loading…</main>
        <Footer />
      </div>
    );
  }
  if (!video) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-16 text-center">
          <p className="mb-4">This video invite is not available.</p>
          <Button asChild><Link to="/invites">Browse Invites</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{video.title} | Custom Video Invitation — Graphic Wala</title>
      </Helmet>
      <Header />
      <main className="flex-1">
        <div className="container py-4">
          <Button asChild variant="ghost" size="sm">
            <Link to="/invites"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Invites</Link>
          </Button>
        </div>

        <div className="container pb-12 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          {/* Video Preview */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20 space-y-4">
              <div className="rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-[70vh] mx-auto w-full max-w-sm">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    Video preview unavailable
                  </div>
                )}
              </div>
              <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                <h1 className="text-xl font-bold">{video.title}</h1>
                {category && (
                  <p className="text-sm text-muted-foreground">
                    {category.icon_emoji} {category.name}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Price</span>
                  <span className="text-2xl font-bold text-primary">
                    ₹{Number(video.price).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Prepaid only. Delivered to your WhatsApp within 24 hours.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4">
              <h2 className="font-bold text-lg">Choose Style</h2>
              <RadioGroup
                value={form.eventType}
                onValueChange={(v) => handleEventTypeChange(v as EventType)}
                className="grid grid-cols-3 gap-2"
              >
                {(["hindu", "muslim", "other"] as EventType[]).map((t) => (
                  <Label
                    key={t}
                    htmlFor={`type-${t}`}
                    className={`cursor-pointer rounded-lg border-2 p-3 text-center text-sm font-medium capitalize transition ${
                      form.eventType === t
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={t} id={`type-${t}`} className="sr-only" />
                    {t === "other" ? "Other / Mixed" : t}
                  </Label>
                ))}
              </RadioGroup>
              <p className="text-xs text-muted-foreground">
                This only changes default programme labels. You can customise freely below.
              </p>
            </div>

            {/* Couple / Person */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4">
              <h2 className="font-bold text-lg">
                {coupleMode === "couple"
                  ? "Couple Details"
                  : coupleMode === "family"
                  ? "Family Details"
                  : "Celebrant Details"}
              </h2>
              {coupleMode === "couple" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Bride Name</Label>
                    <Input
                      value={form.bride_name || ""}
                      onChange={(e) => setForm({ ...form, bride_name: e.target.value })}
                      placeholder="Bride's full name"
                    />
                  </div>
                  <div>
                    <Label>Groom Name</Label>
                    <Input
                      value={form.groom_name || ""}
                      onChange={(e) => setForm({ ...form, groom_name: e.target.value })}
                      placeholder="Groom's full name"
                    />
                  </div>
                </div>
              )}
              {coupleMode === "family" && (
                <div>
                  <Label>Family Name</Label>
                  <Input
                    value={form.family_name || ""}
                    onChange={(e) => setForm({ ...form, family_name: e.target.value })}
                    placeholder="e.g. Sharma Family"
                  />
                </div>
              )}
              {coupleMode === "person" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={form.celebrant_name || ""}
                      onChange={(e) => setForm({ ...form, celebrant_name: e.target.value })}
                      placeholder="Person's name"
                    />
                  </div>
                  <div>
                    <Label>Age (optional)</Label>
                    <Input
                      value={form.age || ""}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      placeholder="e.g. 5"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Programmes */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4">
              <div>
                <h2 className="font-bold text-lg">Programmes</h2>
                <p className="text-xs text-muted-foreground">
                  Add all events with date, time and venue. You can add unlimited programmes.
                </p>
              </div>
              <ProgrammeBuilder
                programmes={form.programmes}
                onChange={(programmes) => setForm({ ...form, programmes })}
              />
            </div>

            {/* RSVP */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-3">
              <h2 className="font-bold text-lg">RSVP Contacts (optional)</h2>
              {form.rsvp.map((r) => (
                <div key={r.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                  <Input
                    placeholder="Name"
                    value={r.name}
                    onChange={(e) => updateRsvp(r.id, "name", e.target.value)}
                  />
                  <Input
                    placeholder="Phone"
                    value={r.phone}
                    onChange={(e) => updateRsvp(r.id, "phone", e.target.value)}
                  />
                  {form.rsvp.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() =>
                        setForm({ ...form, rsvp: form.rsvp.filter((x) => x.id !== r.id) })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setForm({ ...form, rsvp: [...form.rsvp, newRsvp()] })}
              >
                <Plus className="h-4 w-4 mr-1" /> Add RSVP Contact
              </Button>
            </div>

            {/* Compliments + Notes */}
            <div className="bg-card border border-border rounded-xl p-4 md:p-6 space-y-4">
              <div>
                <Label>With Best Compliments From</Label>
                <Textarea
                  value={form.compliments_from}
                  onChange={(e) => setForm({ ...form, compliments_from: e.target.value })}
                  placeholder="Family member names, one per line"
                  rows={3}
                />
              </div>
              <div>
                <Label>Special Instructions (optional)</Label>
                <Textarea
                  value={form.special_instructions}
                  onChange={(e) => setForm({ ...form, special_instructions: e.target.value })}
                  placeholder="Anything else you want included in the video"
                  rows={3}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="bg-card border-2 border-primary/50 rounded-xl p-4 md:p-6 space-y-4">
              <h2 className="font-bold text-lg">Your Contact (for delivery)</h2>
              <div>
                <Label>Your Name *</Label>
                <Input
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label>WhatsApp Number * (10 digits)</Label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={contact.whatsapp}
                  onChange={(e) =>
                    setContact({ ...contact, whatsapp: e.target.value.replace(/\D/g, "").slice(0, 10) })
                  }
                  placeholder="9876543210"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your video will be sent to this WhatsApp number.
                </p>
              </div>
              <div>
                <Label>Email (optional)</Label>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Pay */}
            <div className="sticky bottom-4 bg-card border-2 border-primary rounded-xl p-4 shadow-brand">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Total Payable</span>
                <span className="text-2xl font-bold text-primary">
                  ₹{Number(video.price).toLocaleString()}
                </span>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handlePay}
                disabled={submitting}
              >
                {submitting ? "Processing…" : "Pay & Place Order"}
              </Button>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> Delivered to your WhatsApp within 24 hours
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InviteDetail;