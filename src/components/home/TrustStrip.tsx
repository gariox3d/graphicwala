import { Truck, ShieldCheck, Zap, Wallet } from 'lucide-react';
import Reveal from '@/components/Reveal';

const items = [
  { icon: Truck, title: 'All India Delivery', sub: 'Every pincode covered' },
  { icon: ShieldCheck, title: 'Secure Payments', sub: '100% safe checkout' },
  { icon: Zap, title: 'Fast Dispatch', sub: 'Printed in 24-48 hrs' },
  { icon: Wallet, title: 'Prepaid Only', sub: 'UPI / Card / Netbanking' },
];

const TrustStrip = () => (
  <section aria-label="Why customers trust Graphic Wala" className="border-b border-border bg-background">
    <div className="container">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6 py-10 md:py-14">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 90} className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/8 border border-primary/15 flex items-center justify-center mb-3 transition-transform duration-500 hover:scale-110">
              <it.icon className="h-5 w-5 text-primary" strokeWidth={1.4} aria-hidden="true" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">{it.title}</p>
            <p className="text-xs text-muted-foreground mt-1.5">{it.sub}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default TrustStrip;
