import { Truck, ShieldCheck, Zap, Wallet } from 'lucide-react';

const items = [
  { icon: Truck, title: 'All India Delivery', sub: 'Every pincode covered' },
  { icon: ShieldCheck, title: 'Secure Payments', sub: '100% safe checkout' },
  { icon: Zap, title: 'Fast Dispatch', sub: 'Printed in 24-48 hrs' },
  { icon: Wallet, title: 'UPI / Card / Netbanking', sub: 'Prepaid only, no COD' },
];

const TrustStrip = () => (
  <section aria-label="Why customers trust Graphic Wala" className="border-y border-border bg-secondary/60">
    <div className="container grid grid-cols-2 lg:grid-cols-4 gap-px bg-border/60 overflow-hidden rounded-none">
      {items.map((it) => (
        <div key={it.title} className="flex items-start gap-3 bg-background px-4 py-4">
          <div className="mt-0.5 h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
            <it.icon className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight text-foreground">{it.title}</p>
            <p className="text-xs text-muted-foreground leading-tight mt-0.5">{it.sub}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TrustStrip;