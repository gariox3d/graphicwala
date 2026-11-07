import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { WHATSAPP_NUMBER, PHONE_NUMBER, BUSINESS_NAME } from '@/lib/types';
import logoImage from '@/assets/brand/graphicwala-logo-wide.png.asset.json';

const Footer = () => {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${BUSINESS_NAME}, I have a question.`)}`;

  return (
    <footer className="bg-foreground text-background pb-16 md:pb-0">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center mb-4 rounded-md bg-background px-3 py-2">
              <img
                src={logoImage.url}
                alt="Graphicwala logo"
                className="h-12 w-auto max-w-[220px] object-contain"
              />
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
               Graphicwala (also known as Graphic Wala, Graphics Wala, Graphicswala or Graphics Waale) — custom photo frames, PVC cards, keychains and personalized gifts with All India delivery.
            </p>
            <p className="text-background/60 text-xs mt-3">
              Prepaid orders only · UPI, Card & Netbanking accepted · Custom printed in Katihar, Bihar and shipped across India.
            </p>
            <p className="text-background/50 text-xs mt-2">
              Official website: graphicwala.com
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-background/70 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/70 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                 <Link to="/category/photo-frame" className="text-background/70 hover:text-primary text-sm transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-background/70 hover:text-primary text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/70 hover:text-primary text-sm transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-background/70 hover:text-primary text-sm transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="text-background/70 hover:text-primary text-sm transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-background/70 hover:text-primary text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="text-background/70 hover:text-primary text-sm transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-background/70 hover:text-primary text-sm transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-background/70 hover:text-primary text-sm transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-3">
              <li>
                 <Link to="/category/pvc-card" className="text-background/70 hover:text-primary text-sm transition-colors">
                  Photo Frames
                </Link>
              </li>
              <li>
                 <Link to="/category/id-card" className="text-background/70 hover:text-primary text-sm transition-colors">
                  PVC Cards
                </Link>
              </li>
              <li>
                 <Link to="/category/visiting-card" className="text-background/70 hover:text-primary text-sm transition-colors">
                  ID Cards
                </Link>
              </li>
              <li>
                 <Link to="/category/keychain" className="text-background/70 hover:text-primary text-sm transition-colors">
                  Visiting Cards
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-background/70 hover:text-primary text-sm transition-colors">
                  Keychains
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-background/70 hover:text-green-400 text-sm transition-colors"
                >
                  <MessageCircle className="h-4 w-4 text-green-400" />
                  Chat on WhatsApp
                </a>
              </li>
              <li>
                <a 
                  href={`tel:${PHONE_NUMBER}`}
                  className="flex items-center gap-3 text-background/70 hover:text-primary text-sm transition-colors"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  {PHONE_NUMBER}
                </a>
              </li>
              <li className="flex items-center gap-3 text-background/70 text-sm min-w-0">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="break-all">graphicwalaktr@gmail.com</span>
              </li>
              <li className="flex items-start gap-3 text-background/70 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                Katihar, Bihar, India
              </li>
            </ul>

            {/* WhatsApp & Call Buttons */}
            <div className="flex flex-wrap gap-2 mt-6">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 text-center">
          <p className="text-background/50 text-sm">
             © {new Date().getFullYear()} Graphicwala. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
