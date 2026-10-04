import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Ban, ExternalLink, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INVITES_URL } from '@/data/services';
import { HOMEPAGE_SERVICE_GROUPS } from '@/data/homepageServices';
import { supabase } from '@/integrations/supabase/client';

export const PillarCards = () => {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    supabase.from('homepage_service_images').select('service_key, image_url').then(({ data }) => {
      if (!active) return;
      const next = (data || []).reduce<Record<string, string>>((map, row) => {
        map[row.service_key] = row.image_url;
        return map;
      }, {});
      setImages(next);
    });
    return () => { active = false; };
  }, []);

  return (
    <section className="py-12 md:py-20 bg-background" aria-labelledby="pillars-heading">
      <div className="container">
        <h2 id="pillars-heading" className="text-center text-2xl md:text-4xl font-black tracking-tight">Everything in One Place</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {HOMEPAGE_SERVICE_GROUPS.map((group) => (
            <Link key={group.title} to={group.to} aria-label={`Explore ${group.title}`} className="flex flex-col rounded-2xl border border-border bg-card p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <h3 className="text-2xl font-black tracking-tight">{group.title}</h3>
              <ul className="mt-4 flex-1 space-y-2">
                {group.items.map((item) => (
                  <li key={item.key} className="flex min-h-12 items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {images[item.key] ? (
                        <img src={images[item.key]} alt="" className="h-full w-full object-contain" loading="lazy" />
                      ) : (
                        <span className="text-[10px] text-muted-foreground/60">No image</span>
                      )}
                    </span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="mt-5 rounded-full">
                <span>{group.cta} <ArrowRight className="h-4 w-4" /></span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export const BusinessBlock = () => (
  <section className="py-12 md:py-16 bg-foreground text-background" aria-labelledby="biz-heading">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
      <div>
        <Briefcase className="mx-auto md:mx-0 h-8 w-8 text-primary" aria-hidden="true" />
        <h2 id="biz-heading" className="mt-3 text-2xl md:text-3xl font-black">Business Printing & Branding</h2>
        <p className="mt-2 max-w-xl opacity-80">Visiting cards, letterheads, bill books, stickers, banners and corporate gifts for shops and companies.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild size="lg" className="rounded-full"><Link to="/business-printing">Get a Business Quote</Link></Button>
        <Button asChild size="lg" variant="outline" className="rounded-full text-foreground"><Link to="/corporate-gifting">Corporate Gifting</Link></Button>
      </div>
    </div>
  </section>
);

export const PaymentPolicy = () => (
  <section className="py-12 md:py-16 bg-secondary" aria-labelledby="pay-heading">
    <div className="container max-w-3xl text-center">
      <ShieldCheck className="mx-auto h-9 w-9 text-primary" aria-hidden="true" />
      <h2 id="pay-heading" className="mt-3 text-2xl md:text-3xl font-black">Payment Policy</h2>
      <p className="mt-3 text-muted-foreground">Work starts after full payment. Payments are secure through Razorpay and UPI.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm font-semibold">
        <span className="rounded-full bg-background px-4 py-2 border border-border">✓ Full payment only</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-4 py-2 border border-border"><Ban className="h-4 w-4 text-primary" /> No COD</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-4 py-2 border border-border"><Ban className="h-4 w-4 text-primary" /> No half payment</span>
      </div>
    </div>
  </section>
);

export const WeddingBlock = () => (
  <section className="py-12 md:py-16 bg-background" aria-labelledby="wed-heading">
    <div className="container">
      <div className="rounded-3xl border border-primary/30 bg-primary/5 p-8 md:p-12 text-center">
        <h2 id="wed-heading" className="text-2xl md:text-4xl font-black">Wedding Cards & Digital Invitations</h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">Printed wedding cards, video invites, posters and couple frames, all designed for your big day.</p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild size="lg" className="rounded-full">
            <a href={INVITES_URL} target="_blank" rel="noopener noreferrer">Explore Digital Wedding Invitations <ExternalLink className="h-4 w-4" /></a>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full"><Link to="/wedding">Wedding Printing</Link></Button>
        </div>
      </div>
    </div>
  </section>
);
