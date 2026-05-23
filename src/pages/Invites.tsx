import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { AlertTriangle, Sparkles, Clock, ShieldCheck } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VideoCard from "@/components/invites/VideoCard";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Category = { id: string; name: string; slug: string; icon_emoji: string; display_order: number };
type Video = {
  id: string; title: string; description: string | null;
  thumbnail_url: string | null; youtube_url: string; price: number;
  category_id: string | null; display_order: number;
};

const Invites = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [c, v] = await Promise.all([
        supabase.from("invite_categories").select("*").eq("is_active", true).order("display_order"),
        supabase.from("invite_videos").select("*").eq("is_active", true).order("display_order"),
      ]);
      setCategories((c.data as Category[]) || []);
      setVideos((v.data as Video[]) || []);
      setLoading(false);
    })();
  }, []);

  const selectedCatId =
    selectedSlug === "all" ? null : categories.find((c) => c.slug === selectedSlug)?.id || null;
  const filtered = selectedCatId ? videos.filter((v) => v.category_id === selectedCatId) : videos;

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Custom Video Invitations Online — Wedding, Birthday & More | Graphic Wala</title>
        <meta
          name="description"
          content="Order custom video invitations for wedding, birthday, engagement, anniversary, grih pravesh and more. Delivered to your WhatsApp within 24 hours."
        />
      </Helmet>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12 md:py-20 overflow-hidden">
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-4">
                <Sparkles className="h-3 w-3" /> NEW
              </span>
              <h1 className="text-3xl md:text-5xl font-bold mb-4">
                Custom <span className="text-primary">Video Invitations</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg mb-6">
                Beautiful animated invites for weddings, birthdays, engagements, anniversaries &
                more. Personalised with your details and delivered to your WhatsApp.
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border border-border">
                  <Clock className="h-4 w-4 text-primary" /> 24-hr WhatsApp delivery
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-card border border-border">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Prepaid & secure
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Prepaid notice */}
        <section className="py-4 bg-amber-50 dark:bg-amber-950/30 border-y border-amber-200 dark:border-amber-900">
          <div className="container flex items-start sm:items-center gap-2 justify-center text-center">
            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs sm:text-sm font-medium text-amber-800 dark:text-amber-200">
              Prepaid only. Your custom video will be delivered to your WhatsApp within 24 hours of payment.
            </p>
          </div>
        </section>

        {/* Category filter */}
        <section className="py-6 sticky top-16 z-30 bg-background/95 backdrop-blur border-b">
          <div className="container">
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              <button
                onClick={() => setSelectedSlug("all")}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${
                  selectedSlug === "all"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary"
                }`}
              >
                ✨ All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedSlug(c.slug)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${
                    selectedSlug === c.slug
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary"
                  }`}
                >
                  {c.icon_emoji} {c.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Videos grid */}
        <section className="py-10 md:py-14">
          <div className="container">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-muted rounded-xl aspect-[9/16] animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">
                  No video invitations available in this category yet.
                </p>
                <Button asChild variant="outline">
                  <Link to="/contact">Contact Us for Custom Request</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filtered.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Invites;