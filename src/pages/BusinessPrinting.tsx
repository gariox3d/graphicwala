import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageShell, GroupSection, waLink } from '@/components/services/ServiceBlocks';
import { BUSINESS_PRINTING } from '@/data/services';

const BusinessPrinting = () => (
  <PageShell
    title="Business Printing in Katihar — Visiting Cards, Bill Books, Banners | Graphic Wala"
    description="Visiting cards, letterheads, bill books, pamphlets, stickers and banners for shops and companies in Katihar. Design support included."
    path="/business-printing"
    eyebrow="Business Printing & Branding"
    h1="Everything Your Business Needs to Look Professional"
    lead="Stationery, promotional print and branding material for shops, offices, schools and companies — designed and printed under one roof."
    actions={
      <>
        <Button asChild size="lg" className="rounded-full">
          <Link to="/contact?service=Business%20Printing">Get a Business Quote</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <a href={waLink('Hello Graphic Wala, I need business printing.')} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> WhatsApp Us
          </a>
        </Button>
      </>
    }
  >
    <GroupSection g={BUSINESS_PRINTING} />
  </PageShell>
);

export default BusinessPrinting;
