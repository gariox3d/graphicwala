import { useLocation } from 'react-router-dom';
import WhatsAppButton from '@/components/WhatsAppButton';

/** Sticky WhatsApp support button shown on every customer-facing page. */
const FloatingWhatsApp = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;

  return (
    <WhatsAppButton
      variant="floating"
      showText={false}
      className="bottom-28 right-4 md:bottom-6 md:right-6"
    />
  );
};

export default FloatingWhatsApp;
