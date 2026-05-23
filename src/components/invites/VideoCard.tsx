import { Link } from "react-router-dom";
import { Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getYouTubeThumb } from "@/lib/inviteTemplates";

interface Props {
  video: {
    id: string;
    title: string;
    description?: string | null;
    thumbnail_url?: string | null;
    youtube_url: string;
    price: number;
  };
}

const VideoCard = ({ video }: Props) => {
  const thumb = video.thumbnail_url || getYouTubeThumb(video.youtube_url);
  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-soft hover:shadow-brand transition-all duration-300 border border-border flex flex-col">
      <Link to={`/invites/${video.id}`} className="block relative aspect-[9/16] bg-muted overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={video.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-foreground" />
        )}
        <div className="absolute inset-0 bg-foreground/20 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-brand group-hover:scale-110 transition-transform">
            <Play className="h-6 w-6 fill-current ml-0.5" />
          </div>
        </div>
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow">
          ₹{Number(video.price).toLocaleString()}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-sm line-clamp-2">{video.title}</h3>
        {video.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{video.description}</p>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Delivered in 24 hrs</span>
        </div>
        <Button asChild size="sm" className="mt-auto w-full">
          <Link to={`/invites/${video.id}`}>Order This Invite</Link>
        </Button>
      </div>
    </div>
  );
};

export default VideoCard;