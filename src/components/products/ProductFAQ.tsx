import { Helmet } from 'react-helmet-async';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface Props {
  productName: string;
  deliveryDays?: number | null;
  deliveryCharge?: number | null;
  customizable?: boolean;
}

const ProductFAQ = ({ productName, deliveryDays, deliveryCharge, customizable }: Props) => {
  const days = deliveryDays || 7;
  const faqs = [
    {
      q: `How long does delivery take for ${productName}?`,
      a: `Orders are printed within 24-48 hours and usually delivered anywhere in India within ${days} days of design approval.`,
    },
    {
      q: 'What are the delivery charges?',
      a:
        deliveryCharge && deliveryCharge > 0
          ? `Delivery charge for this product is ₹${deliveryCharge}. If you order multiple items, the charge of each item is added up and shown clearly before payment.`
          : 'Delivery charges, if any, are shown in the price breakdown before you pay. There are no hidden charges at checkout.',
    },
    {
      q: 'How do I send my photo or design?',
      a: customizable
        ? 'Upload your photo (JPEG or PNG) directly on this page before adding to cart. You can also WhatsApp the photo to us and we will attach it to your order.'
        : 'This product does not need a photo upload. If you want any personalisation, just WhatsApp us before ordering.',
    },
    {
      q: 'Which payment methods do you accept?',
      a: 'We accept UPI (Google Pay, PhonePe, Paytm), debit cards, credit cards and netbanking. All orders are prepaid — Cash on Delivery is not available because every item is custom-made.',
    },
    {
      q: 'What if the product arrives damaged?',
      a: 'Record an unboxing video and report the issue within 48 hours of delivery on WhatsApp. We will replace the item or refund you.',
    },
  ];

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <section aria-labelledby="product-faq-heading" className="mt-12">
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>
      <h2 id="product-faq-heading" className="text-2xl font-black tracking-tight mb-4">
        Frequently Asked Questions
      </h2>
      <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-4">
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-sm font-bold">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default ProductFAQ;