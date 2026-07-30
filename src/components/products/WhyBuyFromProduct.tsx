import { Palette, Timer, Truck, ShieldCheck } from 'lucide-react';

const points = [
  { icon: Palette, title: 'Free Design Help', text: 'Send a rough idea — we make it print-ready free of cost.' },
  { icon: Timer, title: 'Fast Dispatch', text: 'Orders confirmed before 5 PM go into print the same day.' },
  { icon: Truck, title: 'All India Delivery', text: 'Tracked delivery to every pincode in India.' },
  { icon: ShieldCheck, title: 'Damage Protection', text: 'Report within 48 hours with unboxing video — we fix it.' },
];

/** Compact trust block for product pages. */
const WhyBuyFromProduct = () => (
  <section className="rounded-2xl border border-border bg-secondary/50 p-4" aria-labelledby="why-buy-product">
    <h2 id="why-buy-product" className="mb-3 text-base font-bold">
      Why Buy From Graphic Wala?
    </h2>
    <div className="grid gap-3 sm:grid-cols-2">
      {points.map((p) => (
        <div key={p.title} className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <p.icon className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{p.title}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{p.text}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default WhyBuyFromProduct;
