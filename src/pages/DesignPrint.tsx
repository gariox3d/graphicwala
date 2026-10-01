import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageShell, GroupSection, waLink } from '@/components/services/ServiceBlocks';
import { GRAPHIC_DESIGN, BUSINESS_PRINTING, WEDDING_PRINTING } from '@/data/services';

const DesignPrint = () => (
  <PageShell
    title="Graphic Design & Printing in Katihar | Graphic Wala"
    description="Logo, banner, poster, visiting card and wedding card design plus professional printing in Katihar. Design first, approve, then print — delivered across India."
    path="/design-print"
    eyebrow="Design & Print"
    h1="Graphic Design & Printing Services"
    lead="From logo and poster design to visiting cards, banners and wedding cards — we design it, you approve it, we print it."
    actions={
      <Button asChild size="lg" className="rounded-full">
        <a href={waLink('Hello Graphic Wala, I need a design / printing quote.')} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" /> Order on WhatsApp
        </a>
      </Button>
    }
  >
    <GroupSection g={GRAPHIC_DESIGN} />
    <GroupSection g={BUSINESS_PRINTING} alt />
    <GroupSection g={WEDDING_PRINTING} />
  </PageShell>
);

export default DesignPrint;
