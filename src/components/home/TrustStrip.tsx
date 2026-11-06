import { Truck, ShieldCheck, Zap, Wallet } from 'lucide-react';
import Reveal from '@/components/Reveal';

const items = [
  { icon: Truck, title: 'All India Delivery', sub: 'Every pincode covered' },
  { icon: ShieldCheck, title: 'Secure Payments', sub: '100% safe checkout' },
  { icon: Zap, title: 'Fast Dispatch', sub: 'Priority processing' },
  { icon: Wallet, title: 'Prepaid Only', sub: 'UPI / Card / Netbanking' },
];

const TrustStrip = () => (
  <section aria-label="Why customers trust Graphic Wala" className="relative border-y border-slate-100 bg-white">
    <div className="container">
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 py-7 sm:gap-x-8 sm:py-9 lg:grid-cols-4 lg:gap-6 lg:py-10">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={i * 90} className="group flex flex-col items-center text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-primary/[0.07] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
              <it.icon className="h-5 w-5 text-primary" strokeWidth={1.4} aria-hidden="true" />
            </div>
            <p className="text-[13px] font-bold tracking-tight text-foreground sm:text-sm">{it.title}</p>
            <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{it.sub}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default TrustStrip;
