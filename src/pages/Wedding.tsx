import { ExternalLink, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageShell, GroupSection, ServiceGrid, waLink } from '@/components/services/ServiceBlocks';
import { WEDDING_PRINTING, WEDDING_EXTRAS, INVITES_URL } from '@/data/services';

const Wedding = () => (
  <PageShell
    title="Wedding Card Printing & Invitations in Katihar | Graphic Wala"
    description="Wedding cards, invitation designs, posters, banners, couple frames and digital wedding invitations by Graphic Wala, Katihar."
    path="/wedding"
    eyebrow="Wedding"
    h1="Wedding Cards, Invitations & Keepsakes"
    lead="Printed cards, digital and video invitations, venue posters and personalised gifts for the couple."
    actions={
      <>
        <Button asChild size="lg" className="rounded-full">
          <a href={INVITES_URL} target="_blank" rel="noopener noreferrer">
            Explore Digital Wedding Invitations <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full">
          <a href={waLink('Hello Graphic Wala, I need wedding cards.')} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" /> Order on WhatsApp
          </a>
        </Button>
      </>
    }
  >
    <GroupSection g={WEDDING_PRINTING} />
    <section className="bg-secondary py-12 md:py-16" aria-labelledby="wed-more">
      <div className="container">
        <h2 id="wed-more" className="mb-8 text-2xl md:text-3xl font-black tracking-tight">Digital Invitations & Gifts</h2>
        <ServiceGrid items={WEDDING_EXTRAS} />
      </div>
    </section>
  </PageShell>
);

export default Wedding;
