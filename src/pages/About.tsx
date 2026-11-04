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
        <div className="max-w-3xl mx-auto prose prose-lg">
          <p className="text-muted-foreground leading-relaxed">Graphic Wala is a leading custom printing service provider committed to delivering exceptional quality products across India. From personalized photo frames to custom PVC cards, visiting cards, ID cards, and keychains — we bring your ideas to life with precision and care.</p>
          <p className="text-muted-foreground leading-relaxed mt-4">Our mission is to make premium custom printing accessible to everyone in India, with fast home delivery, competitive pricing, and unmatched customer service. Every product is custom-made with your photos and designs.</p>
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
