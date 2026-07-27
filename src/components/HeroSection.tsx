import { Link } from 'react-router-dom';
import { ArrowUpRight, Frame, Coffee, Shirt, KeyRound, CircleDot, Plane } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

type CategoryTile = {
  key: string;
  name: string;
  matchers: string[]; // possible category name matches
  fallbackLabel?: string;
};

const TILES: CategoryTile[] = [
  { key: 'frames', name: 'Photo Frames', matchers: ['photo frame', 'frame'] },
  { key: 'mugs', name: 'Mugs', matchers: ['mug'] },
  { key: 'tees', name: 'T-Shirts', matchers: ['t-shirt', 'tshirt', 'tee'] },
  { key: 'keychains', name: 'Keychains', matchers: ['keychain', 'key chain'] },
  { key: 'caps', name: 'Caps', matchers: ['cap', 'hat'] },
  { key: 'plates', name: 'Plates', matchers: ['plate'] },
];

const HeroSection = () => {
  const [images, setImages] = useState<Record<string, string>>({});
  const [catRoutes, setCatRoutes] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: cats }, { data: prods }] = await Promise.all([
          supabase.from('categories').select('id, name, image_url'),
          supabase
            .from('products')
            .select('name, image_url, image_urls, category_id, categories(name)')
            .eq('is_active', true)
            .limit(80),
        ]);

        const imgMap: Record<string, string> = {};
        const routeMap: Record<string, string> = {};

        TILES.forEach((tile) => {
          const cat = (cats || []).find((c: any) =>
            tile.matchers.some((m) => c.name?.toLowerCase().includes(m))
          );
          if (cat) {
            routeMap[tile.key] = `/products?category=${encodeURIComponent(cat.name)}`;
            if (cat.image_url) imgMap[tile.key] = cat.image_url;
          }
          if (!imgMap[tile.key]) {
            const p: any = (prods || []).find((pr: any) => {
              const catName = pr.categories?.name || '';
              return tile.matchers.some((m) =>
                catName.toLowerCase().includes(m) || pr.name?.toLowerCase().includes(m)
              );
            });
            const pic =
              p && (Array.isArray(p.image_urls) && p.image_urls[0] ? p.image_urls[0] : p.image_url);
            if (pic) imgMap[tile.key] = pic;
          }
        });

        setImages(imgMap);
        setCatRoutes(routeMap);
      } catch (e) {
        console.error('Hero fetch failed:', e);
      }
    };
    load();
  }, []);

  const linkFor = (key: string) => catRoutes[key] || '/products';

  return (
    <section
      className="relative overflow-hidden bg-black text-white"
      aria-label="Graphic Wala - Personalized Gifts"
    >
      {/* Ambient red glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-[320px] w-[320px] rounded-full bg-primary/15 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-10 -left-24 h-[280px] w-[280px] rounded-full bg-primary/10 blur-[100px]" />

      <div className="relative container px-4 sm:px-6 pt-8 pb-12 md:pt-14 md:pb-20">
        {/* Editorial heading */}
        <div className="mb-8 md:mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            India's Favorite Custom Gift Store
          </div>
          <h1 className="font-serif-editorial mt-5 text-[42px] leading-[0.92] tracking-tight sm:text-6xl md:text-7xl">
            Personalized <span className="italic text-primary">gifts</span>,
            <br />
            crafted from your{' '}
            <span className="italic">memories.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm md:text-base text-white/60 leading-relaxed">
            Photo frames, mugs, t-shirts, keychains, caps &amp; plates — custom
            printed with premium quality and delivered across India.
          </p>
        </div>

        {/* Bento hero grid */}
        <div className="grid grid-cols-6 grid-rows-6 gap-3 h-[520px] md:h-[620px]">
          {/* Primary: Photo Frames */}
          <Link
            to={linkFor('frames')}
            className="col-span-4 row-span-4 group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-zinc-900"
          >
            {images.frames && (
              <img
                src={images.frames}
                alt="Custom Photo Frames"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-between p-5 md:p-7">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                  Featured
                </span>
                <ArrowUpRight className="h-5 w-5 text-white/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </div>
              <div>
                <Frame className="h-5 w-5 text-white/70 mb-2" />
                <h2 className="font-serif-editorial text-4xl md:text-5xl italic leading-[0.9]">
                  Timeless<br />Frames
                </h2>
                <p className="mt-2 text-xs text-white/60">
                  Hand-crafted with your photos
                </p>
              </div>
            </div>
          </Link>

          {/* Mugs */}
          <Link
            to={linkFor('mugs')}
            className="col-span-2 row-span-2 group relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border border-white/5 bg-zinc-900"
          >
            {images.mugs && (
              <img
                src={images.mugs}
                alt="Custom Mugs"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-110"
              />
            )}
            <div className="absolute inset-0 flex items-end justify-between p-4">
              <span className="font-serif-editorial text-lg italic">Mugs</span>
              <Coffee className="h-4 w-4 text-white/60" />
            </div>
          </Link>

          {/* India Only accent */}
          <div className="col-span-2 row-span-2 rounded-[1.5rem] md:rounded-[2rem] bg-primary p-4 md:p-5 flex flex-col justify-between text-white">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <Plane className="h-4 w-4" />
            </div>
            <p className="text-[10px] md:text-xs font-bold uppercase leading-tight tracking-wider">
              All India<br />Delivery
            </p>
          </div>

          {/* T-Shirts wide */}
          <Link
            to={linkFor('tees')}
            className="col-span-6 row-span-2 group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-white/5 bg-zinc-900 flex items-center justify-between p-5 md:p-7"
          >
            <div className="relative z-10">
              <h3 className="font-serif-editorial text-2xl md:text-3xl italic">
                Bespoke Tees
              </h3>
              <p className="mt-1 text-xs text-white/50">
                100% cotton · personalized prints
              </p>
            </div>
            <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-2xl overflow-hidden rotate-6 border border-white/10">
              {images.tees ? (
                <img
                  src={images.tees}
                  alt="Custom T-Shirts"
                  loading="lazy"
                  className="h-full w-full object-cover opacity-70"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-zinc-800">
                  <Shirt className="h-8 w-8 text-white/40" />
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Catalog strip */}
        <div className="mt-10 md:mt-14">
          <div className="flex items-baseline">
            <h4 className="font-serif-editorial text-lg md:text-xl italic">
              The Catalog
            </h4>
            <div className="mx-4 h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">
              Explore
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {[
              { key: 'keychains', label: 'Keychains', sub: 'Metal & Acrylic', Icon: KeyRound },
              { key: 'plates', label: 'Plates', sub: 'Ceramic Prints', Icon: CircleDot },
              { key: 'caps', label: 'Caps', sub: 'Printed & Embroidered', Icon: Shirt },
              { key: 'mugs', label: 'Mugs', sub: 'Photo & Magic', Icon: Coffee },
            ].map(({ key, label, sub, Icon }) => (
              <Link
                key={key}
                to={linkFor(key)}
                className="group aspect-square rounded-2xl md:rounded-3xl border border-white/10 bg-zinc-950 p-4 md:p-6 flex flex-col justify-between transition-colors hover:border-primary/40"
              >
                <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-widest text-white/40">
                    {sub}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Premium Quality
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            All India Delivery
          </div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Prepaid Only
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;