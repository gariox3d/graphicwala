import { Helmet } from 'react-helmet-async';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const HOME_FAQS = [
  {
    q: 'What file format and resolution should I upload for printing?',
    a: 'Upload JPEG or PNG files at 300 DPI for the final print size. For a standard 6 × 8 inch photo frame that means roughly 1800 × 2400 pixels. Screenshots, WhatsApp-forwarded images and web downloads are usually 72 DPI and will print soft. If you only have a low-resolution file, send it to us on WhatsApp first and our design team will tell you the largest size it can be printed at cleanly.',
  },
  {
    q: 'Which paper GSM and material do you use for each product?',
    a: 'Visiting cards are printed on 300 GSM art card with matte or gloss lamination, premium cards on 350 GSM. PVC and ID cards use 760-micron waterproof PVC — the same thickness as a debit card. Brochures and flyers run on 130–170 GSM, and photo prints use archival photo paper mounted inside the frame. If your job needs a specific stock, tell us and we will confirm availability before production.',
  },
  {
    q: 'Do you design in CMYK or RGB, and will my colours change?',
    a: 'All print production runs in CMYK. Screens display RGB, which can show bright shades that no ink can reproduce, so highly saturated blues, greens and neons shift slightly when printed. We convert and soft-proof every file before production and flag anything that will change noticeably. For exact brand matching, share your Pantone reference and we will match it as closely as the chosen stock allows.',
  },
  {
    q: 'How long does an order take from upload to delivery?',
    a: 'Once your artwork passes our quality check, small personalised items such as keychains, PVC cards and single photo frames are produced within one to two working days. Bulk card, brochure and multi-frame runs take two to four working days. Shipping time is added on top and depends on your pin code — metro addresses are typically quicker than remote locations. You receive a tracking link the moment your parcel is dispatched.',
  },
  {
    q: 'Can I see a proof before you print my order?',
    a: 'Yes. For custom design work and bulk orders we share a digital proof on WhatsApp and wait for your written approval before anything goes to the press. For straightforward photo products we run an automatic quality check on resolution, cropping and bleed, and contact you only if something needs correcting. Nothing is printed while a query is still open.',
  },
  {
    q: 'What if my product arrives damaged or printed incorrectly?',
    a: 'Record an unedited unboxing video and contact us on WhatsApp within 48 hours of delivery with your order ID. If the fault is a printing defect, transit damage or a mismatch with the approved proof, we reprint or resolve it at our cost. Because every item is custom made to your artwork, we cannot accept returns for change of mind or for low-resolution files that were approved before printing.',
  },
  {
    q: 'Do you accept Cash on Delivery?',
    a: 'No. Graphicwala is prepaid only. Every item is manufactured specifically for you and cannot be resold, so we accept UPI, credit cards, debit cards and net banking through Razorpay. Payments are processed on Razorpay\u2019s secure gateway and we never store card details on our servers.',
  },
  {
    q: 'Do you deliver across India, and is local pickup available?',
    a: 'Yes, we ship prepaid orders to every serviceable pin code in India through our courier partners. Delivery charges are calculated per item and shown before payment. Customers in and around Katihar can also choose store pickup from our Nasirganj studio during business hours, which removes the delivery charge entirely.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: HOME_FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const FaqSection = () => (
  <section className="py-16 md:py-24 bg-muted/30" aria-labelledby="faq-heading">
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
    </Helmet>
    <div className="container max-w-3xl">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold mb-3">Support</p>
        <h2 id="faq-heading" className="text-3xl md:text-4xl font-bold mb-4">
          Printing &amp; design questions, answered
        </h2>
        <p className="text-muted-foreground">
          Everything about file preparation, materials, proofing, turnaround and delivery — written
          by the team that actually runs the press.
        </p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {HOME_FAQS.map((faq, i) => (
          <AccordionItem key={faq.q} value={`faq-${i}`}>
            <AccordionTrigger className="text-left text-base font-semibold">{faq.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed text-[0.95rem]">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);

export default FaqSection;
