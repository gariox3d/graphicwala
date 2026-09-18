import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LocationSection from '@/components/LocationSection';
import { NAP, NAP_ADDRESS_LINE, localBusinessJsonLd } from '@/lib/nap';

const contactLocalBusinessJsonLd = localBusinessJsonLd('https://www.graphicwala.com/contact');

const contactJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "Contact Graphic Wala",
  "url": "https://www.graphicwala.com/contact",
  "mainEntity": {
    "@type": "LocalBusiness",
    "name": "Graphic Wala",
    "telephone": "+916207142994",
    "email": "graphicwalaktr@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Nasirganj, Sabji Mandi, Near Sarfaraz Art",
      "addressLocality": "Katihar",
      "addressRegion": "Bihar",
      "postalCode": "854105",
      "addressCountry": "IN"
    }
  }
};

const Contact = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const lastSent = localStorage.getItem('contact_last_sent');
    if (lastSent) {
      const hoursSince = (Date.now() - Number(lastSent)) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        const hoursLeft = Math.ceil(24 - hoursSince);
        toast.error(`You can send another message after ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}.`);
        return;
      }
    }

    if (!name.trim() || !phone.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({ name: name.trim(), phone: phone.trim(), message: message.trim() });

      if (error) throw error;

      localStorage.setItem('contact_last_sent', String(Date.now()));
      toast.success('Message sent successfully! We will contact you soon.');
      setName('');
      setPhone('');
      setMessage('');
    } catch (err) {
      console.error('Contact form error:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Contact Graphic Wala | Custom Printing Store India | WhatsApp Support</title>
        <meta name="description" content="Contact Graphic Wala for custom photo frames, PVC cards, keychains & printing queries. WhatsApp: +91 6207142994. Located in Katihar, Bihar. All India delivery support." />
        <link rel="canonical" href="https://www.graphicwala.com/contact" />
        <meta property="og:title" content="Contact Graphic Wala | Custom Printing Support" />
        <meta property="og:description" content="Get in touch with Graphic Wala for custom printing queries. WhatsApp & phone support available." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.graphicwala.com/contact" />
        <meta property="og:image" content="https://www.graphicwala.com/og-square.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Contact Graphic Wala | Custom Printing Support" />
        <script type="application/ld+json">{JSON.stringify(contactJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(contactLocalBusinessJsonLd)}</script>
      </Helmet>
      <Header />
      <main className="flex-1 py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">Contact Us</h1>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Have a question about a custom print, file format, delivery timeline or an existing order?
                Send us a message using the form and our team replies during working hours. For urgent
                print jobs, WhatsApp is the fastest way to reach us.
              </p>
              <address className="not-italic space-y-4">
                <div className="flex items-center gap-4"><Mail className="h-5 w-5 text-primary shrink-0" aria-hidden="true" /><a href={`mailto:${NAP.email}`} className="break-all hover:text-primary transition-colors">{NAP.email}</a></div>
                <div className="flex items-center gap-4"><Phone className="h-5 w-5 text-primary shrink-0" aria-hidden="true" /><a href={`tel:${NAP.phoneE164}`} className="hover:text-primary transition-colors">{NAP.phoneDisplay}</a></div>
                <div className="flex items-start gap-4"><MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" /><span>{NAP_ADDRESS_LINE}</span></div>
              </address>

              <h2 className="text-xl font-semibold mt-10 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" aria-hidden="true" /> Business Hours
              </h2>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between border-b border-border pb-2"><span>Monday – Saturday</span><span className="font-semibold">10:00 AM – 8:00 PM IST</span></li>
                <li className="flex justify-between border-b border-border pb-2"><span>Sunday</span><span className="font-semibold">11:00 AM – 4:00 PM IST</span></li>
                <li className="flex justify-between"><span>National holidays</span><span className="font-semibold">Closed</span></li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                Messages received after working hours are answered on the next working day. Orders placed
                online are accepted 24×7 and enter production on the next working day.
              </p>

              <h2 className="text-xl font-semibold mt-10 mb-4">What to Include in Your Message</h2>
              <ul className="list-disc ml-5 space-y-1.5 text-sm text-muted-foreground">
                <li>Product you need (photo frame, PVC card, ID card, visiting card, keychain).</li>
                <li>Quantity and finish preference (glossy, matte or lamination).</li>
                <li>Your artwork format — JPEG or PNG, ideally 300 DPI for sharp printing.</li>
                <li>Delivery pincode so we can share an accurate shipping estimate.</li>
                <li>Order ID, if your question is about an existing order.</li>
              </ul>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><Label htmlFor="name">Name</Label><Input id="name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} maxLength={100} /></div>
              <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" type="tel" placeholder="10-digit mobile number" value={phone} onChange={e => setPhone(e.target.value)} maxLength={10} /></div>
              <div><Label htmlFor="message">Message</Label><Textarea id="message" placeholder="How can we help?" rows={5} value={message} onChange={e => setMessage(e.target.value)} maxLength={1000} /></div>
              <Button variant="hero" className="w-full" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <LocationSection />
      <Footer />
    </div>
  );
};

export default Contact;
