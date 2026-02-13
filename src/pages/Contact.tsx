import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Contact = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 24-hour rate limit check
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
      <Header />
      <main className="flex-1 py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-12">Contact Us</h1>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div>
              <h2 className="text-xl font-semibold mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4"><Mail className="h-5 w-5 text-primary" /><span>graphicwalaktr@gmail.com</span></div>
                <div className="flex items-center gap-4"><Phone className="h-5 w-5 text-primary" /><span>+91 620714 2994</span></div>
                <div className="flex items-center gap-4"><MapPin className="h-5 w-5 text-primary" /><span>Nasirganj, Sabji Mandi, Near Sarfaraz Art, Katihar India</span></div>
              </div>
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
      <Footer />
    </div>
  );
};

export default Contact;
