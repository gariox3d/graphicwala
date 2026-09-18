import { Palette, Timer, Truck, Printer, MessageCircle, Headphones } from 'lucide-react';

const benefits = [
  {
    icon: Palette,
    title: 'Custom Design Support',
    text: 'Send a rough idea, a photo or even a hand-written note. Our designers redraw it as print-ready artwork in CMYK colour mode with 3 mm bleed and safe margins, so nothing important gets trimmed off at the cutting stage — free of cost with your order.',
  },
  {
    icon: Timer,
    title: 'Clear Turnaround',
    text: 'Design proof is shared for your approval first. Once you approve, printing, finishing and packing happen in one continuous batch, and you get a dispatch update with a tracking number the moment the parcel leaves our press.',
  },
  {
    icon: Truck,
    title: 'Pan-India Delivery',
    text: 'We ship to every state and pincode in India through trusted courier partners with live tracking. Frames travel in corner-protected, shock-absorbing packaging and cards are shipped in rigid sleeves so edges stay crisp.',
  },
  {
    icon: Printer,
    title: 'Press-Grade Printing',
    text: 'Visiting cards on 300–400 GSM art card with matte or glossy lamination, PVC and ID cards on 0.76 mm waterproof PVC, and photo frames printed on premium coated media — colour-calibrated for accurate skin tones and deep blacks.',
  },
  {
    icon: MessageCircle,
    title: 'Easy WhatsApp Order',
    text: 'Not comfortable ordering online? Send your design and requirement on WhatsApp. We confirm size, material, quantity and price in writing, place the order for you and share a payment link — no app or account hassle.',
  },
  {
    icon: Headphones,
    title: 'Support After Purchase',
    text: 'If a parcel arrives damaged or a print does not match the approved proof, report it within 48 hours with an unboxing video. After a quick check we reprint or refund — you do not pay twice for our mistake.',
  },
];

const WhyBuyFromUs = () => (
  <section className="py-14 md:py-20 bg-secondary" aria-labelledby="why-us-heading">
    <div className="container">
      <header className="text-center max-w-2xl mx-auto mb-10">
        <p className="text-xs md:text-[13px] font-bold tracking-[0.08em] text-primary mb-2">Why Graphic Wala</p>
        <h2 id="why-us-heading" className="text-3xl md:text-4xl font-black tracking-tight">
          Why Thousands of Indians Order From Us
        </h2>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((b) => (
          <article key={b.title} className="rounded-2xl bg-card border border-border p-5 shadow-soft">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <b.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <h3 className="font-bold mb-1">{b.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{b.text}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default WhyBuyFromUs;