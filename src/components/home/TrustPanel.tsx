import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, ShieldCheck, Clock, RotateCcw } from 'lucide-react';
import { WHATSAPP_NUMBER, PHONE_NUMBER, BUSINESS_NAME } from '@/lib/types';
import { normalizeIndianPhoneForWhatsApp } from '@/lib/phone';

const TrustPanel = () => {
  const wa = `https://wa.me/${normalizeIndianPhoneForWhatsApp(WHATSAPP_NUMBER)}?text=${encodeURIComponent(
    `Hello ${BUSINESS_NAME}, I have a question about my order.`,
  )}`;

  return (
    <section className="py-14 md:py-20 bg-background" aria-labelledby="trust-heading">
      <div className="container">
        <header className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs font-bold tracking-wide text-primary mb-2">Order With Confidence</p>
          <h2 id="trust-heading" className="text-3xl md:text-4xl font-black tracking-tight">
            A Real Shop, Real People, Real Support
          </h2>
        </header>

        <div className="grid gap-4 md:grid-cols-3 items-stretch">
          <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
            <Clock className="h-5 w-5 text-primary mb-3" aria-hidden="true" />
            <h3 className="font-bold mb-2">Delivery Timeline</h3>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>Design approval: same day</li>
              <li>Printing & packing: 1-2 days</li>
              <li>Delivery across India: 4-7 days</li>
            </ul>
            <Link to="/shipping-policy" className="mt-auto pt-3 inline-block text-sm font-bold text-primary">
              Shipping Policy
            </Link>
          </div>

          <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
            <ShieldCheck className="h-5 w-5 text-primary mb-3" aria-hidden="true" />
            <h3 className="font-bold mb-2">Safe Payments</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Debit / Credit Card', 'Netbanking'].map((m) => (
                <span
                  key={m}
                  className="rounded-md border border-border bg-secondary px-2 py-1 text-[11px] font-semibold text-foreground"
                >
                  {m}
                </span>
              ))}
            </div>
            <p className="mt-auto text-xs text-muted-foreground">
              All orders are prepaid and processed on an encrypted payment gateway. Cash on Delivery is not available.
            </p>
          </div>

          <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft">
            <RotateCcw className="h-5 w-5 text-primary mb-3" aria-hidden="true" />
            <h3 className="font-bold mb-2">Returns & Refunds</h3>
            <p className="text-sm text-muted-foreground">
              Damaged or wrongly printed item? Report within 48 hours with an unboxing video and we replace or refund it.
            </p>
            <div className="mt-auto pt-3 flex flex-wrap gap-3 text-sm font-bold text-primary">
              <Link to="/refund-policy">Refund Policy</Link>
              <Link to="/terms-and-conditions">Terms</Link>
              <Link to="/privacy-policy">Privacy</Link>
            </div>
          </div>
        </div>

        <address className="not-italic mt-4 grid gap-3 rounded-2xl border border-border bg-secondary p-5 sm:grid-cols-2 lg:grid-cols-4">
          <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold hover:text-primary">
            <MessageCircle className="h-4 w-4 text-primary" aria-hidden="true" />
            WhatsApp Us
          </a>
          <a href={`tel:${PHONE_NUMBER}`} className="flex items-center gap-2 text-sm font-semibold hover:text-primary">
            <Phone className="h-4 w-4 text-primary" aria-hidden="true" />
            {PHONE_NUMBER}
          </a>
          <a href="mailto:graphicwalaktr@gmail.com" className="flex items-center gap-2 text-sm font-semibold break-all hover:text-primary">
            <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            graphicwalaktr@gmail.com
          </a>
          <span className="flex items-center gap-2 text-sm font-semibold">
            <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
            Katihar, Bihar, India
          </span>
        </address>
      </div>
    </section>
  );
};

export default TrustPanel;