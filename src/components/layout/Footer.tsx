import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">G</span>
              </div>
              <span className="text-xl font-bold">
                Graphic <span className="text-primary">Wala</span>
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              Your one-stop destination for premium printing products. Quality prints, delivered fast.
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
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-background/70 hover:text-primary text-sm transition-colors">
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
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4">Products</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/products?category=Photo+Frames" className="text-background/70 hover:text-primary text-sm transition-colors">
                  Photo Frames
                </Link>
              </li>
              <li>
                <Link to="/products?category=PVC+Cards" className="text-background/70 hover:text-primary text-sm transition-colors">
                  PVC Cards
                </Link>
              </li>
              <li>
                <Link to="/products?category=ID+Cards" className="text-background/70 hover:text-primary text-sm transition-colors">
                  ID Cards
                </Link>
              </li>
              <li>
                <Link to="/products?category=Visiting+Cards" className="text-background/70 hover:text-primary text-sm transition-colors">
                  Visiting Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <Mail className="h-4 w-4 text-primary" />
                hello@graphicwala.com
              </li>
              <li className="flex items-center gap-3 text-background/70 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                +91 98765 43210
              </li>
              <li className="flex items-start gap-3 text-background/70 text-sm">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                123 Print Street, Design City, India - 110001
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-12 pt-8 text-center">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} Graphic Wala. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
