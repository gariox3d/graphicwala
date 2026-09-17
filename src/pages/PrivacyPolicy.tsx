import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { BUSINESS_NAME, WHATSAPP_NUMBER, PHONE_NUMBER } from '@/lib/types';
import Seo from '@/components/seo/Seo';

const PrivacyPolicy = () => {
  return (
    <>
      <Seo
        title={`Privacy Policy – ${BUSINESS_NAME}`}
        description={`Read the privacy policy of ${BUSINESS_NAME}. Learn how we collect, use, and protect your personal information.`}
        path="/privacy-policy"
      />
      <Header />
      <main className="container py-10 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: 1 March 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
            <p>When you use {BUSINESS_NAME}, we may collect the following information:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Personal details:</strong> Name, phone number, email address, and shipping address provided during checkout.</li>
              <li><strong>Photos & designs:</strong> Images you upload for customisation of products (e.g. photo frames, PVC cards, keychains).</li>
              <li><strong>Order data:</strong> Products ordered, payment status, and delivery details.</li>
              <li><strong>Device info:</strong> Browser type, screen size, and IP address collected automatically for analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>To process and fulfil your orders.</li>
              <li>To print your custom designs on ordered products.</li>
              <li>To communicate order updates via WhatsApp, email, or phone.</li>
              <li>To improve our website experience and product offerings.</li>
              <li>To send promotional offers (only if you opt in).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Photo & Design Privacy</h2>
            <p>
              Your uploaded photos and designs are used <strong>solely</strong> for fulfilling your order. We do not share, sell, or publicly display your images. 
              Photos are automatically deleted from our servers after order completion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Data Sharing</h2>
            <p>We do <strong>not</strong> sell your personal information. We may share limited data with:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Delivery partners:</strong> Name, address, and phone number to ship your order.</li>
              <li><strong>Payment gateways:</strong> Razorpay processes payments securely; we do not store card details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Cookies & Analytics</h2>
            <p>
              We use cookies and local storage to remember your cart, preferences, and recently viewed products.
              We also use analytics cookies to understand which pages are popular so we can improve them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Advertising & Third-Party Cookies</h2>
            <p>
              This website displays advertising served by Google, including Google AdSense. Third-party
              vendors, including Google, use cookies to serve ads based on your prior visits to this
              website or other websites.
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to this and/or other sites on the internet.</li>
              <li>
                You may opt out of personalised advertising by visiting{' '}
                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Ads Settings</a>, or opt out of third-party vendor cookies at{' '}
                <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary underline">aboutads.info</a>.
              </li>
              <li>We never share your uploaded photos, designs or order details with advertising partners.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Data Security</h2>
            <p>
              We use industry-standard encryption (HTTPS) and secure cloud storage to protect your data. 
              However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">8. Your Rights</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Request access to your personal data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Opt out of promotional messages at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">9. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, reach us on WhatsApp at{' '}
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

export default PrivacyPolicy;
