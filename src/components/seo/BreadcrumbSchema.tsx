import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE = "https://www.graphicwala.com";

// Routes that render their own dynamic BreadcrumbList (product / category pages)
const SELF_MANAGED = [/^\/product\//, /^\/category\//];

// Routes that should never emit breadcrumbs (private / non-indexable)
const EXCLUDED = [/^\/admin/, /^\/share\//, /^\/checkout/, /^\/order-confirmation/, /^\/auth/, /^\/dashboard/];

const LABELS: Record<string, string> = {
  products: "Products",
  cart: "Cart",
  wishlist: "Wishlist",
  about: "About Us",
  contact: "Contact Us",
  "track-order": "Track Order",
  "ai-assistant": "AI Assistant",
  sale: "Sale",
  "privacy-policy": "Privacy Policy",
  "terms-and-conditions": "Terms & Conditions",
  "shipping-policy": "Shipping Policy",
  "refund-policy": "Refund Policy",
};

const titleize = (seg: string) =>
  seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const BreadcrumbSchema = () => {
  const { pathname } = useLocation();

  if (SELF_MANAGED.some((r) => r.test(pathname))) return null;
  if (EXCLUDED.some((r) => r.test(pathname))) return null;

  const segments = pathname.split("/").filter(Boolean);

  const itemListElement = [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE },
    ...segments.map((seg, i) => ({
      "@type": "ListItem",
      position: i + 2,
      name: LABELS[seg] || titleize(decodeURIComponent(seg)),
      item: `${SITE}/${segments.slice(0, i + 1).join("/")}`,
    })),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default BreadcrumbSchema;
