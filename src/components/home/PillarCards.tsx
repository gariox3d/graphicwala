import { Link } from 'react-router-dom';
import { PenTool, Printer, Gift, ArrowRight, ShieldCheck, Ban, ExternalLink, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INVITES_URL } from '@/data/services';

const PILLARS = [
  { title: 'DESIGN', icon: PenTool, to: '/design-print', cta: 'Explore Design',
    items: ['Graphic Design', 'Photo Editing', 'Wedding Card Design'] },
  { title: 'PRINT', icon: Printer, to: '/business-printing', cta: 'Explore Printing',
    items: ['Banner', 'Poster', 'Visiting Card', 'Bill Book', 'Pamphlet', 'Handbill', 'Letterhead', 'Folder', 'Wedding Card'] },
  { title: 'CUSTOMIZE', icon: Gift, to: '/custom-products', cta: 'Shop Custom Products',
    items: ['T-Shirt', 'Mug', 'Keychain', 'Cushion', 'Photo Frame', 'Sublimation & Customized Gifts'] },
];

export const PillarCards = () => (
  <section className="py-12 md:py-20 bg-background" aria-labelledby="pillars-heading">
    <div className="container">
      <h2 id="pillars-heading" className="text-center text-2xl md:text-4xl font-black tracking-tight">Everything in One Place</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {PILLARS.map((p) => (
          <article key={p.title} className="flex flex-col rounded-2xl border border-border bg-card p-6">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <p.icon className="h-6 w-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-2xl font-black tracking-tight">{p.title}</h3>
            <ul className="mt-3 flex-1 space-y-1.5 text-sm text-muted-foreground">
              {p.items.map((i) => <li key={i}>• {i}</li>)}
            </ul>
            <Button asChild variant="outline" className="mt-5 rounded-full">
              <Link to={p.to}>{p.cta} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </article>
        ))}
      </div>
    </div>
  </section>
);

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
