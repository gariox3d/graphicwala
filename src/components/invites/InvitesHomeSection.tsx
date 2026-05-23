import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Video, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoCard from "./VideoCard";
import { supabase } from "@/integrations/supabase/client";

type Video = {
  id: string; title: string; description: string | null;
  thumbnail_url: string | null; youtube_url: string; price: number;
};

const InvitesHomeSection = () => {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("invite_videos")
        .select("id, title, description, thumbnail_url, youtube_url, price")
        .eq("is_active", true)
        .order("display_order")
        .limit(4);
      setVideos((data as Video[]) || []);
    })();
  }, []);

  if (videos.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="container">
        <header className="text-center mb-10 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold mb-3">
            <Sparkles className="h-3 w-3" /> NEW
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3 flex items-center justify-center gap-2 flex-wrap">
            <Video className="h-7 w-7 text-primary" /> Custom Video Invitations
          </h2>
          <p className="text-muted-foreground">
            Personalised animated invites for wedding, birthday, engagement, anniversary & more.
            <span className="inline-flex items-center gap-1 ml-1 text-primary font-medium">
              <Clock className="h-3.5 w-3.5" /> Delivered in 24 hours on WhatsApp.
            </span>
          </p>
        </header>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Button asChild size="lg">
            <Link to="/invites">
              Explore All Video Invites <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InvitesHomeSection;