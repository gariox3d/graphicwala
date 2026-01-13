import { Mail, Phone, MapPin } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const Contact = () => (
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
          <form className="space-y-4">
            <div><Label htmlFor="name">Name</Label><Input id="name" placeholder="Your name" /></div>
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="your@email.com" /></div>
            <div><Label htmlFor="message">Message</Label><Textarea id="message" placeholder="How can we help?" rows={5} /></div>
            <Button variant="hero" className="w-full">Send Message</Button>
          </form>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Contact;
