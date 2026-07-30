import { Link } from 'react-router-dom';
import { MousePointerClick, Upload, PackageCheck, ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WHATSAPP_NUMBER, BUSINESS_NAME } from '@/lib/types';
import { normalizeIndianPhoneForWhatsApp } from '@/lib/phone';

const steps = [
  {
    icon: MousePointerClick,
    title: 'Select Your Product',
    text: 'Pick a photo frame, PVC card, ID card, visiting card or keychain.',
  },
  {
    icon: Upload,
    title: 'Upload Photo / Details',
    text: 'Add your photo or text right on the product page. JPEG or PNG works.',
  },
  {
    icon: PackageCheck,
    title: 'Place Order & Relax',
    text: 'Pay securely online. We print and deliver across India.',
  },
];

const HowItWorks = () => {
  const wa = `https://wa.me/${normalizeIndianPhoneForWhatsApp(WHATSAPP_NUMBER)}?text=${encodeURIComponent(
    `Hello ${BUSINESS_NAME}, I want to place a custom order.`,
  )}`;

  return (
    <section className="py-14 md:py-20 bg-background" aria-labelledby="how-it-works-heading">
      <div className="container">
        <header className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Simple 3-Step Order</p>
          <h2 id="how-it-works-heading" className="text-3xl md:text-4xl font-black tracking-tight">
            Custom Order in 3 Easy Steps
          </h2>
          <p className="text-muted-foreground mt-3">
            No design knowledge needed. Upload your photo and we handle the rest.
          </p>
        </header>

        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-soft"
            >
              <span className="absolute top-5 right-5 text-4xl font-black text-muted/70 leading-none">
                {i + 1}
              </span>
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <s.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <h3 className="font-bold text-lg mb-1.5">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/products" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-full font-bold">
              Start Your Order
              <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
            </Button>
          </Link>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full font-semibold">
              <MessageCircle className="h-4 w-4 mr-1" aria-hidden="true" />
              Ask on WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;