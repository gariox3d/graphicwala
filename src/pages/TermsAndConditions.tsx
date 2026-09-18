import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BUSINESS_NAME, WHATSAPP_NUMBER, PHONE_NUMBER } from '@/lib/types';
import Seo from '@/components/seo/Seo';

const TermsAndConditions = () => {
  return (
    <>
      <Seo
        title={`Terms & Conditions – ${BUSINESS_NAME}`}
        description={`Terms and conditions for using ${BUSINESS_NAME}. Read about orders, payments, returns, and more.`}
        path="/terms-and-conditions"
      />
      <Header />
      <main className="container py-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: 1 March 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. General</h2>
            <p>
              By using the {BUSINESS_NAME} website and placing an order, you agree to the following terms and conditions. 
              Please read them carefully before making a purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Products & Customisation</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>All products (photo frames, PVC cards, ID cards, visiting cards, keychains, etc.) are custom-printed as per your uploaded design.</li>
              <li>Please ensure the uploaded images are of good quality. {BUSINESS_NAME} is not responsible for blurry prints caused by low-resolution uploads.</li>
              <li>Colours may vary slightly between screen display and the final printed product due to printing technology differences.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Orders & Payments</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>All orders are confirmed only after successful payment via Razorpay (UPI, cards, net banking).</li>
              <li>Once an order is placed with a custom design, it <strong>cannot be cancelled</strong> as production begins immediately.</li>
              <li>Prices are inclusive of applicable taxes unless stated otherwise.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Delivery</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Estimated delivery times are displayed on each product page and at checkout.</li>
              <li>Delivery timelines may vary depending on your location and courier availability.</li>
              <li>{BUSINESS_NAME} is not liable for delays caused by courier services, natural disasters, or unforeseen events.</li>
              <li>Store pickup is available where enabled.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Returns & Refunds</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Since all products are custom-made, we do <strong>not</strong> accept returns for change of mind.</li>
              <li>If the product arrives <strong>damaged or defective</strong>, contact us on WhatsApp within <strong>48 hours</strong> with an unedited video showing the damage, packaging, and order ID.</li>
              <li>After verification, we will offer a <strong>replacement or resolution</strong> at our discretion.</li>
              <li>Refunds, if applicable, will be processed within 7–10 business days to the original payment method.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Artwork, Files & Design Proofs</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Accepted upload formats are <strong>JPEG and PNG</strong>. For the sharpest results, artwork should be at least 300 DPI at the final print size.</li>
              <li>Keep important text and faces at least 3 mm inside the edge. Anything outside the safe area may be trimmed during cutting.</li>
              <li>Screens display colour in RGB while printing uses CMYK inks, so bright neon shades may print slightly duller. This is a normal characteristic of printing and is not treated as a defect.</li>
              <li>Where a design proof is shared, production begins only after your approval. Spelling, numbers and names in an approved proof are considered final and reprints for such errors are chargeable.</li>
              <li>If our design team prepares artwork for you, the final print-ready file remains with us for production use; you retain full rights to your own logos, photos and content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Order Support & Working Hours</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Orders can be placed on the website 24×7. Support and production run Monday to Saturday, 10:00 AM – 8:00 PM IST, and Sunday, 11:00 AM – 4:00 PM IST.</li>
              <li>Messages received outside working hours or on national holidays are answered on the next working day.</li>
              <li>Design changes requested after printing has started cannot be accommodated.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Intellectual Property</h2>
            <p>
              You confirm that you have the rights to use any images, logos, or designs you upload. 
              {BUSINESS_NAME} is not responsible for copyright infringement arising from customer-uploaded content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Account & Data</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>You are responsible for keeping your account credentials secure.</li>
              <li>We reserve the right to suspend accounts involved in fraudulent or abusive activities.</li>
              <li>Your data is handled as described in our <a href="/privacy-policy" className="text-primary underline">Privacy Policy</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Limitation of Liability</h2>
            <p>
              {BUSINESS_NAME} shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. 
              Our maximum liability is limited to the order value of the affected product.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the website after changes constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
            <p>
              For any queries, reach us on WhatsApp at{' '}
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

export default TermsAndConditions;
