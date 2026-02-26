import { Instagram, ExternalLink, Heart, MessageCircle as CommentIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const INSTAGRAM_HANDLE = 'graphicwala.shop';
const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}`;

const posts = [
  { id: 1, emoji: '🖼️', label: 'Custom Frames', likes: '2.4k', comments: '89' },
  { id: 2, emoji: '💳', label: 'PVC Cards', likes: '1.8k', comments: '56' },
  { id: 3, emoji: '🔑', label: 'Keychains', likes: '3.1k', comments: '124' },
  { id: 4, emoji: '🎁', label: 'Gift Items', likes: '2.7k', comments: '97' },
];

const InstagramSection = () => {
  return (
    <section className="py-16 md:py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-orange-950/20">
      <div className="container">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
            <Instagram className="h-4 w-4" />
            Follow Us on Instagram
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            @{INSTAGRAM_HANDLE}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            See our latest creations, customer stories & behind-the-scenes content. Follow us for daily inspiration!
          </p>
        </div>

        {/* Mock Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
          {posts.map((post) => (
            <a
              key={post.id}
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl bg-gradient-to-br from-muted to-secondary overflow-hidden shadow-soft hover:shadow-brand transition-all duration-300"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl mb-2">{post.emoji}</span>
                <span className="text-sm font-semibold text-foreground/80">{post.label}</span>
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1 text-white text-sm font-semibold">
                  <Heart className="h-4 w-4 fill-white" />
                  {post.likes}
                </div>
                <div className="flex items-center gap-1 text-white text-sm font-semibold">
                  <CommentIcon className="h-4 w-4" />
                  {post.comments}
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 hover:from-pink-600 hover:via-purple-600 hover:to-orange-600 text-white font-bold shadow-lg"
          >
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              <Instagram className="h-5 w-5 mr-2" />
              Follow @{INSTAGRAM_HANDLE}
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
