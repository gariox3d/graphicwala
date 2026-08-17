import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Ad {
  id: string;
  slot_id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  slot_width: number;
  slot_height: number;
  display_order: number;
}

interface AdBannerProps {
  slotId: string;
  className?: string;
}

const AdBanner = ({ slotId, className = '' }: AdBannerProps) => {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('custom_ads')
        .select('*')
        .eq('slot_id', slotId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      if (data) setAds(data as unknown as Ad[]);
    };
    fetch();
  }, [slotId]);

  if (ads.length === 0) return null;

  return (
    <div className={`w-full ${className}`}>
      {ads.map((ad) => {
        const content = (
          <SmartImage
            src={ad.image_url}
            alt={ad.title || 'Advertisement'}
            className="w-full h-auto rounded-lg object-cover"
            style={{ maxHeight: ad.slot_height, objectFit: 'cover' }}
            widths={BANNER_WIDTHS}
            fallbackWidth={1200}
            quality={70}
            resize="cover"
            sizes="(max-width: 768px) 100vw, 1200px"
            width={ad.slot_width}
            height={ad.slot_height}
          />
        );

        return ad.link_url ? (
          <a
            key={ad.id}
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {content}
          </a>
        ) : (
          <div key={ad.id}>{content}</div>
        );
      })}
    </div>
  );
};

export default AdBanner;
