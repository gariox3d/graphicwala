import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PageShell, ServiceGrid } from '@/components/services/ServiceBlocks';
import { CORPORATE_ITEMS } from '@/data/services';

const CorporateGifting = () => {
  const [f, setF] = useState({ name: '', company: '', phone: '', email: '', product: '', quantity: '', message: '' });
  const [sending, setSending] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, '').slice(-10))) {
      toast.error('Please enter your name and a valid 10-digit mobile number.');
      return;
    }
    setSending(true);
    const message = [
      '[Corporate / Bulk Enquiry]',
      `Company: ${f.company || '-'}`,
      `Email: ${f.email || '-'}`,
      `Product: ${f.product || '-'}`,
      `Quantity: ${f.quantity || '-'}`,
      `Message: ${f.message || '-'}`,
    ].join('\n').slice(0, 1900);
    const { error } = await supabase.from('contact_messages').insert({ name: f.name.trim().slice(0, 100), phone: f.phone.trim(), message });
    setSending(false);
    if (error) return toast.error('Could not send. Please try WhatsApp.');
    toast.success('Thank you! We will contact you with a quote shortly.');
    setF({ name: '', company: '', phone: '', email: '', product: '', quantity: '', message: '' });
  };

  return (
    <PageShell
      title="Corporate Gifts in Katihar — Bulk Custom Mugs, T-Shirts, Keychains | Graphic Wala"
      description="Branded corporate gifts, employee and Diwali gifts, custom mugs, t-shirts and merchandise in bulk. Request a quote from Graphic Wala."
      path="/corporate-gifting"
      eyebrow="Corporate Gifting"
      h1="Branded Gifts for Teams, Clients & Events"
      lead="Logo mugs, t-shirts, keychains, frames and festive gift sets — designed, printed and packed in bulk."
      actions={<Button asChild size="lg" className="rounded-full"><a href="#enquiry">Request Bulk Quote</a></Button>}
    >
      <section className="py-12 md:py-16">
        <div className="container"><ServiceGrid items={CORPORATE_ITEMS} /></div>
      </section>
      <section id="enquiry" className="scroll-mt-24 bg-secondary py-12 md:py-16" aria-labelledby="enq-h">
        <div className="container max-w-2xl">
          <h2 id="enq-h" className="text-2xl md:text-3xl font-black tracking-tight text-center">Bulk Order / Corporate Enquiry</h2>
          <form onSubmit={submit} className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-5 md:p-7 sm:grid-cols-2">
            <Input placeholder="Name *" value={f.name} onChange={set('name')} maxLength={100} required />
            <Input placeholder="Company Name" value={f.company} onChange={set('company')} maxLength={120} />
            <Input placeholder="Phone *" type="tel" value={f.phone} onChange={set('phone')} maxLength={15} required />
            <Input placeholder="Email" type="email" value={f.email} onChange={set('email')} maxLength={120} />
            <Input placeholder="Product" value={f.product} onChange={set('product')} maxLength={120} />
            <Input placeholder="Quantity" value={f.quantity} onChange={set('quantity')} maxLength={20} />
            <Textarea className="sm:col-span-2" rows={4} placeholder="Message" value={f.message} onChange={set('message')} maxLength={1000} />
            <Button type="submit" size="lg" disabled={sending} className="sm:col-span-2 rounded-full">
              {sending ? 'Sending…' : 'Request Bulk Quote'}
            </Button>
          </form>
        </div>
      </section>
    </PageShell>
  );
};

export default CorporateGifting;
