import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, FileQuestion } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { WHATSAPP_NUMBER, BUSINESS_NAME } from '@/lib/types';
import { normalizeIndianPhoneForWhatsApp } from '@/lib/phone';
import type { Service, ServiceGroup } from '@/data/services';

export const waLink = (msg: string) =>
  `https://wa.me/${normalizeIndianPhoneForWhatsApp(WHATSAPP_NUMBER)}?text=${encodeURIComponent(msg)}`;

export const ServiceCard = ({ s, thumbnail }: { s: Service; thumbnail?: { url?: string } }) => (
  <article className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-brand">
    <div className="mb-4 flex aspect-[4/3] items-center justify-center rounded-xl bg-secondary">
      {thumbnail ? (thumbnail.url ? (
        <img src={thumbnail.url} alt={s.name} className="h-full w-full object-contain" loading="lazy" />
      ) : <span className="text-sm text-muted-foreground">No image</span>) : (
        <s.icon className="h-12 w-12 text-primary" strokeWidth={1.5} aria-hidden="true" />
      )}
    </div>
    <h3 className="font-bold text-lg leading-tight">{s.name}</h3>
    <p className="mt-1.5 flex-1 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
    <p className="mt-3 text-sm font-semibold text-foreground">
      {s.price ? <>Starting at <span className="text-primary">{s.price}</span></> : 'Price on quote'}
    </p>
    <div className="mt-4 grid grid-cols-2 gap-2">
      <Button asChild variant="outline" size="sm" className="rounded-full">
        <Link to={`/contact?service=${encodeURIComponent(s.name)}`}>
          <FileQuestion className="h-4 w-4" aria-hidden="true" /> Get Quote
        </Link>
      </Button>
      <Button asChild size="sm" className="rounded-full">
        <a href={waLink(`Hello ${BUSINESS_NAME}, I want to order: ${s.name}`)} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
        </a>
      </Button>
    </div>
  </article>
);

export const ServiceGrid = ({ items }: { items: Service[] }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {items.map((s) => <ServiceCard key={s.name} s={s} />)}
  </div>
);

export const GroupSection = ({ g, alt }: { g: ServiceGroup; alt?: boolean }) => (
  <section id={g.id} className={`scroll-mt-24 py-12 md:py-16 ${alt ? 'bg-secondary' : 'bg-background'}`} aria-labelledby={`${g.id}-h`}>
    <div className="container">
      <header className="mb-8 max-w-2xl">
        <h2 id={`${g.id}-h`} className="text-2xl md:text-3xl font-black tracking-tight">{g.title}</h2>
        <p className="mt-2 text-muted-foreground">{g.intro}</p>
      </header>
      <ServiceGrid items={g.items} />
    </div>
  </section>
);

interface ShellProps {
  title: string;
  description: string;
  path: string;
  eyebrow: string;
  h1: string;
  lead: string;
  actions?: ReactNode;
  children: ReactNode;
}

export const PageShell = ({ title, description, path, eyebrow, h1, lead, actions, children }: ShellProps) => (
  <div className="min-h-screen flex flex-col">
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={`https://www.graphicwala.com${path}`} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://www.graphicwala.com${path}`} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
    <Header />
    <main className="flex-1">
      <section className="border-b border-border bg-background py-12 md:py-16">
        <div className="container max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
          <h1 className="mt-3 text-3xl md:text-5xl font-black tracking-tight">{h1}</h1>
          <p className="mt-4 text-muted-foreground md:text-lg">{lead}</p>
          {actions && <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">{actions}</div>}
        </div>
      </section>
      {children}
    </main>
    <Footer />
  </div>
);
