import { Palette, Timer, Truck, Printer, MessageCircle, Headphones } from 'lucide-react';

const benefits = [
  { icon: Palette, title: 'Custom Design Support', text: 'Send a rough idea — our designers make it print-ready free of cost.' },
  { icon: Timer, title: 'Fast Processing', text: 'Orders confirmed before 5 PM go into print the same day.' },
  { icon: Truck, title: 'Pan-India Delivery', text: 'Delivered to every state and pincode in India, tracked end to end.' },
  { icon: Printer, title: 'Quality Printing', text: 'Sharp colours, premium material and proper finishing on every order.' },
  { icon: MessageCircle, title: 'Easy WhatsApp Order', text: 'Not comfortable online? Just WhatsApp us and we place the order for you.' },
  { icon: Headphones, title: 'Support After Purchase', text: 'Damage or print issue? Report within 48 hours and we fix it.' },
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