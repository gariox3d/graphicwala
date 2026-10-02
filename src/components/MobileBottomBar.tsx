import { Link, useLocation } from 'react-router-dom';
import { MessageCircle, Phone, ShoppingCart } from 'lucide-react';
import { WHATSAPP_NUMBER, PHONE_NUMBER, BUSINESS_NAME } from '@/lib/types';
import { normalizeIndianPhoneForWhatsApp } from '@/lib/phone';

/** Sticky mobile action bar: WhatsApp / Call / Cart. Hidden on product & admin pages. */
const MobileBottomBar = () => {
  const location = useLocation();

  const hidden =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/product/') ||
    location.pathname.startsWith('/checkout');
  if (hidden) return null;

  const wa = `https://wa.me/${normalizeIndianPhoneForWhatsApp(WHATSAPP_NUMBER)}?text=${encodeURIComponent(
    `Hello ${BUSINESS_NAME}, I want to place an order.`,
  )}`;

  const cls =
    'flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-bold text-foreground active:bg-muted';

  return (
    <nav
      aria-label="Quick actions"
      className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-3 border-t border-border bg-background/95 backdrop-blur md:hidden"
    >
      <a href={wa} target="_blank" rel="noopener noreferrer" className={cls}>
        <MessageCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
        WhatsApp
      </a>
      <a href={`tel:${PHONE_NUMBER}`} className={`${cls} border-x border-border`}>
        <Phone className="h-5 w-5 text-primary" aria-hidden="true" />
        Call
      </a>
      <Link to="/design-print" className={cls}>
        <ShoppingCart className="h-5 w-5 text-foreground" aria-hidden="true" />
        Order Now
      </Link>
    </nav>
  );
};

export default MobileBottomBar;