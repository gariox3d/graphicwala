import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BUSINESS_NAME, WHATSAPP_NUMBER, PHONE_NUMBER } from '@/lib/types';
import Seo from '@/components/seo/Seo';

const ShippingPolicy = () => {
  return (
    <>
      <Seo
        title={`Shipping Policy – ${BUSINESS_NAME}`}
        description={`Shipping policy for ${BUSINESS_NAME}. Learn about delivery timelines, charges, and shipping details.`}
        path="/shipping-policy"
      />
      <Header />
      <main className="container py-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Shipping Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: 1 March 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Delivery Timelines</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Standard delivery takes <strong>5–7 working days</strong> from the date of order confirmation.</li>
              <li>Orders placed before the daily cut-off time (displayed on the product page) are processed the same day.</li>
              <li>Orders placed after cut-off time are processed the next working day.</li>
              <li>Delivery timelines may vary for remote or rural areas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Delivery Charges</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Delivery charges are calculated and displayed at checkout based on your delivery address.</li>
              <li>When the delivery charge is set to ₹0, shipping is <strong>Free</strong>.</li>
              <li>The final amount shown at checkout includes product price + applicable delivery charge.</li>
              <li>Delivery charges may vary based on admin-configured settings and are subject to change.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Order Processing</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Since all products are custom-printed, your uploaded design is reviewed before production begins.</li>
              <li>Order status follows: <strong>Pending → Designing → Approved → Printing → Shipped → Completed</strong>.</li>
              <li>You will receive order updates via WhatsApp and email.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Store Pickup</h2>
            <p>
              Store pickup may be available for select orders. If enabled, you can collect your order from our address in <strong>Katihar, Bihar</strong>. 
              Pickup availability is shown during checkout.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Shipping Partners</h2>
            <p>
              We use trusted courier partners to deliver your orders safely. Once shipped, a tracking update will be shared with you via WhatsApp.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Delivery Issues</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>{BUSINESS_NAME} is not liable for delays caused by courier services, weather, or unforeseen events.</li>
              <li>If your order has not been delivered within 10 working days of shipping, please contact us.</li>
              <li>Ensure your shipping address and phone number are correct to avoid delivery failures.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Contact Us</h2>
            <p>
              For shipping-related queries, reach us on WhatsApp at{' '}
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

export default ShippingPolicy;
