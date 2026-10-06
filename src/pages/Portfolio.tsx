import { lazy, Suspense } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageShell, waLink } from '@/components/services/ServiceBlocks';

const CustomerGallery = lazy(() => import('@/components/CustomerGallery'));
const BeforeAfterShowcase = lazy(() => import('@/components/BeforeAfterShowcase'));
const PortfolioGallery = lazy(() => import('@/components/PortfolioGallery'));

const Portfolio = () => (
  <PageShell
    title="Portfolio | Design & Printing Work by Graphic Wala, Katihar"
    description="See real design, printing, photo editing and custom gift work completed by Graphic Wala for customers across India."
    path="/portfolio"
    eyebrow="Portfolio"
    h1="Our Recent Work"
    lead="Real orders from real customers: designs, prints, photo edits and personalised products."
    actions={
      <Button asChild size="lg" className="rounded-full">
        <a href={waLink('Hello Graphic Wala, I saw your portfolio and want a similar design.')} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" /> Get Something Similar
        </a>
      </Button>
    }
  >
    <Suspense fallback={<div className="min-h-[300px]" />}>
      <PortfolioGallery />
      <BeforeAfterShowcase />
      <CustomerGallery />
    </Suspense>
  </PageShell>
);

export default Portfolio;
