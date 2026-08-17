// Single source of truth for NAP (Name, Address, Phone) — keep identical to
// the Google Business Profile listing so citations stay consistent.
export const NAP = {
  name: "Graphic Wala",
  legalName: "Graphicwala",
  streetAddress: "Nasirganj, Sabji Mandi, Near Sarfaraz Art",
  addressLocality: "Katihar",
  addressRegion: "Bihar",
  postalCode: "854105",
  addressCountry: "IN",
  phoneDisplay: "+91 62071 42994",
  phoneE164: "+916207142994",
  whatsapp: "916207142994",
  email: "graphicwalaktr@gmail.com",
  latitude: 25.5541,
  longitude: 87.5691,
  hours: { opens: "09:00", closes: "21:00" },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Graphic+Wala+Nasirganj+Sabji+Mandi+Katihar+Bihar+854105",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Nasirganj%20Sabji%20Mandi%20Katihar%20Bihar%20854105&output=embed",
} as const;

export const NAP_ADDRESS_LINE = `${NAP.streetAddress}, ${NAP.addressLocality}, ${NAP.addressRegion} ${NAP.postalCode}, India`;

export const localBusinessJsonLd = (url: string) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://www.graphicwala.com/#localbusiness",
  name: NAP.legalName,
  alternateName: ["Graphic Wala", "GraphicWala", "Graphics Wala", "Graphicswala"],
  url,
  image: "https://www.graphicwala.com/og-square.png",
  logo: "https://www.graphicwala.com/logo.png",
  telephone: NAP.phoneE164,
  email: NAP.email,
  priceRange: "₹99 - ₹2999",
  currenciesAccepted: "INR",
  paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking (Prepaid only)",
  address: {
    "@type": "PostalAddress",
    streetAddress: NAP.streetAddress,
    addressLocality: NAP.addressLocality,
    addressRegion: NAP.addressRegion,
    postalCode: NAP.postalCode,
    addressCountry: NAP.addressCountry,
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: NAP.latitude,
    longitude: NAP.longitude,
  },
  hasMap: NAP.mapsUrl,
  areaServed: { "@type": "Country", name: "India" },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: NAP.hours.opens,
    closes: NAP.hours.closes,
  },
  sameAs: [
    "https://wa.me/916207142994",
    "https://www.instagram.com/graphicwala",
    "https://www.facebook.com/graphicwala",
    "https://www.youtube.com/@graphicwala",
  ],
});
