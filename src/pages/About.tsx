import { Helmet } from 'react-helmet-async';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LocationSection from '@/components/LocationSection';
import { localBusinessJsonLd } from '@/lib/nap';

const aboutLocalBusinessJsonLd = localBusinessJsonLd('https://www.graphicwala.com/about');

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About Graphic Wala",
  "description": "Graphic Wala is India's trusted online store for custom photo frames, PVC cards, keychains & personalized gifts with All India delivery.",
  "url": "https://www.graphicwala.com/about",
  "mainEntity": {
    "@type": "Organization",
    "name": "Graphic Wala",
    "url": "https://www.graphicwala.com",
    "logo": "https://www.graphicwala.com/logo.png",
    "foundingDate": "2020",
    "description": "Premium custom printing and personalized gifts store with All India home delivery.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Nasirganj, Sabji Mandi, Near Sarfaraz Art",
      "addressLocality": "Katihar",
      "addressRegion": "Bihar",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+916207142994",
      "contactType": "customer service"
    }
  }
};

const About = () => (
  <div className="min-h-screen flex flex-col">
    <Helmet>
      <title>About Graphic Wala | Custom Printing & Personalized Gifts Store India</title>
      <meta name="description" content="Learn about Graphic Wala - India's trusted online store for custom photo frames, PVC cards, keychains & personalized gifts. Premium quality printing since 2020 with All India delivery." />
      <link rel="canonical" href="https://www.graphicwala.com/about" />
      <meta property="og:title" content="About Graphic Wala | Custom Printing Store India" />
      <meta property="og:description" content="India's trusted store for custom photo frames, PVC cards & personalized gifts. Premium quality since 2020." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://www.graphicwala.com/about" />
      <meta property="og:image" content="https://www.graphicwala.com/og-square.png" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="About Graphic Wala | Custom Printing Store India" />
      <meta name="twitter:description" content="India's trusted store for custom photo frames, PVC cards & personalized gifts." />
      <script type="application/ld+json">{JSON.stringify(aboutJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(aboutLocalBusinessJsonLd)}</script>
    </Helmet>
    <Header />
    <main className="flex-1">
      <section className="py-16 md:py-24 bg-foreground text-background">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Graphic Wala</h1>
          <p className="text-background/70 max-w-2xl mx-auto">Your trusted partner for premium custom printing & personalized gifts since 2020. All India delivery.</p>
        </div>
      </section>

      <section className="py-16 container">
        <div className="max-w-3xl mx-auto space-y-10">
          <div>
            <h2 className="text-2xl font-bold mb-3">Who We Are</h2>
            <p className="text-muted-foreground leading-relaxed">Graphic Wala is a custom printing studio based in Nasirganj, Katihar (Bihar), serving customers across India since 2020. What started as a small local print shop has grown into a full online store where anyone in India can order personalized photo frames, PVC cards, ID cards, visiting cards, keychains, mouse pads, photo magnets and more — printed with their own photos and designs, and delivered to their doorstep.</p>
            <p className="text-muted-foreground leading-relaxed mt-4">We handle everything in-house: design preparation, colour correction, printing, lamination, finishing and packing. Because there is no middleman, we keep prices low while maintaining tight quality control on every single order.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">Our mission is simple — make premium-quality custom printing accessible and affordable for every Indian household and business. Whether it is a gift for someone special, ID cards for your staff, or visiting cards for your new business, we believe professional printing should not require visiting a big-city studio or paying big-city prices.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3">Our Equipment & Print Quality</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">We invest in professional-grade machinery so your prints look sharp and last long:</p>
            <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
              <li><strong>High-resolution digital printing</strong> — up to 1440 dpi output for crisp photos and text on frames, cards and gifts.</li>
              <li><strong>Sublimation & UV printing</strong> — used for keychains, mouse pads, mugs and coated surfaces so colours stay vibrant and scratch-resistant.</li>
              <li><strong>PVC card printing</strong> — thermal-transfer and retransfer printing on genuine PVC sheets, the same process used for bank and office ID cards.</li>
              <li><strong>Lamination & finishing</strong> — glossy and matte lamination options that protect prints from moisture, fading and daily wear.</li>
              <li><strong>Paper stocks</strong> — photo prints on 250–350 GSM premium sheets; visiting cards on 300–350 GSM art card with optional lamination.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3">Our Design Philosophy</h2>
            <p className="text-muted-foreground leading-relaxed">Every order is checked by a human before it goes to print. If your uploaded photo is low-resolution, wrongly cropped, or has colour issues, we contact you on WhatsApp before printing instead of shipping a bad product. We prepare files in CMYK colour mode for accurate print output, keep safe margins so nothing important gets trimmed, and confirm layouts for bulk card orders before production.</p>
            <p className="text-muted-foreground leading-relaxed mt-4">Good design is not decoration — it is clarity. Whether it is a visiting card that must be readable at arm's length or a photo frame that will hang on your wall for years, we design for the real world, not just the screen.</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-3">Why Customers Trust Us</h2>
            <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
              <li>100% prepaid, transparent pricing — no hidden charges, no cash-on-delivery risk.</li>
              <li>All India delivery through trusted courier partners with live tracking.</li>
              <li>Direct WhatsApp support — you talk to the team that actually prints your order.</li>
              <li>Damage replacement policy with a simple unboxing-video claim process.</li>
              <li>Thousands of orders delivered across Bihar, West Bengal, UP, Delhi, Maharashtra and beyond.</li>
            </ul>
          </div>
        </div>
      </section>

      <LocationSection
        heading="Where Graphic Wala Is Based"
        subheading="Our printing studio is located in Nasirganj, Katihar, Bihar. Walk in for local orders, or shop online with prepaid delivery anywhere in India."
      />
    </main>
    <Footer />
  </div>
);

export default About;
