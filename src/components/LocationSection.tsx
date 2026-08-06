import { MapPin, Phone, Mail, Clock, Navigation, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NAP, NAP_ADDRESS_LINE } from '@/lib/nap';

interface LocationSectionProps {
  heading?: string;
  subheading?: string;
}

const LocationSection = ({
  heading = 'Visit Our Store in Katihar, Bihar',
  subheading = 'Graphic Wala is a local custom printing studio in Katihar serving customers across all of India.',
}: LocationSectionProps) => (
  <section aria-labelledby="location-heading" className="py-14 border-t">
    <div className="container">
      <div className="max-w-2xl mb-8">
        <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Our Location</p>
        <h2 id="location-heading" className="text-2xl md:text-3xl font-bold mb-3">{heading}</h2>
        <p className="text-muted-foreground">{subheading}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <address className="not-italic space-y-5">
          <div className="flex gap-3">
            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">{NAP.name}</p>
              <p className="text-muted-foreground">{NAP_ADDRESS_LINE}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <a href={`tel:${NAP.phoneE164}`} className="hover:text-primary transition-colors">
              {NAP.phoneDisplay}
            </a>
          </div>
          <div className="flex gap-3">
            <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <a href={`mailto:${NAP.email}`} className="hover:text-primary transition-colors break-all">
              {NAP.email}
            </a>
          </div>
          <div className="flex gap-3">
            <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-muted-foreground">Open daily, {NAP.hours.opens} – {NAP.hours.closes} IST</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild variant="hero">
              <a href={NAP.mapsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="h-4 w-4" /> Get Directions
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href={`https://wa.me/${NAP.whatsapp}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp Us
              </a>
            </Button>
          </div>
        </address>

        <div className="rounded-xl overflow-hidden border bg-muted aspect-[4/3]">
          <iframe
            title={`Map showing ${NAP.name} in ${NAP.addressLocality}, ${NAP.addressRegion}`}
            src={NAP.mapEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  </section>
);

export default LocationSection;
