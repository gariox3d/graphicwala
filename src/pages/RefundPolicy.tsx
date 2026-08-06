import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BUSINESS_NAME, WHATSAPP_NUMBER, PHONE_NUMBER } from '@/lib/types';
import Seo from '@/components/seo/Seo';

const RefundPolicy = () => {
  return (
    <>
      <Seo
        title={`Refund Policy – ${BUSINESS_NAME}`}
        description={`Refund and return policy for ${BUSINESS_NAME}. Learn about replacements, refund timelines, and how to report damaged products.`}
        path="/refund-policy"
      />
      <Header />
      <main className="container py-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Refund & Return Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: 1 March 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Custom Products – No Returns</h2>
            <p>
              All {BUSINESS_NAME} products are <strong>custom-printed</strong> based on your uploaded designs. 
              Therefore, we do <strong>not</strong> accept returns or cancellations for change of mind, wrong design upload, or colour mismatch due to screen differences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Damaged or Defective Products</h2>
            <p>If your product arrives damaged, broken, or defective, we will offer a <strong>replacement or resolution</strong>. To be eligible:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Contact us on WhatsApp within <strong>48 hours</strong> of receiving the product.</li>
              <li>Send a clear, <strong>unedited video</strong> showing:
                <ul className="list-disc ml-6 mt-1 space-y-1">
                  <li>The damaged product</li>
                  <li>Outer packaging</li>
                  <li>Your Order ID</li>
                </ul>
              </li>
              <li>Do not dispose of the product or packaging until the issue is resolved.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Verification & Resolution</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Our team will review your video and verify the damage within <strong>24–48 hours</strong>.</li>
              <li>If approved, we will offer a <strong>free replacement</strong> shipped at no extra cost.</li>
              <li>In cases where replacement is not possible, a <strong>full or partial refund</strong> may be issued at our discretion.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Refund Timeline</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Approved refunds are processed within <strong>7–10 business days</strong>.</li>
              <li>Refunds are credited to the <strong>original payment method</strong> (UPI, card, or bank account).</li>
              <li>You will receive confirmation once the refund is initiated.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Non-Eligible Cases</h2>
            <p>Refunds or replacements will <strong>not</strong> be provided for:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Low-quality prints caused by low-resolution image uploads.</li>
              <li>Minor colour variations between screen and print.</li>
              <li>Damage caused by the customer after delivery.</li>
              <li>Claims made after the 48-hour window.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Contact Us</h2>
            <p>
              To report a damaged product or request a refund, contact us on WhatsApp at{' '}
              <a href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`} className="text-primary underline" target="_blank" rel="noopener noreferrer">
                {PHONE_NUMBER}
              </a>{' '}
              or email us at <span className="text-primary">graphicwalaktr@gmail.com</span>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default RefundPolicy;
